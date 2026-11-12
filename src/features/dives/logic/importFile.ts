import { OPTION_LISTS, type OptionListName } from '../options'
import type { Dive, DiveData } from '../types'

/**
 * Importfil med dyk (f.eks. hentet fra SSI's logbog). Formatet:
 * `{ "format": "dykkerloggen-import", "version": 1, "dives": [DiveData, ...] }`.
 * Manglende felter får standardværdier; ugyldige værdier i valglister bliver null.
 */
export const IMPORT_FORMAT = 'dykkerloggen-import'

export class ImportFileError extends Error {}

const NUMBER_FIELDS = [
  'diveNumber',
  'lat',
  'lng',
  'airTempC',
  'waterTempC',
  'surfaceTempC',
  'visibilityM',
  'diveTimeMin',
  'maxDepthM',
  'avgDepthM',
  'weightKg',
  'o2Percent',
  'tankVolumeL',
  'startBar',
  'endBar',
  'decoTimeMin',
  'decoTankVolumeL',
  'decoO2Percent',
  'decoStartBar',
  'decoEndBar',
] as const satisfies readonly (keyof DiveData)[]

const TEXT_FIELDS = [
  'entryTime',
  'instructor',
  'center',
  'country',
  'region',
  'gearDetails',
  'comment',
  'ssiId',
] as const satisfies readonly (keyof DiveData)[]

const BOOLEAN_FIELDS = [
  'nitrox',
  'deco',
  'decoGasUsed',
] as const satisfies readonly (keyof DiveData)[]

/** Valglistefelter og den liste, de skal findes i. */
const OPTION_FIELDS = {
  purpose: 'purpose',
  specialty: 'specialty',
  waterBody: 'waterBody',
  entry: 'entry',
  waterType: 'waterType',
  current: 'current',
  surface: 'surface',
  weather: 'weather',
  gearConfig: 'gearConfig',
  tankMaterial: 'tankMaterial',
  decoTankMaterial: 'tankMaterial',
} as const satisfies Partial<Record<keyof DiveData, OptionListName>>

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function asText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
}

function asOption(value: unknown, list: OptionListName): string | null {
  return typeof value === 'string' && (OPTION_LISTS[list] as readonly string[]).includes(value)
    ? value
    : null
}

/** Ét dyk fra filen → DiveData, eller null hvis dato eller sted mangler. */
export function normalizeImportedDive(raw: unknown): DiveData | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  const date = typeof r.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.date) ? r.date : null
  const siteName = asText(r.siteName)
  if (!date || !siteName) return null

  const dive: Record<string, unknown> = {
    date,
    siteName,
    diveKind: asOption(r.diveKind, 'diveKind') ?? 'scuba',
    buddies: Array.isArray(r.buddies) ? r.buddies.map(asText).filter((b) => b !== null) : [],
    rating: typeof r.rating === 'number' ? Math.min(5, Math.max(0, Math.round(r.rating))) : 0,
    sitePhotoPath: null,
    logbookImages: [],
    computerDiveId: null,
    profile: null,
    source: r.source === 'app' ? 'app' : 'ssi',
  }
  for (const key of NUMBER_FIELDS) dive[key] = asNumber(r[key])
  for (const key of TEXT_FIELDS) dive[key] = asText(r[key])
  for (const key of BOOLEAN_FIELDS) dive[key] = r[key] === true
  for (const [key, list] of Object.entries(OPTION_FIELDS)) dive[key] = asOption(r[key], list)
  return dive as DiveData
}

/** Læser filens tekst. Kaster ImportFileError, hvis det ikke er en importfil. */
export function parseImportFile(text: string): DiveData[] {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new ImportFileError('not-json')
  }
  const file = data as { format?: unknown; dives?: unknown }
  if (file?.format !== IMPORT_FORMAT || !Array.isArray(file.dives)) {
    throw new ImportFileError('wrong-format')
  }
  return file.dives.map(normalizeImportedDive).filter((d) => d !== null)
}

/** Kun dyk, der ikke allerede findes (samme SSI-id) — så en import kan køres igen uden dubletter. */
export function onlyNewDives(imported: DiveData[], existing: Dive[]): DiveData[] {
  const known = new Set(existing.map((d) => d.ssiId).filter((id) => id !== null))
  return imported.filter((d) => d.ssiId === null || !known.has(d.ssiId))
}
