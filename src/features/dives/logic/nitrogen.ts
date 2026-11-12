import {
  AIR_N2,
  ASCENT_M_PER_MIN,
  BAR_PER_M,
  DESCENT_M_PER_MIN,
  SURFACE_BAR,
  canSurface,
  ceilingBar,
  decoAscent,
  noDecoMinutes,
  saturationPercent,
  segment,
  surfaceTissues,
  type DecoStop,
  type GradientFactors,
  type Tissues,
} from './buhlmann'
import type { Dive, DiveProfile } from '../types'

/** Indstillinger for, hvor forsigtigt der regnes (gradient factors). */
export const GF_PRESETS = {
  conservative: { low: 0.3, high: 0.7 },
  standard: { low: 0.4, high: 0.85 },
  liberal: { low: 0.5, high: 0.9 },
} as const satisfies Record<string, GradientFactors>
export type GfPreset = keyof typeof GF_PRESETS
export const DEFAULT_GF_PRESET: GfPreset = 'standard'
export const GF_PRESET_KEYS = Object.keys(GF_PRESETS) as GfPreset[]

/** Antaget sikkerhedsstop ved dyk uden deko: 3 min på 5 m. */
export const SAFETY_STOP = { depthM: 5, minutes: 3 }
/** Dyk, der sluttede mere end så længe før, regnes ikke med (kvælstoffet er væk). */
const REPETITIVE_WINDOW_MIN = 48 * 60

type DiveInput = Pick<
  Dive,
  | 'id'
  | 'date'
  | 'entryTime'
  | 'diveKind'
  | 'maxDepthM'
  | 'diveTimeMin'
  | 'nitrox'
  | 'o2Percent'
  | 'waterType'
  | 'deco'
  | 'decoTimeMin'
>

export type NitrogenResult =
  | { status: 'missing' }
  | { status: 'unsupported' }
  | {
      status: 'ok'
      /** 'profile' = beregnet på computerens rigtige profil, 'estimate' = firkantet skøn */
      basis: 'profile' | 'estimate'
      /** Dybeste krævede stop (m, i trin af 3 m) undervejs ifølge modellen — kun med profil */
      maxCeilingM: number
      /** Antaget tid på maks. dybde (kun skøn) */
      bottomMin: number
      /** Minutter til dekogrænsen ved bundtidens slut (0 = ved eller over grænsen) */
      noDecoMin: number
      /** Beregnede dekostop (tom ved dyk uden deko — også lige på grænsen) */
      decoStops: DecoStop[]
      /** Hvert vævs mætning i procent af grænsen, lige efter opstigningen */
      surfaceSaturation: number[]
      /** Det højeste af dem (overflade-GF) */
      surfaceGf: number
      /** Det mest mættede væv (0-baseret) */
      leadingTissue: number
      /**
       * Restkvælstof ved dykkets start: hvor mange procent mere kvælstof det
       * mest belastede væv havde end hos en, der har været på land længe.
       */
      residualPercent: number
      /** Minutter til dekogrænsen, hvis der ikke havde været tidligere dyk */
      noDecoMinFresh: number
      /** Tidligere dyk, der er regnet med */
      previousDives: number
      /** Overfladeintervallet før dette dyk (min), når der er tidligere dyk */
      surfaceIntervalMin: number | null
      /** Dyk inden for 48 timer, der ikke kunne regnes med (mangler klokkeslæt/dybde/tid) */
      skippedDives: number
      gf: GradientFactors
    }

/** Kan dykket beregnes? Kun åbent kredsløb (flaske) med dybde og tid. */
function usable(dive: DiveInput): 'ok' | 'missing' | 'unsupported' {
  if (dive.diveKind !== 'scuba' && dive.diveKind !== 'xr') return 'unsupported'
  if (!dive.maxDepthM || !dive.diveTimeMin || dive.maxDepthM <= 0 || dive.diveTimeMin <= 0) {
    return 'missing'
  }
  return 'ok'
}

function nitrogenFraction(dive: DiveInput): number {
  if (dive.nitrox && dive.o2Percent && dive.o2Percent > 21 && dive.o2Percent <= 100) {
    return 1 - dive.o2Percent / 100
  }
  return AIR_N2
}

/** Midnat på dykkets dato i minutter (lokal tid). */
function dayStartMinutes(date: string): number {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).getTime() / 60000
}

