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
            caption: (data.caption as string | undefined) ?? '',
            order: data.order as number,
          }
        }),
      ),
    onError,
  )
}

/**
 * Gemmer et logbogsbillede: først selve billedet i Storage, så posten i
 * Firestore. Billedet er appens egen kopi og overlever, at originalen slettes.
 */
export async function addLogbookScan(
  uid: string,
  image: Blob,
  caption: string,
  order: number,
): Promise<void> {
  const ref = doc(scansCollection(uid))
  const storagePath = `users/${uid}/logbook/${ref.id}.jpg`
  await uploadImage(storagePath, image)
  await setDoc(ref, { storagePath, caption, order, createdAt: serverTimestamp() })
}

export async function updateLogbookCaption(
  uid: string,
  scanId: string,
  caption: string,
): Promise<void> {
  await updateDoc(doc(scansCollection(uid), scanId), { caption })
}

export async function deleteLogbookScan(uid: string, scan: LogbookScan): Promise<void> {
  await deleteStorageFile(scan.storagePath)
  await deleteDoc(doc(scansCollection(uid), scan.id))
}
