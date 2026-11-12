import type { Certificate } from '../types'

/** Nyeste certifikat først; certifikater uden dato sidst, efter titel. */
export function sortCertificates(certificates: Certificate[]): Certificate[] {
  return [...certificates].sort((a, b) => {
    if (a.certDate && b.certDate) return b.certDate.localeCompare(a.certDate)
    if (a.certDate) return -1
    if (b.certDate) return 1
    return a.title.localeCompare(b.title)
  })
}

/** Alle billeder af certifikaterne — de skal ligge på telefonen. */
export function certificateImagePaths(certificates: Certificate[]): string[] {
  return certificates.flatMap((c) =>
    [c.frontPath, c.backPath].filter((p): p is string => p !== null),
  )
}

/** Kendte organisationer — foreslås i feltet, men man kan skrive alt. */
export const ORGANIZATIONS = [
  'SSI',
  'PADI',
  'CMAS',
  'NAUI',
  'BSAC',
  'SDI/TDI',
  'GUE',
  'RAID',
  'IANTD',
]
