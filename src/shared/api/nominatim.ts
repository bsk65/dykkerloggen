import { getLang } from '../i18n/lang'

export type ReverseGeocodeResult = {
  /** Nærmeste navngivne sted (strand, havn, by) — forslag til stedets navn */
  placeName: string | null
  country: string | null
  /** Kommune/region */
  region: string | null
}

type NominatimAddress = Partial<
  Record<
    | 'beach'
    | 'bay'
    | 'harbour'
    | 'natural'
    | 'water'
    | 'hamlet'
    | 'village'
    | 'town'
    | 'city'
    | 'suburb'
    | 'municipality'
    | 'county'
    | 'state'
    | 'region'
    | 'country',
    string
  >
>

type NominatimReverse = { name?: string; address?: NominatimAddress }

/** Plukker navn, land og region ud af Nominatims svar (ren funktion — testes). */
export function mapReverseResult(result: NominatimReverse): ReverseGeocodeResult {
  const a = result.address ?? {}
  const placeName =
    result.name ||
    a.beach ||
    a.bay ||
    a.harbour ||
    a.natural ||
    a.water ||
    a.hamlet ||
    a.village ||
    a.suburb ||
    a.town ||
    a.city ||
    null
  return {
    // Uden noget nærmere sted svarer Nominatim med selve landet — det er
    // ikke et brugbart navn på et dykkersted.
    placeName: placeName && placeName !== a.country && placeName !== a.state ? placeName : null,
    country: a.country ?? null,
    region: a.municipality ?? a.county ?? a.state ?? a.region ?? null,
  }
}

/**
 * Slår et punkt op i OpenStreetMap (Nominatim) — bruges til at foreslå
 * land og område, når dykket placeres på kortet. Fungerer også midt på
 * havet (så kommer kun land/intet tilbage).
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<ReverseGeocodeResult> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&zoom=14&addressdetails=1&accept-language=${getLang()}&lat=${lat}&lon=${lng}`
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('Kunne ikke slå stedet op')
  return mapReverseResult((await response.json()) as NominatimReverse)
}
