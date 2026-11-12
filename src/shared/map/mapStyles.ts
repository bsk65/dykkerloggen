import type { RasterSourceSpecification, StyleSpecification } from 'maplibre-gl'

/**
 * Kort uden API-nøgle: OpenStreetMap (veje, stednavne) og Esris satellitfoto
 * (kystlinje, rev og bundforhold ses tydeligt — godt til at placere et dyk).
 */
const osmSource: RasterSourceSpecification = {
  type: 'raster',
  tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
  tileSize: 256,
  maxzoom: 19,
  attribution: '© OpenStreetMap-bidragydere',
}

const satelliteSource: RasterSourceSpecification = {
  type: 'raster',
  tiles: [
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  ],
  tileSize: 256,
  maxzoom: 19,
  attribution: 'Esri, Maxar, Earthstar Geographics',
}

export type BaseMap = 'map' | 'satellite'

export function baseMapStyle(baseMap: BaseMap, globe = false): StyleSpecification {
  return {
    version: 8,
    ...(globe ? { projection: { type: 'globe' } } : {}),
    sources: { base: baseMap === 'map' ? osmSource : satelliteSource },
    layers: [{ id: 'base', type: 'raster', source: 'base' }],
  }
}
