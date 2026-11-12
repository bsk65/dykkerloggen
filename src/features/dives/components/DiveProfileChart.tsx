import { useMemo, useState, type PointerEvent } from 'react'
import { useT } from '../../../shared/i18n/useT'
import { formatNumber } from '../../../shared/utils/numbers'
import {
  axisMax,
  decoRanges,
  fastAscentRanges,
  FAST_ASCENT_M_PER_MIN,
  nearestSample,
  type Range,
} from '../logic/profileAnalysis'
import type { DiveProfile, ProfileSummary } from '../types'
import styles from './DiveProfileChart.module.css'

const W = 600
const H = 220

/** Tid i sekunder som "m:ss". */
function clock(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Dykkerprofilen fra dykkercomputeren: dybde over tid, med dekoforpligtelse
 * og for hurtige opstigninger markeret. Tryk/før fingeren hen over grafen for
 * at se tal for hvert øjeblik.
 */
export function DiveProfileChart({
  profile,
  summary,
}: {
  profile: DiveProfile
  summary: ProfileSummary
}) {
  const { t, locale } = useT()
  const [active, setActive] = useState<number | null>(null)
  const axis = useMemo(() => axisMax(profile), [profile])
  const fast = useMemo(() => fastAscentRanges(profile), [profile])
  const deco = useMemo(() => decoRanges(profile), [profile])

  const tMax = axis.minutes * 60
  const x = (sec: number) => (sec / tMax) * W
  const y = (m: number) => (m / axis.depthM) * H
  const line = (from = 0, to = profile.t.length - 1) =>
    profile.t
      .slice(from, to + 1)
      .map(
        (sec, i) =>
          `${i === 0 ? 'M' : 'L'}${x(sec).toFixed(1)},${y(profile.d[from + i]).toFixed(1)}`,
      )
      .join(' ')
  const depthLine = line()
  const last = profile.t[profile.t.length - 1]
  const area = `${depthLine} L${x(last).toFixed(1)},0 L0,0 Z`

  const depthTicks = Array.from({ length: axis.depthM / 5 + 1 }, (_, i) => i * 5).filter(
    (m) => axis.depthM <= 30 || m % 10 === 0,
  )
  const timeStep = axis.minutes > 60 ? 20 : 10
  const timeTicks = Array.from({ length: axis.minutes / timeStep + 1 }, (_, i) => i * timeStep)

  function onPointer(e: PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    setActive(nearestSample(profile, frac * tMax))
  }

  const temps = profile.temp.filter((v): v is number => v !== null)
  const i = active
  const leftPct = i === null ? 0 : (x(profile.t[i]) / W) * 100
  const rect = (r: Range, cls: string) => (
    <rect
      key={`${cls}-${r[0]}`}
      className={cls}
      x={x(profile.t[r[0]])}
      y={0}
      width={Math.max(2, x(profile.t[r[1]]) - x(profile.t[r[0]]))}
      height={H}
    />
  )

  return (
    <section className={styles.card}>
      <h3 className={styles.title}>{t('profileChart.title')}</h3>

      <div className={styles.chartRow}>
        <div className={styles.yAxis} aria-hidden="true">
          {depthTicks.map((m) => (
            <span key={m} style={{ top: `${(m / axis.depthM) * 100}%` }}>
              {m}
            </span>
          ))}
        </div>
        <div
          className={styles.plot}
          onPointerMove={onPointer}
          onPointerDown={onPointer}
          onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)}
          role="img"
          aria-label={t('profileChart.aria', {
            max: formatNumber(Math.max(...profile.d), locale),
            min: Math.round(last / 60),
          })}
        >
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={styles.svg}>
            {depthTicks.map((m) => (
              <line key={m} className={styles.grid} x1={0} x2={W} y1={y(m)} y2={y(m)} />
            ))}
            {deco.map((r) => rect(r, styles.decoBand))}
            <path className={styles.area} d={area} />
            <path className={styles.depth} d={depthLine} />
            {fast.map((r) => (
              <path key={r[0]} className={styles.fast} d={line(r[0], r[1])} />
            ))}
          </svg>
          {i !== null && (
            <>
              <div className={styles.cursor} style={{ left: `${leftPct}%` }} />
              <div
                className={styles.dot}
                style={{ left: `${leftPct}%`, top: `${(profile.d[i] / axis.depthM) * 100}%` }}
              />
              <div
                className={leftPct > 55 ? styles.tipLeft : styles.tipRight}
                style={{ left: `${leftPct}%` }}
              >
                <strong>
                  {formatNumber(profile.d[i], locale)} m · {clock(profile.t[i])}
                </strong>
                {profile.temp[i] !== null && (
                  <span>{formatNumber(profile.temp[i] ?? 0, locale)} °C</span>
                )}
                {profile.bar[i] !== null && (
                  <span>{formatNumber(profile.bar[i] ?? 0, locale, 0)} bar</span>
                )}
                {profile.stop[i] !== null ? (
                  <span className={styles.tipWarning}>
                    {t('profileChart.tipStop', { m: profile.stop[i] ?? 0 })}
                  </span>
                ) : (
                  profile.ndl[i] !== null && (
                    <span>{t('profileChart.tipNdl', { n: profile.ndl[i] ?? 0 })}</span>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <div className={styles.xAxis} aria-hidden="true">
        {timeTicks.map((m) => (
          <span key={m} style={{ left: `${(m / axis.minutes) * 100}%` }}>
            {m}
          </span>
        ))}
      </div>
      <p className={styles.axisNote}>{t('profileChart.axes')}</p>

      <ul className={styles.legend}>
        <li>
          <span className={styles.swatchDepth} /> {t('profileChart.depth')}
        </li>
        {deco.length > 0 && (
          <li>
            <span className={styles.swatchDeco} /> {t('profileChart.deco')}
          </li>
        )}
        {fast.length > 0 && (
          <li>
            <span className={styles.swatchFast} />{' '}
            {t('profileChart.fast', { n: FAST_ASCENT_M_PER_MIN })}
          </li>
        )}
      </ul>
      <p className={styles.hint}>{t('profileChart.hint')}</p>

      <p className={styles.meta}>
        {[
          temps.length > 0 &&
            t('profileChart.temps', {
              min: formatNumber(Math.min(...temps), locale),
              max: formatNumber(Math.max(...temps), locale),
            }),
          summary.maxCns !== null && t('profileChart.cns', { n: summary.maxCns }),
          t('profileChart.source', { computer: summary.computer, n: summary.samples }),
        ]
          .filter(Boolean)
          .join(' · ')}
      </p>
    </section>
  )
}
