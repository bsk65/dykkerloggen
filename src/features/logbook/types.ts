/**
 * Et billede af en side i en gammel papir-logbog
 * (users/{uid}/logbookScans/{scanId}). Selve billedet ligger i Storage.
 */
export type LogbookScan = {
  id: string
  storagePath: string
  /**
   * Lille, men læsbar version, der også ligger på telefonen, så siden kan
   * vises uden dækning. null for ældre billeder (så bruges den store).
   */
  smallPath: string | null
  /** Fri tekst, f.eks. "Logbog 1, s. 12 — dyk 30-34" */
  caption: string
  /** Rækkefølge: tidspunktet for upload (ms) — ældste først */
  order: number
}
