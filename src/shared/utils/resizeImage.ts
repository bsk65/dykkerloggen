/**
 * Største side i pixels. Logbogssider skal kunne læses, også håndskrift, så
 * de får en høj opløsning; stedbilleder er kun til at se på.
 */
export const LOGBOOK_MAX_SIZE = 2800
export const SITE_PHOTO_MAX_SIZE = 1920

/** Mål, så den længste side højst er `maxSize` (aldrig forstørret). */
export function fitWithin(
  width: number,
  height: number,
  maxSize: number,
): { width: number; height: number } {
  const scale = Math.min(1, maxSize / Math.max(width, height))
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

/**
 * Formindsker et billede til JPEG, før det gemmes — et telefonbillede på
 * 5-10 MB bliver typisk under 1 MB, så lagerpladsen holder længe gratis.
 * Billedets EXIF-retning følges (createImageBitmap gør det selv).
 */
export async function resizeImage(file: Blob, maxSize: number, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const { width, height } = fitWithin(bitmap.width, bitmap.height, maxSize)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Kunne ikke behandle billedet')
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Kunne ikke behandle billedet'))),
      'image/jpeg',
      quality,
    )
  })
}