/** Starttidspunkt i minutter (lokal tid) — null uden klokkeslæt. */
export function startMinutes(dive: Pick<Dive, 'date' | 'entryTime'>): number | null {
  if (!dive.entryTime || !/^\d{1,2}:\d{2}$/.test(dive.entryTime)) return null
  const [hh, mm] = dive.entryTime.split(':').map(Number)
  return dayStartMinutes(dive.date) + hh * 60 + mm
}

type Simulated = {
  tissues: Tissues
  bottomMin: number
  noDecoMin: number
  decoStops: DecoStop[]
}

/**
 * Ét dyk som "firkantet" profil: ned med 18 m/min, hele bundtiden på maks.
 * dybde, op med 9 m/min — med sikkerhedsstop eller de dekostop, modellen
 * kræver. Bundtiden er dyktiden minus ned-/opstigning og stop.
 */
function simulateDive(start: Tissues, dive: DiveInput, gf: GradientFactors): Simulated {
  const depth = dive.maxDepthM ?? 0
  const time = dive.diveTimeMin ?? 0
  const fN2 = nitrogenFraction(dive)
  const barPerM = BAR_PER_M[dive.waterType === 'fresh' ? 'fresh' : 'salt']
  const descent = depth / DESCENT_M_PER_MIN
  const ascent = depth / ASCENT_M_PER_MIN
  const reserved =
    dive.deco && dive.decoTimeMin
      ? dive.decoTimeMin
      : depth > SAFETY_STOP.depthM
        ? SAFETY_STOP.minutes
        : 0
  const bottomMin = Math.max(0, time - descent - ascent - reserved)

  let t = segment(start, 0, depth, descent, fN2, barPerM)
  t = segment(t, depth, depth, bottomMin, fN2, barPerM)
  const noDecoMin = noDecoMinutes(t, depth, fN2, barPerM, gf)

  if (noDecoMin === 0) {
    const deco = decoAscent(t, depth, fN2, barPerM, gf)
    // Lige på grænsen: opstigningen alene er nok, så det regnes som et dyk uden deko.
    if (deco.stops.length > 0) {
      return { tissues: deco.tissues, bottomMin, noDecoMin, decoStops: deco.stops }
    }
  }
  if (depth > SAFETY_STOP.depthM) {
    const stop = SAFETY_STOP.depthM
    t = segment(t, depth, stop, (depth - stop) / ASCENT_M_PER_MIN, fN2, barPerM)
    t = segment(t, stop, stop, SAFETY_STOP.minutes, fN2, barPerM)
    t = segment(t, stop, 0, stop / ASCENT_M_PER_MIN, fN2, barPerM)
  } else {
    t = segment(t, depth, 0, depth / ASCENT_M_PER_MIN, fN2, barPerM)
  }
  return { tissues: t, bottomMin, noDecoMin, decoStops: [] }
}

/**
 * Den rigtige profil fra dykkercomputeren, måling for måling. Giver laveste
 * tid til dekogrænsen undervejs og det dybeste loft (dekoforpligtelse).
 */
function simulateProfile(
  start: Tissues,
  dive: DiveInput,
  profile: DiveProfile,
  gf: GradientFactors,
): { tissues: Tissues; minNoDecoMin: number; maxCeilingM: number } {
  const barPerM = BAR_PER_M[dive.waterType === 'fresh' ? 'fresh' : 'salt']
  const fN2At = (sec: number) => {
    let o2 = profile.gas[0]?.o2 ?? 21
    for (const g of profile.gas) if (g.t <= sec) o2 = g.o2
    return 1 - o2 / 100
  }
  let t = start
  let minNoDecoMin = 180
  let maxCeilingM = 0
  let lastCheck = -Infinity
  const { t: times, d: depths } = profile
  for (let i = 1; i < times.length; i++) {
    const minutes = (times[i] - times[i - 1]) / 60
    if (minutes <= 0) continue
    const fN2 = fN2At(times[i - 1])
    t = segment(t, depths[i - 1], depths[i], minutes, fN2, barPerM)
    if (!canSurface(t, gf)) {
      minNoDecoMin = 0
      const ceilingM = (ceilingBar(t, gf.high) - SURFACE_BAR) / barPerM
      maxCeilingM = Math.max(maxCeilingM, ceilingM)
    } else if (depths[i] >= 3 && times[i] - lastCheck >= 60 && minNoDecoMin > 0) {
      lastCheck = times[i]
      minNoDecoMin = Math.min(
        minNoDecoMin,
        noDecoMinutes(t, depths[i], fN2, barPerM, gf, minNoDecoMin),
      )
    }
  }
  const last = depths[depths.length - 1]
  if (last > 0) {
    t = segment(t, last, 0, last / ASCENT_M_PER_MIN, fN2At(times[times.length - 1]), barPerM)
  }
  return {
    tissues: t,
    minNoDecoMin,
    maxCeilingM: maxCeilingM > 0 ? Math.ceil(maxCeilingM / 3) * 3 : 0,
  }
}

