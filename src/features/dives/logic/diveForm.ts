import { numberToText, parseNumber } from '../../../shared/utils/numbers'
import {
  DEFAULT_WATER_TYPE,
  type Current,
  type DiveKind,
  type Entry,
  type GearConfig,
  type Purpose,
  type Specialty,
  type Surface,
  type TankMaterial,
  type WaterBody,
  type WaterType,
  type Weather,
} from '../options'
import type { DiveData } from '../types'

/**
 * Formularens tilstand. Tal holdes som tekst, så brugeren kan skrive frit
 * (også "12,5" og tomme felter) — de omsættes først ved gem.
 * Valglister er '' når intet er valgt.
 */
export type DiveForm = {
  diveNumber: string
  date: string
  entryTime: string
  diveKind: DiveKind
  purpose: Purpose | ''
  specialty: Specialty | ''
  buddies: string
  instructor: string
  center: string

  siteName: string
  country: string
  region: string
  lat: number | null
  lng: number | null

  waterBody: WaterBody | ''
  entry: Entry | ''
  waterType: WaterType | ''
  current: Current | ''
  surface: Surface | ''
  weather: Weather | ''
  airTempC: string
  waterTempC: string
  surfaceTempC: string
  visibilityM: string

  diveTimeMin: string
  maxDepthM: string
  avgDepthM: string
  weightKg: string

  nitrox: boolean
  o2Percent: string
  gearConfig: GearConfig | ''
  tankMaterial: TankMaterial | ''
  tankVolumeL: string
  startBar: string
  endBar: string

  deco: boolean
  decoTimeMin: string
  decoGasUsed: boolean
  decoTankMaterial: TankMaterial | ''
  decoTankVolumeL: string
  decoO2Percent: string
  decoStartBar: string
  decoEndBar: string

  gearDetails: string
  comment: string
  rating: number
}

