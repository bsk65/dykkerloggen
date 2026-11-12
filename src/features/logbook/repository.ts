import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../../firebase/config'
import { removeOfflineFile, saveBlobOffline } from '../../shared/api/offlineFiles'
import { deleteStorageFile, uploadImage } from '../../shared/api/storage'
import type { LogbookScan } from './types'

function scansCollection(uid: string) {
  return collection(db, 'users', uid, 'logbookScans')
}

export function subscribeToLogbookScans(
  uid: string,
  onChange: (scans: LogbookScan[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(scansCollection(uid), orderBy('order')),
    (snap) =>
      onChange(
        snap.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            storagePath: data.storagePath as string,
            smallPath: (data.smallPath as string | undefined) ?? null,
            caption: (data.caption as string | undefined) ?? '',
            order: data.order as number,
          }
        }),
      ),
    onError,
  )
}

/**
 * Gemmer et logbogsbillede i to størrelser: den store til at zoome i og en
 * lille, der også lægges på telefonen (kan vises uden dækning). Først
 * billederne i Storage, så posten i Firestore. Billederne er appens egne
 * kopier og overlever, at originalen slettes.
 */
export async function addLogbookScan(
  uid: string,
  image: Blob,
  small: Blob,
  caption: string,
  order: number,
): Promise<void> {
  const ref = doc(scansCollection(uid))
  const storagePath = `users/${uid}/logbook/${ref.id}.jpg`
  const smallPath = `users/${uid}/logbook/${ref.id}-small.jpg`
  await uploadImage(storagePath, image)
  await uploadImage(smallPath, small)
  await saveBlobOffline(smallPath, small).catch(() => undefined)
  await setDoc(ref, { storagePath, smallPath, caption, order, createdAt: serverTimestamp() })
}

export async function updateLogbookCaption(
  uid: string,
  scanId: string,
  caption: string,
): Promise<void> {
  await updateDoc(doc(scansCollection(uid), scanId), { caption })
}

export async function deleteLogbookScan(uid: string, scan: LogbookScan): Promise<void> {
  for (const path of [scan.storagePath, scan.smallPath]) {
    if (!path) continue
    await deleteStorageFile(path)
    await removeOfflineFile(path).catch(() => undefined)
  }
  await deleteDoc(doc(scansCollection(uid), scan.id))
}
