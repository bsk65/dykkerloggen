import type { DiveSite } from '../../dives/logic/diveSites'

export type SiteFeatureCollection = {
  type: 'FeatureCollection'
  features: {
    type: 'Feature'
    geometry: { type: 'Point'; coordinates: [number, number] }
    properties: { key: string; name: string; count: number }
  }[]
}

/** Steder med position som GeoJSON-punkter til kortet. Steder uden position udelades. */
export function sitesToGeoJson(sites: DiveSite[]): SiteFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: sites
      .filter((site) => site.lat !== null && site.lng !== null)
      .map((site) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [site.lng!, site.lat!] },
        properties: { key: site.key, name: site.name, count: site.dives.length },
      })),
  }
}

/** Midtpunkt (gennemsnit) af stederne — hvor kloden drejes hen fra start. */
export function centerOf(collection: SiteFeatureCollection): [number, number] | null {
  const points = collection.features.map((f) => f.geometry.coordinates)
  if (points.length === 0) return null
  const lng = points.reduce((sum, p) => sum + p[0], 0) / points.length
  const lat = points.reduce((sum, p) => sum + p[1], 0) / points.length
  return [lng, lat]
}
