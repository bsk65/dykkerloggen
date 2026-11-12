import { setWorkerUrl } from 'maplibre-gl'
// Vite bundler MapLibres web worker (inkl. dens egne imports) som en separat
// fil og giver os dens endelige URL.
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

/**
 * MapLibre finder som standard sin worker som "./maplibre-gl-worker.mjs" ved
 * siden af sin egen fil (import.meta.url). I Vites produktions-build ligger
 * MapLibre inde i en app-chunk, og den fil findes ikke — Firebase Hostings
 * rewrite svarer så med index.html, og workeren fejler ("Worker failed to
 * load"). Uden worker behandles GeoJSON-kilder aldrig, så alle linjer og
 * prikker (spor, rute) forbliver usynlige, mens raster-fliser og DOM-markører
 * stadig virker. Importér denne fil før der oprettes et kort.
 */
setWorkerUrl(maplibreWorkerUrl)
