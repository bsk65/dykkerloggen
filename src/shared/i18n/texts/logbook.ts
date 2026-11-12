import { defineTexts } from '../translate'

export const logbookTexts = defineTexts({
  da: {
    title: 'Gamle logbøger',
    intro:
      'Tag billeder af siderne i dine papir-logbøger, eller vælg dem fra telefonen eller Google Fotos. Appen gemmer sin egen kopi, så billederne bliver her, selvom du sletter dem andre steder.',
    captionLabel: 'Billedtekst',
    captionPlaceholder: 'F.eks. Logbog 1 — dyk 1-20',
    addImages: 'Tilføj billeder',
    uploading: 'Gemmer billede {done} af {total}…',
    uploadHint:
      'Du kan vælge flere billeder på én gang. De gemmes i den rækkefølge, du vælger dem.',
    empty: 'Ingen logbogsbilleder endnu.',
    error: 'Et eller flere billeder kunne ikke gemmes. Tjek forbindelsen, og prøv igen.',
    loadError: 'Kunne ikke hente logbogsbillederne. Tjek forbindelsen.',
    position: 'Side {n} af {total}',
    previous: 'Forrige',
    next: 'Næste',
    zoomHint: 'Tryk på billedet for at åbne det i fuld størrelse og zoome ind.',
    confirmDelete: 'Ja, slet billedet',
  },
  en: {
    title: 'Old logbooks',
    intro:
      'Take photos of the pages in your paper logbooks, or choose them from your phone or Google Photos. The app keeps its own copy, so the images stay here even if you delete them elsewhere.',
    captionLabel: 'Caption',
    captionPlaceholder: 'E.g. Logbook 1 — dives 1-20',
    addImages: 'Add images',
    uploading: 'Saving image {done} of {total}…',
    uploadHint:
      'You can choose several images at once. They are saved in the order you choose them.',
    empty: 'No logbook images yet.',
    error: 'One or more images could not be saved. Check your connection and try again.',
    loadError: 'Could not load the logbook images. Check your connection.',
    position: 'Page {n} of {total}',
    previous: 'Previous',
    next: 'Next',
    zoomHint: 'Tap the image to open it in full size and zoom in.',
    confirmDelete: 'Yes, delete the image',
  },
})
