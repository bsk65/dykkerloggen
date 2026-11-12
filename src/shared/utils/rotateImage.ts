import { canvasToJpeg, decodeImage } from './decodeImage'

/**
 * Drejer et billede en kvart omgang (med eller mod uret) og returnerer det som JPEG —
 * til billeder, der er taget på højkant, men skal vises liggende (eller omvendt).
 * Billedets EXIF-retning følges først, så resultatet er det, man ser.
 */
export async function rotateImage(
  file: Blob,
  direction: 'clockwise' | 'counterclockwise',
  quality = 0.92,
): Promise<Blob> {
  const image = await decodeImage(file)
  const canvas = document.createElement('canvas')
  canvas.width = image.height
  canvas.height = image.width
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Kunne ikke dreje billedet')
  if (direction === 'clockwise') {
    context.translate(canvas.width, 0)
    context.rotate(Math.PI / 2)
  } else {
    context.translate(0, canvas.height)
    context.rotate(-Math.PI / 2)
  }
  context.drawImage(image.source, 0, 0)
  image.close()
  return canvasToJpeg(canvas, quality)
}
