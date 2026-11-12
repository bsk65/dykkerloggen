import { defineTexts } from '../translate'

export const sitesTexts = defineTexts({
  da: {
    useMyPosition: 'Jeg er her',
    locating: 'Finder din position…',
    showSatellite: 'Vis satellit',
    showMap: 'Vis kort',
    pickHint: 'Tryk på kortet, hvor dykket var — eller tryk "Jeg er her", hvis du står på stedet.',
    moveHint: 'Tryk et andet sted, eller træk i nålen for at flytte den.',
    accuracy: '(Nøjagtighed ca. {m} m.)',
    gpsDenied:
      'Appen har ikke lov til at se din position. Giv tilladelse i browserens eller telefonens indstillinger.',
    gpsUnavailable: 'Positionen kunne ikke findes. Prøv igen, eller sæt nålen på kortet.',
    gpsTimeout: 'Det tog for lang tid at finde positionen. Prøv igen udendørs.',
    gpsUnsupported: 'Denne enhed kan ikke finde sin position.',
  },
  en: {
    useMyPosition: "I'm here",
    locating: 'Finding your position…',
    showSatellite: 'Show satellite',
    showMap: 'Show map',
    pickHint: 'Tap the map where the dive was — or tap "I\'m here" if you are at the site.',
    moveHint: 'Tap somewhere else, or drag the pin to move it.',
    accuracy: '(Accuracy about {m} m.)',
    gpsDenied:
      'The app is not allowed to see your position. Grant permission in the browser or phone settings.',
    gpsUnavailable: 'Your position could not be found. Try again, or place the pin on the map.',
    gpsTimeout: 'Finding your position took too long. Try again outdoors.',
    gpsUnsupported: 'This device cannot determine its position.',
  },
})
