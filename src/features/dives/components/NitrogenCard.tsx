import { useMemo, useState } from 'react'
import type { Translate } from '../../../shared/i18n/translator'
import { useT } from '../../../shared/i18n/useT'
import { formatNumber } from '../../../shared/utils/numbers'
import { useProfile } from '../../profile/hooks/useProfile'
import { useDives } from '../hooks/useDives'
import { COMPARTMENTS } from '../logic/buhlmann'
import { DEFAULT_GF_PRESET, GF_PRESETS, SAFETY_STOP, nitrogenForDive } from '../logic/nitrogen'
import { lowestComputerNdl } from '../logic/profileAnalysis'
import type { Dive, DiveProfile } from '../types'
import styles from './NitrogenCard.module.css'

function duration(minutes: number, t: Translate): string {
  const m = Math.round(minutes)
  return m >= 60
    ? t('nitrogen.hours', { h: Math.floor(m / 60), m: m % 60 })
    : t('nitrogen.minutes', { m })
}

function noDeco(minutes: number, t: Translate): string {
  return minutes >= 180 ? t('nitrogen.noDecoMax') : duration(minutes, t)
}

/**
 * Kvælstofberegning efter Bühlmann ZHL-16C: tid til dekogrænsen, mætningen
 * i de 16 væv og restkvælstof fra tidligere dyk. Med en profil fra
 * dykkercomputeren regnes der på den; ellers et forsigtigt "firkantet" skøn.
 * Kun til at forstå dykket bagefter.
 */
