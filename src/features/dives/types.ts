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

/** Hvor dykket stammer fra — 'ssi' bruges, når dyk importeres fra my.divessi.com. */
export type DiveSource = 'app' | 'ssi'

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
  /** Billede af dykket i den gamle papir-logbog (stor version, til at zoome i) */
  logbookPagePath: string | null
  /** Lille version af logbogssiden — lægges også på telefonen, så den kan ses uden dækning */
  logbookPageSmallPath: string | null

  source: DiveSource
  /** SSI's eget id, når dykket er importeret — så det ikke importeres to gange */
  ssiId: string | null
}

export type Dive = DiveData & { id: string }
