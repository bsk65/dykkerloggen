import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'maplibre-gl/dist/maplibre-gl.css'
import './index.css'
import { App } from './App'
import { applyStoredLang } from './shared/i18n/lang'
import { registerServiceWorker } from './shared/pwa/registerServiceWorker'
import { reloadOnceForStaleChunk } from './shared/utils/staleChunk'

applyStoredLang()
registerServiceWorker()

// Vite udsender denne hændelse, når en lazy-loadet fil ikke kan hentes —
// typisk fordi en ny version er deployet, mens den gamle stadig var åben.
window.addEventListener('vite:preloadError', (event) => {
  if (reloadOnceForStaleChunk()) event.preventDefault()
})

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Rod-element #root findes ikke i index.html')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