/** Overfladetid i luft. */
function surfaceInterval(tissues: Tissues, minutes: number): Tissues {
  return segment(tissues, 0, 0, Math.max(0, minutes), AIR_N2, BAR_PER_M.salt)
}

/**
 * Kvælstofberegning for ét dyk — med restkvælstof fra dyk inden for de
 * foregående 48 timer, når klokkeslættene er kendt.
 */
export function nitrogenForDive(
  dive: DiveInput,
  allDives: DiveInput[],
  gf: GradientFactors,
  profile: DiveProfile | null = null,
): NitrogenResult {
  const state = usable(dive)
  if (state !== 'ok') return { status: state }

  const start = startMinutes(dive)
  let tissues = surfaceTissues()
  let previousDives = 0
  let skippedDives = 0
  let surfaceIntervalMin: number | null = null

  const others = allDives.filter((d) => d.id !== dive.id)
  if (start === null) {
    // Uden klokkeslæt kendes rækkefølgen ikke: dyk samme dag kan ikke regnes med.
    skippedDives = others.filter((d) => d.date === dive.date).length
  } else {
    const earlier: { dive: DiveInput; start: number }[] = []
    for (const other of others) {
      const otherStart = startMinutes(other)
      if (otherStart === null) {
        // Samme dag eller dagen før, uden klokkeslæt: kan ikke placeres.
        const dayGap = (dayStartMinutes(dive.date) - dayStartMinutes(other.date)) / 1440
        if (dayGap >= 0 && dayGap <= 2) skippedDives++
        continue
      }
      const end = otherStart + (other.diveTimeMin ?? 0)
      if (otherStart >= start || start - end > REPETITIVE_WINDOW_MIN) continue
      if (usable(other) !== 'ok') {
        if (usable(other) === 'missing') skippedDives++
        continue
      }
      earlier.push({ dive: other, start: otherStart })
    }
    earlier.sort((a, b) => a.start - b.start)
    let lastEnd: number | null = null
    for (const prev of earlier) {
      if (lastEnd !== null) tissues = surfaceInterval(tissues, prev.start - lastEnd)
      tissues = simulateDive(tissues, prev.dive, gf).tissues
      lastEnd = prev.start + (prev.dive.diveTimeMin ?? 0)
    }
    if (lastEnd !== null) {
      surfaceIntervalMin = Math.max(0, start - lastEnd)
      tissues = surfaceInterval(tissues, surfaceIntervalMin)
    }
    previousDives = earlier.length
  }

  const rested = surfaceTissues()
  const residualPercent = Math.max(0, ...tissues.map((p, i) => ((p - rested[i]) / rested[i]) * 100))
  const run = (from: Tissues) => {
    if (!profile || profile.t.length < 2) return { ...simulateDive(from, dive, gf), maxCeilingM: 0 }
    const p = simulateProfile(from, dive, profile, gf)
    return {
      tissues: p.tissues,
      bottomMin: 0,
      noDecoMin: p.minNoDecoMin,
      decoStops: [],
      maxCeilingM: p.maxCeilingM,
    }
  }
  const result = run(tissues)
  const noDecoMinFresh = previousDives > 0 ? run(rested).noDecoMin : result.noDecoMin
  const surfaceSaturation = saturationPercent(result.tissues, SURFACE_BAR)
  const surfaceGf = Math.max(...surfaceSaturation)
  return {
    status: 'ok',
    basis: profile && profile.t.length >= 2 ? 'profile' : 'estimate',
    maxCeilingM: result.maxCeilingM,
    bottomMin: result.bottomMin,
    noDecoMin: result.noDecoMin,
    decoStops: result.decoStops,
    surfaceSaturation,
    surfaceGf,
    leadingTissue: surfaceSaturation.indexOf(surfaceGf),
    residualPercent,
    noDecoMinFresh,
    previousDives,
    surfaceIntervalMin,
    skippedDives,
    gf,
  }
}
