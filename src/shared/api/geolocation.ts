export type Position = { lat: number; lng: number; accuracyM: number }

/** Grunden til, at positionen ikke kunne findes — vises som tekst for brugeren. */
export type PositionError = 'denied' | 'unavailable' | 'timeout' | 'unsupported'

/**
 * Telefonens nuværende position (GPS). Høj nøjagtighed, da et dykkersted
 * gerne skal placeres på få meter nær.
 */
export function getCurrentPosition(): Promise<Position> {
  return new Promise((resolve, reject: (reason: PositionError) => void) => {
    if (!('geolocation' in navigator)) {
      reject('unsupported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyM: pos.coords.accuracy,
        }),
      (err) =>
        reject(
          err.code === err.PERMISSION_DENIED
            ? 'denied'
            : err.code === err.TIMEOUT
              ? 'timeout'
              : 'unavailable',
        ),
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 30_000 },
    )
  })
}
