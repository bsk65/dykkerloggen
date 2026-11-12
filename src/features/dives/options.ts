/**
 * Valglisterne i dyk-formularen — samme muligheder som SSI's logbog
 * (my.divessi.com), så dyk senere kan importeres derfra uden tab.
 * Værdierne gemmes i Firestore; teksterne ligger i i18n/texts/options.ts
 * under nøglen `options.<liste>_<værdi>`.
 */

export const DIVE_KINDS = ['scuba', 'xr', 'scr', 'ccr', 'freedive'] as const
export type DiveKind = (typeof DIVE_KINDS)[number]

export const PURPOSES = ['training', 'fun', 'scientific', 'work'] as const
export type Purpose = (typeof PURPOSES)[number]

export const WATER_BODIES = [
  'sea',
  'lake',
  'quarry',
  'artificialLake',
  'openWater',
  'river',
  'blueHole',
  'cave',
  'cenote',
  'pool',
  'confinedWater',
  'indoor',
  'dry',
  'spring',
] as const
export type WaterBody = (typeof WATER_BODIES)[number]

export const ENTRIES = ['shore', 'boat', 'other'] as const
export type Entry = (typeof ENTRIES)[number]

/** Saltvand først — det er standardvalget i nye dyk. */
export const WATER_TYPES = ['salt', 'fresh'] as const
export type WaterType = (typeof WATER_TYPES)[number]
export const DEFAULT_WATER_TYPE: WaterType = 'salt'

export const CURRENTS = ['none', 'light', 'strong', 'extreme'] as const
export type Current = (typeof CURRENTS)[number]

export const SURFACES = ['calm', 'moving', 'stormy'] as const
export type Surface = (typeof SURFACES)[number]

export const WEATHERS = ['sun', 'cloudy', 'rain', 'snow'] as const
export type Weather = (typeof WEATHERS)[number]

export const GEAR_CONFIGS = ['single', 'doubles', 'sidemountDouble', 'sidemountSingle'] as const
export type GearConfig = (typeof GEAR_CONFIGS)[number]

export const TANK_MATERIALS = ['aluminium', 'steel'] as const
export type TankMaterial = (typeof TANK_MATERIALS)[number]

export const SPECIALTIES = [
  'boat',
  'buoyancy',
  'cave',
  'cleanup',
  'computer',
  'deco',
  'deep',
  'adaptive',
  'coralId',
  'coralRestoration',
  'fishId',
  'invasive',
  'mantaId',
  'mine',
  'overhead',
  'publicSafety',
  'searchRecovery',
  'stressRescue',
  'turtleId',
  'scooter',
  'drift',
  'drysuit',
  'equipment',
  'ice',
  'navigation',
  'night',
  'nitrox',
  'photoVideo',
  'altitude',
  'search',
  'shark',
  'wreck',
  'openWater',
  'snorkel',
] as const
export type Specialty = (typeof SPECIALTIES)[number]

/** Alle valglister samlet — nøglen er præfikset i tekst-nøglen. */
export const OPTION_LISTS = {
  diveKind: DIVE_KINDS,
  purpose: PURPOSES,
  waterBody: WATER_BODIES,
  entry: ENTRIES,
  waterType: WATER_TYPES,
  current: CURRENTS,
  surface: SURFACES,
  weather: WEATHERS,
  gearConfig: GEAR_CONFIGS,
  tankMaterial: TANK_MATERIALS,
  specialty: SPECIALTIES,
} as const

export type OptionListName = keyof typeof OPTION_LISTS
