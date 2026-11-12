import type { DiveProfile } from '../types'

/** Opstigning hurtigere end dette (m/min) markeres — den gængse anbefaling er højst 9–10 m/min. */
export const FAST_ASCENT_M_PER_MIN = 10
/** Hastigheden måles over så mange sekunder, så en enkelt måling ikke giver falsk alarm. */
const ASCENT_WINDOW_S = 30

/** Sammenhængende stykker af profilen som [første, sidste] målings-index. */
export type Range = [number, number]

function ranges(flags: boolean[]): Range[] {
  const out: Range[] = []
  let start = -1
  flags.forEach((on, i) => {
    if (on && start < 0) start = i
    if (!on && start >= 0) {
      out.push([start, i - 1])
      start = -1
    }
  })
  if (start >= 0) out.push([start, flags.length - 1])
  return out
}

/** Stykker med for hurtig opstigning (målt over ca. 30 sekunder). */
export function fastAscentRanges(profile: DiveProfile, limit = FAST_ASCENT_M_PER_MIN): Range[] {
  const { t, d } = profile
  const flags = t.map(() => false)
  let j = 0
  for (let i = 1; i < t.length; i++) {
    while (j < i && t[i] - t[j + 1] >= ASCENT_WINDOW_S) j++
    const dt = t[i] - t[j]
    if (dt < ASCENT_WINDOW_S / 2) continue
    const rate = ((d[j] - d[i]) / dt) * 60
    if (rate > limit) for (let k = j; k <= i; k++) flags[k] = true
  }
  return ranges(flags)
}

/** Stykker, hvor computeren krævede dekostop. */
export function decoRanges(profile: DiveProfile): Range[] {
  return ranges(profile.stop.map((s) => s !== null && s > 0))
}

/** Computerens laveste tid til dekogrænsen undervejs (min) — null, hvis den ikke er i filen. */
export function lowestComputerNdl(profile: DiveProfile): number | null {
  const values = profile.ndl.filter((n): n is number => n !== null)
  return values.length > 0 ? Math.min(...values) : null
}

/** Index for målingen nærmest et tidspunkt (sekunder). */
export function nearestSample(profile: DiveProfile, seconds: number): number {
  const { t } = profile
  let lo = 0
  let hi = t.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (t[mid] < seconds) lo = mid + 1
    else hi = mid
  }
  return lo > 0 && seconds - t[lo - 1] < t[lo] - seconds ? lo - 1 : lo
}

/** Pæn skala: største dybde rundet op til 5 m, tid til 10 min. */
export function axisMax(profile: DiveProfile): { depthM: number; minutes: number } {
  const maxD = Math.max(...profile.d, 1)
  const maxMin = profile.t[profile.t.length - 1] / 60
  return { depthM: Math.ceil(maxD / 5) * 5, minutes: Math.max(10, Math.ceil(maxMin / 10) * 10) }
}
