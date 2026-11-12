import '../../../shared/map/configureMapLibre'
import { Map as MapLibreMap, Marker } from 'maplibre-gl'
import { useEffect, useRef, useState } from 'react'
import { getCurrentPosition, type PositionError } from '../../../shared/api/geolocation'
import type { PlaceSearchResult } from '../../../shared/api/nominatim'
import type { TextKey } from '../../../shared/i18n/translator'
import { useT } from '../../../shared/i18n/useT'
import { Button } from '../../../shared/ui/Button'
import { baseMapStyle, type BaseMap } from '../../../shared/map/mapStyles'
import { PlaceSearch } from './PlaceSearch'
import styles from './SitePicker.module.css'

/** Hvordan punktet blev sat — GPS-punkter slås op og navngives automatisk. */
export type PickSource = 'map' | 'gps'

type SitePickerProps = {
  lat: number | null
  lng: number | null
  onPick: (lat: number, lng: number, source: PickSource) => void
}

const POSITION_ERRORS: Record<PositionError, TextKey> = {
  denied: 'sites.gpsDenied',
  unavailable: 'sites.gpsUnavailable',
  timeout: 'sites.gpsTimeout',
  unsupported: 'sites.gpsUnsupported',
}

/** Danmark, når der endnu ikke er valgt et sted. */
const DEFAULT_CENTER: [number, number] = [10.5, 56]

/**
 * Kort, hvor dykkerstedet sættes: søg området frem (by, ø …), tryk på
 * kortet, træk i nålen eller brug telefonens position ("Jeg er her").
 */
export function SitePicker({ lat, lng, onPick }: SitePickerProps) {
  const { t } = useT()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markerRef = useRef<Marker | null>(null)
  const onPickRef = useRef(onPick)
  const [baseMap, setBaseMap] = useState<BaseMap>('satellite')
  const [locating, setLocating] = useState(false)
  const [gpsError, setGpsError] = useState<TextKey | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)

  useEffect(() => {
    onPickRef.current = onPick
  }, [onPick])

  // Kortet oprettes én gang; position og kortlag opdateres i effekterne nedenfor.
  useEffect(() => {
    if (!containerRef.current) return
    const hasPoint = lat !== null && lng !== null
    const map = new MapLibreMap({
      container: containerRef.current,
      style: baseMapStyle('satellite'),
      center: hasPoint ? [lng, lat] : DEFAULT_CENTER,
      zoom: hasPoint ? 14 : 5,
      attributionControl: { compact: true },
    })
    map.on('click', (e) => onPickRef.current(e.lngLat.lat, e.lngLat.lng, 'map'))
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- kun ved første visning
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || lat === null || lng === null) return
    if (!markerRef.current) {
      const marker = new Marker({ draggable: true, color: '#f97316' })
      marker.on('dragend', () => {
        const pos = marker.getLngLat()
        onPickRef.current(pos.lat, pos.lng, 'map')
      })
      markerRef.current = marker.setLngLat([lng, lat]).addTo(map)
    } else {
      markerRef.current.setLngLat([lng, lat])
    }
  }, [lat, lng])

  useEffect(() => {
    mapRef.current?.setStyle(baseMapStyle(baseMap))
  }, [baseMap])

  /** Søgeresultat valgt: flyv hen til området — nålen sættes først, når man trykker på kortet. */
  function showPlace(place: PlaceSearchResult) {
    const map = mapRef.current
    if (!map) return
    if (place.bounds) {
      map.fitBounds(place.bounds, { padding: 30, maxZoom: 15, duration: 1500 })
    } else {
      map.flyTo({ center: [place.lng, place.lat], zoom: 13 })
    }
  }

  async function locate() {
    setLocating(true)
    setGpsError(null)
    try {
      const pos = await getCurrentPosition()
      setAccuracy(Math.round(pos.accuracyM))
      onPickRef.current(pos.lat, pos.lng, 'gps')
      mapRef.current?.flyTo({ center: [pos.lng, pos.lat], zoom: 15 })
    } catch (err) {
      setGpsError(POSITION_ERRORS[err as PositionError] ?? 'sites.gpsUnavailable')
    } finally {
      setLocating(false)
    }
  }

  return (
    <div className={styles.picker}>
      <PlaceSearch onSelect={showPlace} />
      <div ref={containerRef} className={styles.map} />
      <div className={styles.actions}>
        <Button type="button" onClick={() => void locate()} disabled={locating}>
          {locating ? t('sites.locating') : `📍 ${t('sites.useMyPosition')}`}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setBaseMap(baseMap === 'map' ? 'satellite' : 'map')}
        >
          {baseMap === 'map' ? t('sites.showSatellite') : t('sites.showMap')}
        </Button>
      </div>
      <p className={styles.hint}>
        {lat === null ? t('sites.pickHint') : t('sites.moveHint')}
        {accuracy !== null && ` ${t('sites.accuracy', { m: accuracy })}`}
      </p>
      {gpsError && <p className={styles.error}>{t(gpsError)}</p>}
    </div>
  )
}
