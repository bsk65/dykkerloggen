import { emptyDiveForm, formToDive } from './diveForm'
import { nextDiveNumber } from './diveSites'
import { startMinutes } from './nitrogen'
import type { UddfDive } from './uddf'
import type { Dive, DiveData, DiveProfile, ProfileSummary } from '../types'

/** Et nyt dyk, der skal oprettes. */
export type NewImportDive = { data: DiveData; profile: DiveProfile | null; docId: string | null }
/** Et dyk, der allerede er logget, og som får profilen (og tomme felter udfyldt). */
export type LinkImportDive = {
  dive: Dive
  patch: Partial<DiveData>
  profile: DiveProfile
}
/** Hvad en import vil gøre — vises, før der gemmes. */
export type ImportPlan = {
  found: number
  newDives: NewImportDive[]
  links: LinkImportDive[]
  /** Dyk, der allerede er importeret */
  duplicates: number
}

/** Et dyk regnes for det samme, hvis det startede inden for så mange minutter. */
const SAME_DIVE_MIN = 30

function summary(u: UddfDive): ProfileSummary {
  return {
    computer: u.computer,
    samples: u.profile.t.length,
    gfLow: u.gfLow,
    gfHigh: u.gfHigh,
    decoRequired: u.decoRequired,
    maxCns: u.maxCns,
  }
}

/** Dokument-id for et importeret computerdyk — så det aldrig kan ligge der to gange. */
export function computerDocId(u: UddfDive): string {
  return `uddf-${u.id.replace(/[^A-Za-z0-9_-]/g, '_')}`
}

/** Felterne fra computeren. */
function computerFields(u: UddfDive): Partial<DiveData> {
  return {
    entryTime: u.entryTime,
    diveTimeMin: u.diveTimeMin,
    maxDepthM: u.maxDepthM,
    avgDepthM: u.avgDepthM,
    waterTempC: u.minTempC,
    nitrox: u.o2Percent > 21,
    o2Percent: u.o2Percent > 21 ? u.o2Percent : null,
    startBar: u.startBar,
    endBar: u.endBar,
    siteName: u.siteName ?? undefined,
    region: u.region,
    lat: u.lat,
    lng: u.lng,
    waterType: u.salt === null ? undefined : u.salt ? 'salt' : 'fresh',
  }
}

/** Et nyt dyk ud fra computerens data. */
export function uddfToDive(u: UddfDive, diveNumber: number): DiveData {
  const base = formToDive(emptyDiveForm(diveNumber))
  const fields = Object.fromEntries(
    Object.entries(computerFields(u)).filter(([, v]) => v !== undefined),
  ) as Partial<DiveData>
  return {
    ...base,
    ...fields,
    date: u.date,
    siteName: u.siteName ?? '',
    entry: null,
    deco: u.decoRequired,
    sitePhotoPath: null,
    logbookImages: [],
    source: 'computer',
    ssiId: null,
    computerDiveId: u.id,
    profile: summary(u),
  }
}

/** Udfylder kun felter, der er tomme i det loggede dyk — brugerens egne tal bevares. */
function fillEmpty(dive: Dive, u: UddfDive): Partial<DiveData> {
  const patch: Partial<DiveData> = { computerDiveId: u.id, profile: summary(u) }
  for (const [key, value] of Object.entries(computerFields(u)) as [keyof DiveData, unknown][]) {
    if (value === undefined || value === null) continue
    const current = dive[key]
    if (current === null || current === '') (patch as Record<string, unknown>)[key] = value
  }
  // Nitrox: kun hvis dykket ikke selv har gasoplysninger.
  if (dive.o2Percent !== null || dive.nitrox) {
    delete patch.nitrox
    delete patch.o2Percent
  }
  if (u.decoRequired && !dive.deco) patch.deco = true
  return patch
}

/** Findes dykket allerede i loggen (samme dato og starttid, eller samme dato og dybde)? */
function findLogged(u: UddfDive, dives: Dive[], taken: Set<string>): Dive | undefined {
  const start = startMinutes(u)
  return dives.find((d) => {
    if (taken.has(d.id) || d.date !== u.date || d.computerDiveId) return false
    const other = startMinutes(d)
    if (start !== null && other !== null) return Math.abs(start - other) <= SAME_DIVE_MIN
    return d.maxDepthM !== null && Math.abs(d.maxDepthM - u.maxDepthM) <= 2
  })
}

/** Planlægger importen af computerdyk: nye dyk, profiler til loggede dyk og dubletter. */
export function planUddfImport(dives: UddfDive[], existing: Dive[]): ImportPlan {
  const known = new Set(existing.map((d) => d.computerDiveId).filter(Boolean))
  const taken = new Set<string>()
  const plan: ImportPlan = { found: dives.length, newDives: [], links: [], duplicates: 0 }
  let number = nextDiveNumber(existing)
  const sorted = [...dives].sort((a, b) => (startMinutes(a) ?? 0) - (startMinutes(b) ?? 0))
  for (const u of sorted) {
    if (known.has(u.id)) {
      plan.duplicates++
      continue
    }
    const logged = findLogged(u, existing, taken)
    if (logged) {
      taken.add(logged.id)
      plan.links.push({ dive: logged, patch: fillEmpty(logged, u), profile: u.profile })
    } else {
      plan.newDives.push({
        data: uddfToDive(u, number++),
        profile: u.profile,
        docId: computerDocId(u),
      })
    }
  }
  return plan
}