/** Dagens dato som ÅÅÅÅ-MM-DD i lokal tid. */
export function todayIso(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** Klokken nu som TT:MM. */
export function nowTime(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`
}

/**
 * Et tomt dyk med fornuftige standardværdier: saltvand, flaskedykning,
 * luft (21 %), enkelt flaske og næste dyknummer.
 */
export function emptyDiveForm(nextDiveNumber: number, now = new Date()): DiveForm {
  return {
    diveNumber: String(nextDiveNumber),
    date: todayIso(now),
    entryTime: nowTime(now),
    diveKind: 'scuba',
    purpose: 'fun',
    specialty: '',
    buddies: '',
    instructor: '',
    center: '',
    siteName: '',
    country: '',
    region: '',
    lat: null,
    lng: null,
    waterBody: 'sea',
    entry: 'shore',
    waterType: DEFAULT_WATER_TYPE,
    current: '',
    surface: '',
    weather: '',
    airTempC: '',
    waterTempC: '',
    surfaceTempC: '',
    visibilityM: '',
    diveTimeMin: '',
    maxDepthM: '',
    avgDepthM: '',
    weightKg: '',
    nitrox: false,
    o2Percent: '21',
    gearConfig: 'single',
    tankMaterial: 'steel',
    tankVolumeL: '',
    startBar: '',
    endBar: '',
    deco: false,
    decoTimeMin: '',
    decoGasUsed: false,
    decoTankMaterial: '',
    decoTankVolumeL: '',
    decoO2Percent: '',
    decoStartBar: '',
    decoEndBar: '',
    gearDetails: '',
    comment: '',
    rating: 0,
  }
}

const text = (value: string | null) => value ?? ''
const orNull = <T extends string>(value: T | ''): T | null => (value === '' ? null : value)
const trimmedOrNull = (value: string): string | null => value.trim() || null

/** Et gemt dyk til formularens tilstand (ved redigering). */
export function diveToForm(dive: DiveData): DiveForm {
  return {
    diveNumber: numberToText(dive.diveNumber),
    date: dive.date,
    entryTime: text(dive.entryTime),
    diveKind: dive.diveKind,
    purpose: dive.purpose ?? '',
    specialty: dive.specialty ?? '',
    buddies: dive.buddies.join(', '),
    instructor: text(dive.instructor),
    center: text(dive.center),
    siteName: dive.siteName,
    country: text(dive.country),
    region: text(dive.region),
    lat: dive.lat,
    lng: dive.lng,
    waterBody: dive.waterBody ?? '',
    entry: dive.entry ?? '',
    waterType: dive.waterType ?? '',
    current: dive.current ?? '',
    surface: dive.surface ?? '',
    weather: dive.weather ?? '',
    airTempC: numberToText(dive.airTempC),
    waterTempC: numberToText(dive.waterTempC),
    surfaceTempC: numberToText(dive.surfaceTempC),
    visibilityM: numberToText(dive.visibilityM),
    diveTimeMin: numberToText(dive.diveTimeMin),
    maxDepthM: numberToText(dive.maxDepthM),
    avgDepthM: numberToText(dive.avgDepthM),
    weightKg: numberToText(dive.weightKg),
    nitrox: dive.nitrox,
    o2Percent: numberToText(dive.o2Percent),
    gearConfig: dive.gearConfig ?? '',
    tankMaterial: dive.tankMaterial ?? '',
    tankVolumeL: numberToText(dive.tankVolumeL),
    startBar: numberToText(dive.startBar),
    endBar: numberToText(dive.endBar),
    deco: dive.deco,
    decoTimeMin: numberToText(dive.decoTimeMin),
    decoGasUsed: dive.decoGasUsed,
    decoTankMaterial: dive.decoTankMaterial ?? '',
    decoTankVolumeL: numberToText(dive.decoTankVolumeL),
    decoO2Percent: numberToText(dive.decoO2Percent),
    decoStartBar: numberToText(dive.decoStartBar),
    decoEndBar: numberToText(dive.decoEndBar),
    gearDetails: text(dive.gearDetails),
    comment: text(dive.comment),
    rating: dive.rating,
  }
}

/** Dykkermakkere skrevet som "Anna, Bo; Carl" til en liste. */
export function parseBuddies(textValue: string): string[] {
  return textValue
    .split(/[,;\n]/)
    .map((name) => name.trim())
    .filter(Boolean)
}

/**
 * Formularen til data, der kan gemmes. Felter, der ikke er relevante
 * (dekogas uden dekodyk, nitrox-% uden nitrox), gemmes som tomme.
 * Billederne og kilden røres ikke her — de sættes af den, der gemmer.
 */
export type DiveFormData = Omit<DiveData, 'sitePhotoPath' | 'logbookImages' | 'source' | 'ssiId'>

export function formToDive(form: DiveForm): DiveFormData {
  const decoGas = form.deco && form.decoGasUsed
  return {
    diveNumber: parseNumber(form.diveNumber),
    date: form.date,
    entryTime: trimmedOrNull(form.entryTime),
    diveKind: form.diveKind,
    purpose: orNull(form.purpose),
    specialty: orNull(form.specialty),
    buddies: parseBuddies(form.buddies),
    instructor: trimmedOrNull(form.instructor),
    center: trimmedOrNull(form.center),
    siteName: form.siteName.trim(),
    country: trimmedOrNull(form.country),
    region: trimmedOrNull(form.region),
    lat: form.lat,
    lng: form.lng,
    waterBody: orNull(form.waterBody),
    entry: orNull(form.entry),
    waterType: orNull(form.waterType),
    current: orNull(form.current),
    surface: orNull(form.surface),
    weather: orNull(form.weather),
    airTempC: parseNumber(form.airTempC),
    waterTempC: parseNumber(form.waterTempC),
    surfaceTempC: parseNumber(form.surfaceTempC),
    visibilityM: parseNumber(form.visibilityM),
    diveTimeMin: parseNumber(form.diveTimeMin),
    maxDepthM: parseNumber(form.maxDepthM),
    avgDepthM: parseNumber(form.avgDepthM),
    weightKg: parseNumber(form.weightKg),
    nitrox: form.nitrox,
    o2Percent: form.nitrox ? parseNumber(form.o2Percent) : 21,
    gearConfig: orNull(form.gearConfig),
    tankMaterial: orNull(form.tankMaterial),
    tankVolumeL: parseNumber(form.tankVolumeL),
    startBar: parseNumber(form.startBar),
    endBar: parseNumber(form.endBar),
    deco: form.deco,
    decoTimeMin: form.deco ? parseNumber(form.decoTimeMin) : null,
    decoGasUsed: decoGas,
    decoTankMaterial: decoGas ? orNull(form.decoTankMaterial) : null,
    decoTankVolumeL: decoGas ? parseNumber(form.decoTankVolumeL) : null,
    decoO2Percent: decoGas ? parseNumber(form.decoO2Percent) : null,
    decoStartBar: decoGas ? parseNumber(form.decoStartBar) : null,
    decoEndBar: decoGas ? parseNumber(form.decoEndBar) : null,
    gearDetails: trimmedOrNull(form.gearDetails),
    comment: trimmedOrNull(form.comment),
    rating: form.rating,
  }
}
