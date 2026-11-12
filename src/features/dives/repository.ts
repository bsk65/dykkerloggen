import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../../firebase/config'
import { removeOfflineFile, saveBlobOffline } from '../../shared/api/offlineFiles'
import { deleteStorageFile, uploadImage } from '../../shared/api/storage'
import { readLogbookImages } from './logic/logbookPages'
import type { ImportPlan } from './logic/uddfImport'
import type { Dive, DiveData, DiveProfile, LogbookImage } from './types'

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
  // Ældre dyk har ét logbogsbillede i to felter — de læses som en liste.
  delete rest.logbookPagePath
  delete rest.logbookPageSmallPath
  return {
    buddies: [],
    rating: 0,
    ssiId: null,
    computerDiveId: null,
    profile: null,
    ...(rest as Partial<DiveData>),
    logbookImages: readLogbookImages(data),
    id,
  } as Dive
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

/** Dykkets profil fra dykkercomputeren: users/{uid}/dives/{diveId}/profile/data. */
function profileDoc(uid: string, diveId: string) {
  return doc(divesCollection(uid), diveId, 'profile', 'data')
}

/**
 * Gemmer en import: nye dyk (SSI-dyk får id'et `ssi-<id>`, computerdyk
 * `uddf-<id>`, så samme dyk aldrig kan ligge der to gange) og profiler til
 * dyk, der allerede er logget. Skrives i bidder, så profilerne ikke gør
 * den enkelte skrivning for stor.
 */
export async function saveImport(uid: string, plan: ImportPlan): Promise<void> {
  type Write = (batch: ReturnType<typeof writeBatch>) => void
  const writes: { weight: number; write: Write }[] = []
  for (const { data, profile, docId } of plan.newDives) {
    const ref = docId
      ? doc(divesCollection(uid), docId)
      : data.ssiId
        ? doc(divesCollection(uid), `ssi-${data.ssiId}`)
        : doc(divesCollection(uid))
    writes.push({
      weight: profile ? 20 : 1,
      write: (batch) => {
        batch.set(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
        if (profile) batch.set(profileDoc(uid, ref.id), profile)
      },
    })
  }
  for (const { dive, patch, profile } of plan.links) {
    writes.push({
      weight: 20,
      write: (batch) => {
        batch.update(doc(divesCollection(uid), dive.id), { ...patch, updatedAt: serverTimestamp() })
        batch.set(profileDoc(uid, dive.id), profile)
      },
    })
  }
  let batch = writeBatch(db)
  let weight = 0
  for (const w of writes) {
    if (weight + w.weight > 400) {
      await batch.commit()
      batch = writeBatch(db)
      weight = 0
    }
    w.write(batch)
    weight += w.weight
  }
  if (weight > 0) await batch.commit()
}

export function subscribeToDiveProfile(
  uid: string,
  diveId: string,
  onChange: (profile: DiveProfile | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    profileDoc(uid, diveId),
    (snap) => onChange(snap.exists() ? (snap.data() as DiveProfile) : null),
    onError,
  )
}

/** Ændrer et dyk. Som createDive afsluttes løftet først, når serveren har det. */
export function updateDive(uid: string, diveId: string, data: Partial<DiveData>): Promise<void> {
  return updateDoc(doc(divesCollection(uid), diveId), { ...data, updatedAt: serverTimestamp() })
}

/**
 * Gemmer dykkets liste af dokumentationsbilleder. De gamle enkeltfelter
 * fjernes samtidig, så dokumentet kun har den nye liste.
 */
export function setLogbookImages(
  uid: string,
  diveId: string,
  images: LogbookImage[],
): Promise<void> {
  return updateDoc(doc(divesCollection(uid), diveId), {
    logbookImages: images,
    logbookPagePath: deleteField(),
    logbookPageSmallPath: deleteField(),
    updatedAt: serverTimestamp(),
  })
}

/** Sletter et billede fra Storage og fra telefonen. */
export async function deleteDiveImage(path: string): Promise<void> {
  await deleteStorageFile(path)
  await removeOfflineFile(path).catch(() => undefined)
}

/** Sletter dykket og alle dets billeder. */
export async function deleteDive(uid: string, dive: Dive): Promise<void> {
  const paths = [dive.sitePhotoPath, ...dive.logbookImages.flatMap((i) => [i.path, i.smallPath])]
  for (const path of new Set(paths)) {
    if (path) await deleteDiveImage(path)
  }
  // Ikke afventet: sletningen sker straks på enheden og sendes, når der er forbindelse.
  if (dive.profile) deleteDoc(profileDoc(uid, dive.id)).catch(() => undefined)
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

/**
 * Gemmer et dokumentationsbillede (logbogsside, stempel …) i to størrelser: den store
 * til at zoome i og en lille, der også lægges på telefonen (kan vises uden
 * dækning). Billederne er appens egne kopier og overlever, at originalen slettes.
 */
export async function uploadLogbookPage(
  uid: string,
  diveId: string,
  image: Blob,
  small: Blob,
): Promise<LogbookImage> {
  // Tidsstempel + tilfældigt led: flere billeder kan gemmes i samme millisekund.
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const path = `users/${uid}/dives/${diveId}/logbook-${stamp}.jpg`
  const smallPath = `users/${uid}/dives/${diveId}/logbook-${stamp}-small.jpg`
  await uploadImage(path, image)
  await uploadImage(smallPath, small)
  await saveBlobOffline(smallPath, small).catch(() => undefined)
  return { path, smallPath }
}
