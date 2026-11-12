import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../../firebase/config'
import { deleteStorageFile, uploadImage } from '../../shared/api/storage'
import type { Dive, DiveData } from './types'

/** Brugerens dyk: users/{uid}/dives — kun brugeren selv kan læse/skrive (se firestore.rules). */
function divesCollection(uid: string) {
  return collection(db, 'users', uid, 'dives')
}

function toDive(id: string, data: Record<string, unknown>): Dive {
  // Tidsstemplerne bruges ikke i appen. Felter tilføjet i senere versioner
  // mangler i ældre dokumenter og får en standardværdi.
  const rest: Record<string, unknown> = { ...data }
  delete rest.createdAt
  delete rest.updatedAt
  return { buddies: [], rating: 0, ssiId: null, ...(rest as Partial<DiveData>), id } as Dive
}

export function subscribeToDives(
  uid: string,
  onChange: (dives: Dive[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    divesCollection(uid),
    (snap) => onChange(snap.docs.map((d) => toDive(d.id, d.data()))),
    onError,
  )
}

export function subscribeToDive(
  uid: string,
  diveId: string,
  onChange: (dive: Dive | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(divesCollection(uid), diveId),
    (snap) => onChange(snap.exists() ? toDive(snap.id, snap.data()) : null),
    onError,
  )
}

/**
 * Opretter et dyk. Id'et dannes lokalt, så det kendes med det samme — også
 * uden forbindelse. `written` afsluttes først, når serveren har modtaget det
 * (uden dækning ved dykkerstedet kan det vare længe); dykket er gemt på
 * enheden og sendes af sig selv, når forbindelsen er tilbage.
 */
export function createDive(uid: string, data: DiveData): { id: string; written: Promise<void> } {
  const ref = doc(divesCollection(uid))
  const written = setDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return { id: ref.id, written }
}

/** Ændrer et dyk. Som createDive afsluttes løftet først, når serveren har det. */
export function updateDive(uid: string, diveId: string, data: Partial<DiveData>): Promise<void> {
  return updateDoc(doc(divesCollection(uid), diveId), { ...data, updatedAt: serverTimestamp() })
}

/** Sletter dykket og dets billede fra dykkerstedet. */
export async function deleteDive(uid: string, dive: Dive): Promise<void> {
  if (dive.sitePhotoPath) await deleteStorageFile(dive.sitePhotoPath)
  // Ikke afventet: sletningen sker straks på enheden og sendes, når der er forbindelse.
  deleteDoc(doc(divesCollection(uid), dive.id)).catch(() => undefined)
}

/**
 * Gemmer billedet fra dykkerstedet og returnerer stien. Filnavnet har et
 * tidsstempel, så et nyt billede ikke vises med det gamles cachede adresse.
 */
export async function uploadSitePhoto(uid: string, diveId: string, image: Blob): Promise<string> {
  const path = `users/${uid}/dives/${diveId}/site-${Date.now()}.jpg`
  await uploadImage(path, image)
  return path
}
