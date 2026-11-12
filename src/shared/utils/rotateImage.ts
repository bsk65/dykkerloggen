/**
 * Drejer et billede en kvart omgang (med eller mod uret) og returnerer det som JPEG —
 * til billeder, der er taget på højkant, men skal vises liggende (eller omvendt).
 * Billedets EXIF-retning følges først, så resultatet er det, man ser.
 */
export async function rotateImage(
  image: Blob,
  direction: 'clockwise' | 'counterclockwise',
  quality = 0.92,
): Promise<Blob> {
  const bitmap = await createImageBitmap(image, { imageOrientation: 'from-image' })
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.height
  canvas.height = bitmap.width
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Kunne ikke dreje billedet')
  if (direction === 'clockwise') {
    context.translate(canvas.width, 0)
    context.rotate(Math.PI / 2)
  } else {
    context.translate(0, canvas.height)
    context.rotate(-Math.PI / 2)
  }
  context.drawImage(bitmap, 0, 0)
  bitmap.close()
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Kunne ikke dreje billedet'))),
      'image/jpeg',
      quality,
    )
  })
}
