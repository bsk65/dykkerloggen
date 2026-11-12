/** Brugerens profil — felter på users/{uid}. */
export type Profile = {
  name: string
  /** SSI-nummer (eller anden organisations medlemsnummer) */
  diverId: string
}

/**
 * Et dykkercertifikat (users/{uid}/certificates/{certId}). Billederne af for-
 * og bagside ligger i Storage og gemmes også på telefonen, så de kan vises
 * uden dækning.
 */
export type CertificateData = {
  /** F.eks. "Open Water Diver" */
  title: string
  /** F.eks. "SSI", "PADI", "CMAS" */
  organization: string | null
  /** ÅÅÅÅ-MM-DD */
  certDate: string | null
  certNumber: string | null
  instructor: string | null
  frontPath: string | null
  backPath: string | null
}

export type Certificate = CertificateData & { id: string }