export function NitrogenCard({
  dive,
  diveProfile = null,
}: {
  dive: Dive
  diveProfile?: DiveProfile | null
}) {
  const { t, locale } = useT()
  const { dives } = useDives()
  const { profile: userProfile } = useProfile()
  const [selected, setSelected] = useState<number | null>(null)
  const gf = GF_PRESETS[userProfile?.gfPreset ?? DEFAULT_GF_PRESET]
  const result = useMemo(
    () => nitrogenForDive(dive, dives ?? [dive], gf, diveProfile),
    [dive, dives, gf, diveProfile],
  )

  if (result.status === 'missing') return <p className={styles.missing}>{t('nitrogen.missing')}</p>
  if (result.status === 'unsupported') {
    return <p className={styles.missing}>{t('nitrogen.unsupported')}</p>
  }

  const limit = Math.round(gf.high * 100)
  const decoTotal = result.decoStops.reduce((sum, s) => sum + s.minutes, 0)
  const needsDeco = result.decoStops.length > 0
  const pct = (p: number) => formatNumber(p, locale, 0)
  const tissueText = (i: number) =>
    t('nitrogen.tissue', {
      n: i + 1,
      h: formatNumber(COMPARTMENTS[i].halfTime, locale),
      p: pct(result.surfaceSaturation[i]),
    })
  const shown = selected ?? result.leadingTissue
  const fromProfile = result.basis === 'profile'
  const computerNdl = diveProfile ? lowestComputerNdl(diveProfile) : null
  const summary = dive.profile
  const gasText =
    dive.nitrox && dive.o2Percent
      ? t('nitrogen.gasNitrox', { o2: dive.o2Percent })
      : t('nitrogen.gasAir')

  return (
    <section className={styles.card}>
      <h3 className={styles.title}>{t('nitrogen.title')}</h3>

      <div className={styles.grid}>
        <div className={styles.metric}>
          <span className={result.noDecoMin === 0 ? styles.valueWarning : styles.value}>
            {fromProfile && result.noDecoMin === 0
              ? t('nitrogen.obligationValue', { m: result.maxCeilingM || 3 })
              : needsDeco
                ? duration(decoTotal, t)
                : noDeco(result.noDecoMin, t)}
          </span>
          <span className={styles.unit}>
            {fromProfile
              ? result.noDecoMin === 0
                ? t('nitrogen.obligationUnit')
                : t('nitrogen.minNdlUnit')
              : needsDeco
                ? t('nitrogen.decoUnit')
                : t('nitrogen.noDecoUnit')}
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.value}>{pct(result.surfaceGf)} %</span>
          <span className={styles.unit}>{t('nitrogen.surfaceGfUnit', { limit })}</span>
        </div>
      </div>

      {needsDeco && (
        <p className={styles.text}>
          {t('nitrogen.stops', {
            stops: result.decoStops
              .map((s) => t('nitrogen.stop', { depth: s.depthM, min: s.minutes }))
              .join(', '),
          })}
        </p>
      )}
      {needsDeco && !dive.deco && <p className={styles.note}>{t('nitrogen.loggedNoDeco')}</p>}
      {fromProfile && summary && (summary.decoRequired || computerNdl !== null) && (
        <p className={styles.text}>
          {t('nitrogen.computerSays', {
            computer: summary.computer,
            gf:
              summary.gfLow !== null && summary.gfHigh !== null
                ? t('nitrogen.computerGf', { low: summary.gfLow, high: summary.gfHigh })
                : '',
            verdict: summary.decoRequired
              ? t('nitrogen.computerDeco')
              : t('nitrogen.computerNdl', { n: computerNdl ?? 0 }),
          })}
        </p>
      )}

      <figure className={styles.chart}>
        <figcaption className={styles.chartTitle}>{t('nitrogen.chartTitle')}</figcaption>
        <div className={styles.plot} role="list">
          <div className={styles.limit} style={{ bottom: `${limit}%` }}>
            <span className={styles.limitLabel}>{t('nitrogen.limitLine', { n: limit })}</span>
          </div>
          {result.surfaceSaturation.map((p, i) => (
            <button
              key={i}
              type="button"
              role="listitem"
              className={styles.barSlot}
              aria-label={tissueText(i)}
              title={tissueText(i)}
              aria-pressed={i === shown}
              onClick={() => setSelected(i)}
            >
              <span
                className={i === shown ? styles.barActive : styles.bar}
                style={{ height: `${Math.min(100, p)}%` }}
              />
            </button>
          ))}
        </div>
        <div className={styles.axis}>
          <span>{t('nitrogen.chartFast')}</span>
          <span>{t('nitrogen.chartSlow')}</span>
        </div>
        <p className={styles.text}>
          {selected === null
            ? t('nitrogen.leading', {
                n: result.leadingTissue + 1,
                h: formatNumber(COMPARTMENTS[result.leadingTissue].halfTime, locale),
              })
            : tissueText(selected)}{' '}
          <span className={styles.muted}>{selected === null && t('nitrogen.tissueHint')}</span>
        </p>
      </figure>

      {result.previousDives > 0 && (
        <p className={styles.text}>
          {t('nitrogen.repetitive', {
            n: result.previousDives,
            interval: duration(result.surfaceIntervalMin ?? 0, t),
            pct: pct(result.residualPercent),
          })}{' '}
          {result.noDecoMinFresh > 0
            ? t('nitrogen.repetitiveFresh', { fresh: noDeco(result.noDecoMinFresh, t) })
            : t('nitrogen.repetitiveFreshDeco')}
        </p>
      )}
      {result.skippedDives > 0 && (
        <p className={styles.note}>{t('nitrogen.skipped', { n: result.skippedDives })}</p>
      )}

      <p className={styles.explain}>
        {fromProfile
          ? t('nitrogen.assumptionsProfile', {
              n: diveProfile?.t.length ?? 0,
              gas: gasText,
              low: Math.round(gf.low * 100),
              high: limit,
            })
          : t('nitrogen.assumptions', {
              depth: formatNumber(dive.maxDepthM ?? 0, locale),
              bottom: formatNumber(result.bottomMin, locale, 0),
              stop: needsDeco
                ? t('nitrogen.stopDeco')
                : (dive.maxDepthM ?? 0) > SAFETY_STOP.depthM
                  ? t('nitrogen.stopSafety')
                  : t('nitrogen.stopNone'),
              gas: gasText,
              low: Math.round(gf.low * 100),
              high: limit,
            })}
      </p>
      <p className={styles.disclaimer}>⚠ {t('nitrogen.disclaimer')}</p>
    </section>
  )
}
