/**
 * Et billede af en side i en gammel papir-logbog
 * (users/{uid}/logbookScans/{scanId}). Selve billedet ligger i Storage.
 */
export type LogbookScan = {
  id: string
  storagePath: string
  /** Fri tekst, f.eks. "Logbog 1, s. 12 — dyk 30-34" */
  caption: string
  /** Rækkefølge: tidspunktet for upload (ms) — ældste først */
  order: number
}
