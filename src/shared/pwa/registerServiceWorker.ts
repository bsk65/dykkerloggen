import { registerSW } from 'virtual:pwa-register'

/**
 * Registrerer service workeren (appens offline-kopi) med automatisk
 * opdatering: når en ny version er hentet og aktiv, genindlæses siden én gang
 * af sig selv (registerType 'autoUpdate' i vite.config.ts).
 *
 * Før blev det lille standard-script (registerSW.js) brugt. Det
 * genindlæste ikke, så en åben app blev ved med at køre den gamle version,
 * indtil man selv havde genindlæst flere gange — og den gamle version kunne
 * så fejle på lazy-loadede filer, der ikke længere fandtes.
 *
 * Der tjekkes efter en ny version ved opstart og hver gang appen bliver
 * synlig igen (f.eks. når telefonen låses op) — ikke med et fast interval,
 * så en opdatering ikke genindlæser siden midt i, at man skriver noget.
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return

  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          void registration.update().catch(() => undefined)
        }
      })
    },
  })
}
