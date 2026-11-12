import { useMemo } from 'react'

/**
 * Midlertidig adresse til en lokal fil (forhåndsvisning før upload).
 * Adressen frigives ikke eksplicit: det drejer sig om ét billede ad gangen,
 * og browseren rydder op, når siden lukkes. (Frigivelse i en effekt-cleanup
 * ville ødelægge forhåndsvisningen under React StrictMode.)
 */
export function useObjectUrl(file: Blob | null): string | null {
  return useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
}
