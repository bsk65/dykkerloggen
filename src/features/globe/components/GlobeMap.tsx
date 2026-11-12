import '../../../shared/map/configureMapLibre'
import { Map as MapLibreMap, type GeoJSONSource, type StyleSpecification } from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import { baseMapStyle } from '../../../shared/map/mapStyles'
import { centerOf, type SiteFeatureCollection } from '../logic/sitesGeoJson'
import styles from './GlobeMap.module.css'

type GlobeMapProps = {
  sites: SiteFeatureCollection
  onSelect: (siteKey: string) => void
}

const SOURCE = 'sites'

/** Satellitbillede som globus med en svag atmosfære omkring. */
function globeStyle(): StyleSpecification {
  return {
    ...baseMapStyle('satellite', true),
    sky: { 'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 7, 0] },
  }
}

export function GlobeMap({ sites, onSelect }: GlobeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const onSelectRef = useRef(onSelect)
  const sitesRef = useRef(sites)
  const centeredRef = useRef(centerOf(sites) !== null)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    if (!containerRef.current) return
    const map = new MapLibreMap({
      container: containerRef.current,
      style: globeStyle(),
      center: centerOf(sitesRef.current) ?? [10.5, 56],
      zoom: 1.6,
      attributionControl: { compact: true },
    })
    mapRef.current = map

    map.on('load', () => {
      map.addSource(SOURCE, { type: 'geojson', data: sitesRef.current })
      map.addLayer({
        id: 'site-halo',
        type: 'circle',
        source: SOURCE,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'count'], 1, 10, 20, 18],
          'circle-color': '#f97316',
          'circle-opacity': 0.25,
        },
      })
      map.addLayer({
        id: 'site-dot',
        type: 'circle',
        source: SOURCE,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'count'], 1, 5, 20, 9],
          'circle-color': '#f97316',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1.5,
        },
      })
    })

    // Fingre er brede — et tryk tæt på en prik tæller også.
    map.on('click', (e) => {
      const pad = 12
      const features = map.queryRenderedFeatures(
        [
          [e.point.x - pad, e.point.y - pad],
          [e.point.x + pad, e.point.y + pad],
        ],
        { layers: ['site-dot'] },
      )
      const key = features[0]?.properties?.key as string | undefined
      if (!key) return
      onSelectRef.current(key)
      map.flyTo({ center: e.lngLat, zoom: Math.max(map.getZoom(), 9) })
    })
    map.on('mouseenter', 'site-dot', () => (map.getCanvas().style.cursor = 'pointer'))
    map.on('mouseleave', 'site-dot', () => (map.getCanvas().style.cursor = ''))

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    sitesRef.current = sites
    const map = mapRef.current
    map?.getSource<GeoJSONSource>(SOURCE)?.setData(sites)
    // Dykkene hentes ofte først, efter kortet er oprettet — drej så kloden
    // hen over dykkerstederne én gang.
    const center = centerOf(sites)
    if (map && center && !centeredRef.current) {
      centeredRef.current = true
      map.easeTo({ center, duration: 1200 })
    }
  }, [sites])

  return <div ref={containerRef} className={styles.map} />
}
