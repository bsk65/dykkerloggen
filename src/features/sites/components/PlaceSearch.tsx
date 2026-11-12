import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { searchPlaces, type PlaceSearchResult } from '../../../shared/api/nominatim'
import type { TextKey } from '../../../shared/i18n/translator'
import { useT } from '../../../shared/i18n/useT'
import { Button } from '../../../shared/ui/Button'
import styles from './PlaceSearch.module.css'

/**
 * Søg efter en by, ø eller strand, så kortet kan flyve hen til området.
 * Ét resultat vælges straks; flere vises som en liste. Selve dykkerstedet
 * sættes bagefter med et tryk på kortet.
 */
export function PlaceSearch({ onSelect }: { onSelect: (place: PlaceSearchResult) => void }) {
  const { t } = useT()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [message, setMessage] = useState<TextKey | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => () => controllerRef.current?.abort(), [])

  function choose(place: PlaceSearchResult) {
    setResults([])
    setMessage('sites.searchChosen')
    onSelect(place)
  }

  async function search() {
    const text = query.trim()
    if (!text) return
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setSearching(true)
    setMessage(null)
    setResults([])
    try {
      const found = await searchPlaces(text, controller.signal)
      if (found.length === 0) setMessage('sites.searchNone')
      else if (found.length === 1) choose(found[0])
      else setResults(found)
    } catch {
      if (!controller.signal.aborted) setMessage('sites.searchError')
    } finally {
      if (controllerRef.current === controller) setSearching(false)
    }
  }

  // Feltet ligger inde i dykkets formular: Enter skal søge, ikke gemme dykket.
  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      void search()
    }
  }

  return (
    <div className={styles.search}>
      <label className={styles.label} htmlFor="place-search">
        {t('sites.searchLabel')}
      </label>
      <div className={styles.row}>
        <input
          id="place-search"
          className={styles.input}
          type="search"
          enterKeyHint="search"
          placeholder={t('sites.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => void search()}
          disabled={searching || !query.trim()}
        >
          {searching ? t('sites.searching') : t('sites.search')}
        </Button>
      </div>
      {results.length > 0 && (
        <ul className={styles.results}>
          {results.map((place) => (
            <li key={`${place.lat},${place.lng},${place.name}`}>
              <button type="button" className={styles.result} onClick={() => choose(place)}>
                <span className={styles.name}>{place.name}</span>
                {place.detail && <span className={styles.detail}>{place.detail}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      {message && (
        <p className={message === 'sites.searchChosen' ? styles.info : styles.error}>
          {t(message)}
        </p>
      )}
    </div>
  )
}
