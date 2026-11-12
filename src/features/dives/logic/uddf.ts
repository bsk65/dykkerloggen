import type { DiveProfile } from '../types'

/** Filen er ikke en UDDF-fil (eller er ødelagt). */
export class UddfError extends Error {}

/** Ét dyk læst fra en UDDF-fil (fra dykkercomputer eller logbogsprogram). */
export type UddfDive = {
  /** Dykkets id i filen — bruges til at undgå at importere det to gange */
  id: string
  /** Computerens eget dyknummer (computerens tæller, ikke logbogens) */
  computerDiveNumber: number | null
  /** ÅÅÅÅ-MM-DD */
  date: string
  /** TT:MM */
  entryTime: string | null
  diveTimeMin: number
  maxDepthM: number
  avgDepthM: number
  siteName: string | null
  region: string | null
  lat: number | null
  lng: number | null
  /** Iltprocent i den første gas */
  o2Percent: number
  /** true = saltvand, false = ferskvand, null = ukendt */
  salt: boolean | null
  startBar: number | null
  endBar: number | null
  minTempC: number | null
  computer: string
  gfLow: number | null
  gfHigh: number | null
  decoRequired: boolean
  maxCns: number | null
  profile: DiveProfile
}

/** Højst så mange målinger gemmes pr. dyk (ellers tyndes der ud). */
export const MAX_SAMPLES = 3000

function kids(el: Element | null | undefined, name: string): Element[] {
  return el ? Array.from(el.children).filter((c) => c.localName === name) : []
}
function kid(el: Element | null | undefined, name: string): Element | undefined {
  return kids(el, name)[0]
}
function deep(el: Element | Document | null | undefined, name: string): Element[] {
  return el ? Array.from(el.getElementsByTagNameNS('*', name)) : []
}
function num(el: Element | undefined): number | null {
  if (!el?.textContent) return null
  const n = Number(el.textContent.trim())
  return Number.isFinite(n) ? n : null
}
function text(el: Element | undefined): string | null {
  const s = el?.textContent?.trim()
  return s ? s : null
}
const round1 = (n: number) => Math.round(n * 10) / 10

/** UDDF gemmer temperatur i kelvin og tryk i pascal. */
const kelvinToC = (k: number) => round1(k > 200 ? k - 273.15 : k)
const pascalToBar = (pa: number) => Math.round(pa / 100_000)

/** Tynder profilen ud, men beholder det dybeste punkt. */
function thin(profile: DiveProfile): DiveProfile {
  const n = profile.t.length
  if (n <= MAX_SAMPLES) return profile
  const step = Math.ceil(n / MAX_SAMPLES)
  const deepest = profile.d.indexOf(Math.max(...profile.d))
  const keep = profile.t.map((_, i) => i % step === 0 || i === deepest || i === n - 1)
  const pick = <T>(xs: T[]) => xs.filter((_, i) => keep[i])
  return {
    t: pick(profile.t),
    d: pick(profile.d),
    temp: pick(profile.temp),
    bar: pick(profile.bar),
    ndl: pick(profile.ndl),
    stop: pick(profile.stop),
    gas: profile.gas,
  }
}

/** Tidsvægtet gennemsnitsdybde ud fra profilen. */
function averageDepth(t: number[], d: number[]): number {
  let area = 0
  for (let i = 1; i < t.length; i++) area += ((d[i] + d[i - 1]) / 2) * (t[i] - t[i - 1])
  const total = t[t.length - 1] - t[0]
  return total > 0 ? area / total : 0
}

/**
 * Læser alle dyk i en UDDF-fil. Kræver en browser (DOMParser).
 *
 * Tidspunktet bruges, som det står (vægur-tid): Shearwater m.fl. skriver den
 * lokale tid med et "Z" bagefter, selv om det ikke er UTC.
 */
export function parseUddf(xml: string): UddfDive[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const root = doc.documentElement
  if (!root || root.localName !== 'uddf' || deep(doc, 'parsererror').length > 0) {
    throw new UddfError('Ikke en UDDF-fil')
  }

  const computers = new Map<string, string>()
  for (const dc of deep(root, 'divecomputer')) {
    const name = text(kid(dc, 'model')) ?? text(kid(dc, 'name'))
    if (name) computers.set(dc.getAttribute('id') ?? '', name)
  }
  const generator = text(kid(kid(root, 'generator'), 'name')) ?? 'UDDF'

  const sites = new Map<
    string,
    { name: string | null; region: string | null; lat: number | null; lng: number | null }
  >()
  for (const site of deep(kid(root, 'divesite'), 'site')) {
    const geo = kid(site, 'geography')
    sites.set(site.getAttribute('id') ?? '', {
      name: text(kid(site, 'name')),
      region: text(kid(geo, 'location')),
      lat: num(kid(geo, 'latitude')),
      lng: num(kid(geo, 'longitude')),
    })
  }

  const mixes = new Map<string, number>()
  for (const mix of deep(kid(root, 'gasdefinitions'), 'mix')) {
    const o2 = num(kid(mix, 'o2'))
    if (o2 !== null) mixes.set(mix.getAttribute('id') ?? '', o2 <= 1 ? o2 * 100 : o2)
  }

  const buehlmann = deep(kid(root, 'decomodel'), 'buehlmann')[0]
  const gfLow = num(kid(buehlmann, 'gradientfactorlow'))
  const gfHigh = num(kid(buehlmann, 'gradientfactorhigh'))
  const density = num(deep(kid(root, 'tablegeneration'), 'density')[0])
  const salt = density === null ? null : density >= 1010

  const dives = deep(kid(root, 'profiledata'), 'dive').map((dive) =>
    parseDive(dive, { computers, generator, sites, mixes, gfLow, gfHigh, salt }),
  )
  if (dives.length === 0) throw new UddfError('Ingen dyk i filen')
  return dives
}

