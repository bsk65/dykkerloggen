import type { DiveData } from '../types'

export type AirConsumption = {
  /** Brugt gas i overfladeliter: (start − slut) × flaskevolumen */
  gasUsedL: number
  /** Brugt tryk i bar */
  pressureUsedBar: number
  /**
   * Luftforbrug omregnet til overfladen (SAC/RMV) i liter pr. minut —
   * det tal, man sammenligner dyk med og planlægger efter.
   */
  sacLPerMin: number
  /** Samme i bar pr. minut med netop denne flaske */
  sacBarPerMin: number
  /** Gennemsnitligt tryk i atmosfærer under dykket */
  avgAmbientBar: number
  /**
   * true, når gennemsnitsdybden mangler, og maks. dybde er brugt i stedet.
   * Så er forbruget sat for lavt (dykket var reelt lavere i gennemsnit).
   */
  usedMaxDepth: boolean
}

/** Tryk i bar ved en given dybde (10 m vand ≈ 1 bar, + 1 bar luft). */
export function ambientPressureBar(depthM: number): number {
  return depthM / 10 + 1
}

type GasInput = Pick<
  DiveData,
  'startBar' | 'endBar' | 'tankVolumeL' | 'diveTimeMin' | 'avgDepthM' | 'maxDepthM'
>

/**
 * Beregner luftforbruget for hovedflasken. Returnerer null, hvis der mangler
 * oplysninger (tryk, flaskestørrelse, dyktid eller dybde), eller tallene
 * ikke giver mening (sluttryk over starttryk, dyktid 0).
 */
export function calculateAirConsumption(dive: GasInput): AirConsumption | null {
  const { startBar, endBar, tankVolumeL, diveTimeMin } = dive
  if (startBar === null || endBar === null || tankVolumeL === null || diveTimeMin === null) {
    return null
  }
  const pressureUsedBar = startBar - endBar
  if (pressureUsedBar <= 0 || tankVolumeL <= 0 || diveTimeMin <= 0) return null

  const usedMaxDepth = dive.avgDepthM === null
  const depth = dive.avgDepthM ?? dive.maxDepthM
  if (depth === null || depth < 0) return null

  const avgAmbientBar = ambientPressureBar(depth)
  const gasUsedL = pressureUsedBar * tankVolumeL
  return {
    gasUsedL,
    pressureUsedBar,
    sacLPerMin: gasUsedL / diveTimeMin / avgAmbientBar,
    sacBarPerMin: pressureUsedBar / diveTimeMin / avgAmbientBar,
    avgAmbientBar,
    usedMaxDepth,
  }
}

/** Brugt dekogas i liter, eller null hvis oplysningerne mangler. */
export function decoGasUsedL(
  dive: Pick<DiveData, 'decoGasUsed' | 'decoStartBar' | 'decoEndBar' | 'decoTankVolumeL'>,
): number | null {
  const { decoGasUsed, decoStartBar, decoEndBar, decoTankVolumeL } = dive
  if (!decoGasUsed || decoStartBar === null || decoEndBar === null || decoTankVolumeL === null) {
    return null
  }
  const used = (decoStartBar - decoEndBar) * decoTankVolumeL
  return used > 0 ? used : null
}

/**
 * Hvor længe en fuld flaske holder ved et givet luftforbrug og en dybde, med
 * en reserve (typisk 50 bar). Bruges til "hvor længe kan jeg dykke"-hint.
 */
export function minutesOfGas(
  sacLPerMin: number,
  tankVolumeL: number,
  startBar: number,
  reserveBar: number,
  depthM: number,
): number {
  const usableL = Math.max(0, startBar - reserveBar) * tankVolumeL
  return usableL / (sacLPerMin * ambientPressureBar(depthM))
}
