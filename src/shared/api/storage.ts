import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '../../firebase/config'

/** Download-URL for en fil i Firebase Storage. */
export function getStorageUrl(storagePath: string): Promise<string> {
  return getDownloadURL(ref(storage, storagePath))
}

/**
 * Gemmer et billede i appens egen lagerplads. Billedet er en kopi — det
 * bliver liggende, selvom originalen slettes på telefonen eller i Google Fotos.
 */
export async function uploadImage(storagePath: string, image: Blob): Promise<void> {
  await uploadBytes(ref(storage, storagePath), image, { contentType: image.type || 'image/jpeg' })
}

/** Sletter en fil. En fil, der allerede er væk, er ikke en fejl. */
export async function deleteStorageFile(storagePath: string): Promise<void> {
  try {
    await deleteObject(ref(storage, storagePath))
  } catch (err) {
    if ((err as { code?: string }).code !== 'storage/object-not-found') throw err
  }
}
