/**
 * Hvad der skal ske med et billede ved gem:
 * 'keep' = uændret, 'remove' = slet det, en fil = erstat med den nye.
 */
export type ImageChange = 'keep' | 'remove' | File
