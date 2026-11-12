import type {
  Current,
  DiveKind,
  Entry,
  GearConfig,
  Purpose,
  Specialty,
  Surface,
  TankMaterial,
  WaterBody,
  WaterType,
  Weather,
} from './options'

/**
 * Hvor dykket stammer fra — 'ssi' bruges, når dyk importeres fra my.divessi.com,
 * 'computer', når det er importeret fra en dykkercomputer (UDDF-fil).
 */
export type DiveSource = 'app' | 'ssi' | 'computer'

/**
 * Et dyk, som det gemmes i Firestore (users/{uid}/dives/{diveId}).
 * Tomme felter er null (Firestore afviser undefined). Alle mål er metriske:
 * meter, minutter, liter, bar, °C, kg.
 */
export type DiveData = {
  diveNumber: number | null
  /** ÅÅÅÅ-MM-DD */
  date: string
  /** TT:MM — tidspunktet man gik i vandet */
  entryTime: string | null
  diveKind: DiveKind
  purpose: Purpose | null
  specialty: Specialty | null

  buddies: string[]
  instructor: string | null
  center: string | null

  siteName: string
  country: string | null
  region: string | null
  lat: number | null
  lng: number | null

  waterBody: WaterBody | null
  entry: Entry | null
  waterType: WaterType | null
  current: Current | null
  surface: Surface | null
  weather: Weather | null
  airTempC: number | null
  /** Temperatur ved bunden (laveste) */
  waterTempC: number | null
  /** Temperatur i overfladen (højeste) */
  surfaceTempC: number | null
  visibilityM: number | null

  diveTimeMin: number | null
  maxDepthM: number | null
  avgDepthM: number | null
  weightKg: number | null

  nitrox: boolean
  o2Percent: number | null
  gearConfig: GearConfig | null
  tankMaterial: TankMaterial | null
  /** Samlet vandvolumen — ved dobbeltsæt summen af begge flasker */
  tankVolumeL: number | null
  startBar: number | null
  endBar: number | null

  deco: boolean
  decoTimeMin: number | null
  decoGasUsed: boolean
  decoTankMaterial: TankMaterial | null
  decoTankVolumeL: number | null
  decoO2Percent: number | null
  decoStartBar: number | null
  decoEndBar: number | null

  gearDetails: string | null
  comment: string | null
  /** 0–5 stjerner, 0 = ikke bedømt */
  rating: number

  /** Billede fra dykkerstedet i Firebase Storage */
  sitePhotoPath: string | null
  /**
   * Billeder, der dokumenterer dykket: siden i papir-logbogen, dykkercentrets
   * stempel, dykkercomputerens skærm osv.
   */
  logbookImages: LogbookImage[]

  source: DiveSource
  /** SSI's eget id, når dykket er importeret — så det ikke importeres to gange */
  ssiId: string | null
  /** Dykkercomputerens id for dykket (fra UDDF-filen) — så det ikke importeres to gange */
  computerDiveId: string | null
  /** Oplysninger om den importerede dykkerprofil (selve profilen ligger i et underdokument) */
  profile: ProfileSummary | null
}

/** Kort om dykkets profil fra dykkercomputeren — gemt på selve dykket. */
export type ProfileSummary = {
  /** F.eks. "Perdix AI" */
  computer: string
  samples: number
  /** Computerens egne gradient factors i procent, hvis de står i filen */
  gfLow: number | null
  gfHigh: number | null
  /** Computeren krævede dekostop undervejs */
  decoRequired: boolean
  /** Højeste CNS-iltbelastning i procent */
  maxCns: number | null
}

/**
 * Dykkerprofilen minut for minut (users/{uid}/dives/{diveId}/profile/data).
 * Parallelle lister — én værdi pr. måling; null, hvor computeren ikke målte.
 */
export type DiveProfile = {
  /** Sekunder fra dykkets start */
  t: number[]
  /** Dybde i meter */
  d: number[]
  /** Vandtemperatur i °C */
  temp: (number | null)[]
  /** Flasketryk i bar */
  bar: (number | null)[]
  /** Computerens tid til dekogrænsen i minutter */
  ndl: (number | null)[]
  /** Computerens krævede stopdybde (m), når der er dekoforpligtelse */
  stop: (number | null)[]
  /** Gasskift: fra sekund t åndes der gas med o2 % ilt */
  gas: { t: number; o2: number }[]
}

export type Dive = DiveData & { id: string }

/** Ét dokumentationsbillede i to størrelser. */
export type LogbookImage = {
  /** Stor version, til at zoome i */
  path: string
  /** Lille version — lægges også på telefonen, så den kan ses uden dækning */
  smallPath: string
}
