/**
 * Bühlmann ZHL-16C (kvælstof) med gradient factors — den model, de fleste
 * dykkercomputere bygger på. Ren beregning uden app-afhængigheder.
 *
 * Bruges KUN til at forstå et logget dyk bagefter, aldrig til planlægning.
 */

/** Lufttryk ved havniveau i bar. */
export const SURFACE_BAR = 1.01325
/** Vanddamptryk i lungerne (37 °C) i bar. */
const WATER_VAPOUR_BAR = 0.0627
/** Kvælstofandel i luft (som i Bühlmanns egne tabeller). */
export const AIR_N2 = 0.7902

/** Tryk pr. meter vanddybde i bar. */
export const BAR_PER_M = { salt: 0.10052, fresh: 0.09807 } as const

/** De 16 vævstyper: halveringstid (min) og a/b-koefficienter (ZHL-16C, kvælstof, 1b). */
export const COMPARTMENTS = [
  { halfTime: 5.0, a: 1.1696, b: 0.5578 },
  { halfTime: 8.0, a: 1.0, b: 0.6514 },
  { halfTime: 12.5, a: 0.8618, b: 0.7222 },
  { halfTime: 18.5, a: 0.7562, b: 0.7825 },
  { halfTime: 27.0, a: 0.62, b: 0.8126 },
  { halfTime: 38.3, a: 0.5043, b: 0.8434 },
  { halfTime: 54.3, a: 0.441, b: 0.8693 },
  { halfTime: 77.0, a: 0.4, b: 0.891 },
  { halfTime: 109.0, a: 0.375, b: 0.9092 },
  { halfTime: 146.0, a: 0.35, b: 0.9222 },
  { halfTime: 187.0, a: 0.3295, b: 0.9319 },
  { halfTime: 239.0, a: 0.3065, b: 0.9403 },
  { halfTime: 305.0, a: 0.2835, b: 0.9477 },
  { halfTime: 390.0, a: 0.261, b: 0.9544 },
  { halfTime: 498.0, a: 0.248, b: 0.9602 },
  { halfTime: 635.0, a: 0.2327, b: 0.9653 },
] as const

/** Kvælstoftrykket i hvert af de 16 væv (bar). */
export type Tissues = number[]

/** Vævene hos en, der har været på land længe (mættet med luft ved havniveau). */
export function surfaceTissues(): Tissues {
  return COMPARTMENTS.map(() => (SURFACE_BAR - WATER_VAPOUR_BAR) * AIR_N2)
}

/** Omgivende tryk ved en dybde. */
export function ambientBar(depthM: number, barPerM: number): number {
  return SURFACE_BAR + depthM * barPerM
}

/**
 * Optag/afgiv kvælstof under ét afsnit af dykket — fra én dybde til en anden
 * med jævn hastighed (eller på samme dybde). Schreiner-ligningen; giver det
 * præcise resultat uanset afsnittets længde.
 */
export function segment(
  tissues: Tissues,
  fromM: number,
  toM: number,
  minutes: number,
  fN2: number,
  barPerM: number,
): Tissues {
  if (minutes <= 0) return tissues
  const inspired0 = (ambientBar(fromM, barPerM) - WATER_VAPOUR_BAR) * fN2
  const rate = (((toM - fromM) * barPerM) / minutes) * fN2
  return tissues.map((p0, i) => {
    const k = Math.LN2 / COMPARTMENTS[i].halfTime
    return (
      inspired0 + rate * (minutes - 1 / k) - (inspired0 - p0 - rate / k) * Math.exp(-k * minutes)
    )
  })
}

/** Det laveste omgivende tryk (bar), vævene tåler med en given gradient factor (0–1). */
export function ceilingBar(tissues: Tissues, gf: number): number {
  let ceiling = 0
  tissues.forEach((p, i) => {
    const { a, b } = COMPARTMENTS[i]
    ceiling = Math.max(ceiling, (p - a * gf) / (gf / b + 1 - gf))
  })
  return ceiling
}

/**
 * Hvor tæt hvert væv er på sin grænse (M-værdien) ved et givet tryk, i procent:
 * 0 % = ikke overmættet, 100 % = præcis ved Bühlmanns grænse. Svarer til den
 * "GF"-værdi, mange dykkercomputere viser.
 */
export function saturationPercent(tissues: Tissues, ambient: number): number[] {
  return tissues.map((p, i) => {
    const { a, b } = COMPARTMENTS[i]
    const mValue = ambient / b + a
    return Math.max(0, ((p - ambient) / (mValue - ambient)) * 100)
  })
}

/** Gradient factors som brøker, f.eks. { low: 0.4, high: 0.85 }. */
export type GradientFactors = { low: number; high: number }

/** Kan man stige direkte til overfladen? */
export function canSurface(tissues: Tissues, gf: GradientFactors): boolean {
  return ceilingBar(tissues, gf.high) <= SURFACE_BAR
}

/**
 * Minutter, man kunne være blevet på dybden, før der skulle dekostop til
 * (0, hvis der allerede skal stop til). Højst `max`.
 */
export function noDecoMinutes(
  tissues: Tissues,
  depthM: number,
  fN2: number,
  barPerM: number,
  gf: GradientFactors,
  max = 180,
): number {
  let t = tissues
  for (let minutes = 0; minutes < max; minutes++) {
    if (!canSurface(t, gf)) return minutes
    t = segment(t, depthM, depthM, 1, fN2, barPerM)
  }
  return max
}

export type DecoStop = { depthM: number; minutes: number }

export const ASCENT_M_PER_MIN = 9
export const DESCENT_M_PER_MIN = 18
const STOP_STEP_M = 3

/**
 * Dekostop fra en dybde op til overfladen, med gradient factors (GF low ved
 * første stop, glidende op til GF high i overfladen). Stoppene ligger for hver
 * 3 m. Returnerer stoppene og vævene i overfladen bagefter.
 */
export function decoAscent(
  tissues: Tissues,
  depthM: number,
  fN2: number,
  barPerM: number,
  gf: GradientFactors,
): { stops: DecoStop[]; tissues: Tissues } {
  const ceilingM = Math.max(0, (ceilingBar(tissues, gf.low) - SURFACE_BAR) / barPerM)
  const firstStop = Math.min(
    Math.floor(depthM / STOP_STEP_M) * STOP_STEP_M,
    Math.max(STOP_STEP_M, Math.ceil(ceilingM / STOP_STEP_M) * STOP_STEP_M),
  )
  const gfAt = (d: number) =>
    firstStop <= 0 ? gf.high : gf.high + ((gf.low - gf.high) * d) / firstStop

  let t = segment(tissues, depthM, firstStop, (depthM - firstStop) / ASCENT_M_PER_MIN, fN2, barPerM)
  const stops: DecoStop[] = []
  for (let stop = firstStop; stop > 0; stop -= STOP_STEP_M) {
    const next = Math.max(0, stop - STOP_STEP_M)
    let minutes = 0
    // Vent på stoppet, til vævene tåler det næste (højst 10 timer — sikkerhedsnet).
    while (ceilingBar(t, gfAt(next)) > ambientBar(next, barPerM) && minutes < 600) {
      t = segment(t, stop, stop, 1, fN2, barPerM)
      minutes++
    }
    if (minutes > 0) stops.push({ depthM: stop, minutes })
    t = segment(t, stop, next, (stop - next) / ASCENT_M_PER_MIN, fN2, barPerM)
  }
  return { stops, tissues: t }
}