type Context = {
  computers: Map<string, string>
  generator: string
  sites: Map<
    string,
    { name: string | null; region: string | null; lat: number | null; lng: number | null }
  >
  mixes: Map<string, number>
  gfLow: number | null
  gfHigh: number | null
  salt: boolean | null
}

function parseDive(dive: Element, ctx: Context): UddfDive {
  const before = kid(dive, 'informationbeforedive')
  const after = kid(dive, 'informationafterdive')
  const datetime = text(kid(before, 'datetime'))
  const match = datetime?.match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/)
  if (!match) throw new UddfError('Dyk uden dato')

  const refs = deep(before, 'link').map((l) => l.getAttribute('ref') ?? '')
  const site = refs.map((r) => ctx.sites.get(r)).find(Boolean)
  const computer = refs.map((r) => ctx.computers.get(r)).find(Boolean) ?? ctx.generator

  // Målingerne
  const profile: DiveProfile = { t: [], d: [], temp: [], bar: [], ndl: [], stop: [], gas: [] }
  const cnsValues: number[] = []
  let decoRequired = false
  for (const wp of deep(kid(dive, 'samples'), 'waypoint')) {
    const t = num(kid(wp, 'divetime'))
    const d = num(kid(wp, 'depth'))
    if (t === null || d === null) continue
    const temp = num(kid(wp, 'temperature'))
    const pressure = num(kid(wp, 'tankpressure'))
    const ndl = num(kid(wp, 'nodecotime'))
    const stopEl = kids(wp, 'decostop').find((s) => s.getAttribute('kind') === 'mandatory')
    const stopDepth = stopEl ? Number(stopEl.getAttribute('decodepth')) : null
    const cns = num(kid(wp, 'cns'))
    const mixRef = kid(wp, 'switchmix')?.getAttribute('ref')
    const o2 = mixRef ? ctx.mixes.get(mixRef) : undefined
    if (o2 !== undefined) profile.gas.push({ t, o2: Math.round(o2) })

    profile.t.push(t)
    profile.d.push(round1(Math.max(0, d)))
    profile.temp.push(temp === null ? null : kelvinToC(temp))
    profile.bar.push(pressure === null || pressure <= 0 ? null : pascalToBar(pressure))
    profile.ndl.push(ndl === null ? null : Math.round(ndl / 60))
    profile.stop.push(stopDepth !== null && Number.isFinite(stopDepth) ? stopDepth : null)
    if (stopDepth) decoRequired = true
    if (cns !== null) cnsValues.push(cns)
  }
  if (profile.t.length < 2) throw new UddfError('Dyk uden profil')
  // CNS står som procent (Shearwater) eller som brøk 0–1 (andre programmer).
  const cnsMax = cnsValues.length > 0 ? Math.max(...cnsValues) : null
  const maxCns =
    cnsMax === null
      ? null
      : cnsMax <= 1 && cnsValues.some((c) => c % 1 !== 0)
        ? cnsMax * 100
        : cnsMax
  if (profile.gas.length === 0) {
    const first = ctx.mixes.values().next().value
    profile.gas.push({ t: 0, o2: Math.round(first ?? 21) })
  }

  const tank = kids(dive, 'tankdata').find((td) => (num(kid(td, 'tankpressurebegin')) ?? 0) > 0)
  const startPa = num(kid(tank, 'tankpressurebegin'))
  const endPa = num(kid(tank, 'tankpressureend'))
  const temps = profile.temp.filter((x): x is number => x !== null)
  const bars = profile.bar.filter((x): x is number => x !== null)
  const duration = num(kid(after, 'diveduration')) ?? profile.t[profile.t.length - 1]

  return {
    id: dive.getAttribute('id') ?? `${match[1]}T${match[2] ?? ''}`,
    computerDiveNumber: num(kid(before, 'divenumber')),
    date: match[1],
    entryTime: match[2] ?? null,
    diveTimeMin: Math.round(duration / 60),
    maxDepthM: round1(num(kid(after, 'greatestdepth')) ?? Math.max(...profile.d)),
    avgDepthM: round1(num(kid(after, 'averagedepth')) ?? averageDepth(profile.t, profile.d)),
    siteName: site?.name ?? null,
    region: site?.region ?? null,
    lat: site?.lat ?? null,
    lng: site?.lng ?? null,
    o2Percent: profile.gas[0].o2,
    salt: ctx.salt,
    startBar: startPa ? pascalToBar(startPa) : (bars[0] ?? null),
    endBar: endPa ? pascalToBar(endPa) : (bars[bars.length - 1] ?? null),
    minTempC: temps.length > 0 ? Math.min(...temps) : null,
    computer,
    gfLow: ctx.gfLow,
    gfHigh: ctx.gfHigh,
    decoRequired,
    maxCns: maxCns === null ? null : Math.round(maxCns),
    profile: thin(profile),
  }
}
