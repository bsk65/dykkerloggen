/** Billedet kunne ikke læses af browseren (ukendt format, f.eks. HEIC i Chrome). */
export class ImageDecodeError extends Error {}

export type DecodedImage = {
  source: CanvasImageSource
  width: number
  height: number
  close: () => void
}

/** Indlæser billedet via et <img> — virker i alle browsere og følger EXIF-retningen. */
function loadImageElement(file: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file)
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new ImageDecodeError('Billedet kunne ikke læses'))
    img.src = url
  }).finally(() => URL.revokeObjectURL(url))
}

/**
 * Læser et billede, så det kan tegnes på et canvas. createImageBitmap med
 * EXIF-retning prøves først (hurtigst); ældre browsere — bl.a. Safari på
 * iPhone — kender ikke den indstilling, og så bruges et almindeligt <img>.
 */
export async function decodeImage(file: Blob): Promise<DecodedImage> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        close: () => bitmap.close(),
      }
    } catch {
      // Prøv med <img> i stedet.
    }
  }
  const img = await loadImageElement(file)
  if (!img.naturalWidth || !img.naturalHeight) {
    throw new ImageDecodeError('Billedet kunne ikke læses')
  }
  return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => {} }
}

/** Canvas til JPEG. */
export function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new ImageDecodeError('Kunne ikke behandle billedet')),
      'image/jpeg',
      quality,
    )
  })
}
