import '../../../shared/map/configureMapLibre'
import { Map as MapLibreMap, Marker } from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import { baseMapStyle } from '../../../shared/map/mapStyles'
import styles from './SiteMiniMap.module.css'

/** Lille kort, der viser hvor dykket fandt sted. */
export function SiteMiniMap({ lat, lng }: { lat: number; lng: number }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const map = new MapLibreMap({
      container: containerRef.current,
      style: baseMapStyle('satellite'),
      center: [lng, lat],
      zoom: 13,
      attributionControl: { compact: true },
    })
    new Marker({ color: '#f97316' }).setLngLat([lng, lat]).addTo(map)
    return () => map.remove()
  }, [lat, lng])

  return <div ref={containerRef} className={styles.map} />
}
