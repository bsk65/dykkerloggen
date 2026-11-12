import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../../firebase/config'
import { removeOfflineFile, saveBlobOffline } from '../../shared/api/offlineFiles'
import { deleteStorageFile, uploadImage } from '../../shared/api/storage'
import type { Certificate, CertificateData, Profile } from './types'

function certificatesCollection(uid: string) {
  return collection(db, 'users', uid, 'certificates')
}

export function subscribeToProfile(
  uid: string,
  onChange: (profile: Profile) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => {
      const data = snap.data() ?? {}
      onChange({
        name: (data.name as string | undefined) ?? '',
        diverId: (data.diverId as string | undefined) ?? '',
      })
    },
    onError,
  )
}

/** Gemmer profilen (merge — andre felter på users/{uid} bevares). Afventes ikke offline. */
export function saveProfile(uid: string, profile: Profile): Promise<void> {
  return setDoc(
    doc(db, 'users', uid),
    { ...profile, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

export function subscribeToCertificates(
  uid: string,
  onChange: (certificates: Certificate[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    certificatesCollection(uid),
    (snap) =>
      onChange(
        snap.docs.map((d) => {
          const data: Record<string, unknown> = { ...d.data() }
          delete data.createdAt
          delete data.updatedAt
          return { ...(data as CertificateData), id: d.id }
        }),
      ),
    onError,
  )
}

/** Nyt dokument-id til et certifikat (dannes lokalt, så billeder kan gemmes under det). */
export function newCertificateId(uid: string): string {
  return doc(certificatesCollection(uid)).id
}

/** Opretter eller opdaterer et certifikat. */
export async function saveCertificate(
  uid: string,
  certId: string,
  data: CertificateData,
  isNew: boolean,
): Promise<void> {
  await setDoc(
    doc(certificatesCollection(uid), certId),
    { ...data, updatedAt: serverTimestamp(), ...(isNew ? { createdAt: serverTimestamp() } : {}) },
    { merge: true },
  )
}

/**
 * Gemmer et billede af certifikatet og lægger det samtidig på telefonen.
 * Tidsstempel i navnet, så et nyt billede ikke forveksles med det gamle.
 */
export async function uploadCertificateImage(
  uid: string,
  certId: string,
  side: 'front' | 'back',
  image: Blob,
): Promise<string> {
  const path = `users/${uid}/certificates/${certId}/${side}-${Date.now()}.jpg`
  await uploadImage(path, image)
  await saveBlobOffline(path, image).catch(() => undefined)
  return path
}

export async function deleteCertificateImage(path: string): Promise<void> {
  await deleteStorageFile(path)
  await removeOfflineFile(path).catch(() => undefined)
}

export async function deleteCertificate(uid: string, certificate: Certificate): Promise<void> {
  for (const path of [certificate.frontPath, certificate.backPath]) {
    if (path) await deleteCertificateImage(path)
  }
  await deleteDoc(doc(certificatesCollection(uid), certificate.id))
}
