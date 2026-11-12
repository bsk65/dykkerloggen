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

/** Et sted fundet ved søgning (by, ø, strand …), som kortet kan flyve hen til. */
export type PlaceSearchResult = {
  name: string
  /** Resten af adressen, f.eks. "Bali, Indonesien" */
  detail: string
  lat: number
  lng: number
  /** Stedets udstrækning [vest, syd, øst, nord] — kortet zoomer, så det hele ses */
  bounds: [number, number, number, number] | null
}

type NominatimSearchHit = {
  lat: string
  lon: string
  name?: string
  display_name: string
  /** [syd, nord, vest, øst] som tekst */
  boundingbox?: string[]
}

/** Nominatims søgesvar til stedliste (ren funktion — testes). */
export function mapSearchResults(hits: NominatimSearchHit[]): PlaceSearchResult[] {
  return hits.map((hit) => {
    const parts = hit.display_name.split(',').map((p) => p.trim())
    const name = hit.name || parts[0]
    // Postnumre fjernes — de siger ikke meget, når man leder efter et område.
    const rest = parts.filter((p, i) => !(i === 0 && p === name) && !/^\d[\d\s-]*$/.test(p))
    const box = hit.boundingbox?.map(Number)
    return {
      name,
      // Kun de sidste dele (typisk region og land) — hele adressen er for lang.
      detail: rest.slice(-3).join(', '),
      lat: Number(hit.lat),
      lng: Number(hit.lon),
      bounds:
        box && box.length === 4 && box.every(Number.isFinite)
          ? [box[2], box[0], box[3], box[1]]
          : null,
    }
  })
}

/**
 * Søger efter et sted i OpenStreetMap (Nominatim) — så man kan finde
 * området på kortet og derefter sætte nålen præcist. Søges kun, når man
 * trykker Søg (Nominatims regler: ingen søgning for hvert tastetryk).
 */
export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<PlaceSearchResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&accept-language=${getLang()}&q=${encodeURIComponent(query)}`
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('Søgningen mislykkedes')
  return mapSearchResults((await response.json()) as NominatimSearchHit[])
}
