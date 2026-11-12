import { canvasToJpeg, decodeImage } from './decodeImage'

/**
 * Største side i pixels. Logbogssider skal kunne læses, også håndskrift, så
 * de får en høj opløsning; stedbilleder er kun til at se på.
 */
export const LOGBOOK_MAX_SIZE = 2800
/** Lille logbogsside til telefonen (~200-400 kB) — stadig til at læse. */
export const LOGBOOK_SMALL_SIZE = 1600
export const SITE_PHOTO_MAX_SIZE = 1920
/** Certifikater — små kort, men tekst og nummer skal kunne læses. */
export const CERTIFICATE_MAX_SIZE = 1600

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
 * Billedets EXIF-retning følges (se decodeImage).
 */
export async function resizeImage(file: Blob, maxSize: number, quality = 0.85): Promise<Blob> {
  const image = await decodeImage(file)
  const { width, height } = fitWithin(image.width, image.height, maxSize)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Kunne ikke behandle billedet')
  context.drawImage(image.source, 0, 0, width, height)
  image.close()
  return canvasToJpeg(canvas, quality)
}
