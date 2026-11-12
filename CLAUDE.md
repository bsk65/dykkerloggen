# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projekt

Dykkerloggen er en dansksproget PWA (DA/EN) til at logge dyk: samme felter som SSI's logbog (my.divessi.com), placering af dykkersteder på kort (inkl. "Jeg er her" via GPS), beregning af luftforbrug, en 3D-globus med alle dykkersteder, et billede af siden fra den gamle papir-logbog på hvert dyk og en profil med billeder af dykkercertifikater. Bygget efter samme standard som søsterprojektet `../Rejseappen`.

**Stack:** React 19 + TypeScript (strict) + Vite + Firebase 12 (Auth, Firestore, Storage, Hosting) + MapLibre GL 6 (kort og globus) + vite-plugin-pwa + Vitest.

**Firebase-projekt:** `dykkerloggen` (Firestore i `eur3`). Hosting: `https://dykkerloggen.web.app`. Firebase-konfigurationen ligger i `.env` (ikke i git) — se `.env.example`; værdierne hentes med `firebase apps:sdkconfig WEB --project dykkerloggen`.

## Kommandoer

```bash
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build
npm run lint      # ESLint
npm run format    # Prettier
npm test          # Vitest
npm run deploy    # build + firebase deploy --only hosting
firebase deploy --only firestore:rules,storage   # regler
```

## Arkitektur og kodestandard

- **Modulært pr. feature** under `src/features/`: `auth`, `dives`, `sites`, `globe`, `profile`. Hver feature har `components/`, `hooks/`, evt. `logic/`, `types.ts`, `repository.ts`.
- **Kun `repository.ts` kalder Firestore/Storage.** Komponenter bruger hooks; hooks bruger repository-funktioner.
- **Ren logik** (luftforbrug, statistik, steder, formular-konvertering, søgning) i `logic/` som rene funktioner med Vitest-tests (`*.test.ts` ved siden af).
- **Fælles kode** i `src/shared/` (`ui/`, `hooks/`, `api/`, `map/`, `i18n/`, `utils/`) — kun når noget bruges af mere end én feature.
- Ingen fil over ca. 200–300 linjer. Ingen `any`. Ingen inline `style="..."` — al styling i CSS Modules (`Komponent.module.css`). Farver som CSS-variabler i `src/index.css` (marineblåt tema).
- Kør `npm run lint`, `npm run format` og `npm test` før commit.

## Sprog (DA/EN)

**Stående regel:** al brugervendt tekst i både `da` og `en` i `src/shared/i18n/texts/<område>.ts` (`defineTexts`) — aldrig hardcodet. I komponenter: `const { t, locale } = useT()`. Tal/datoer formateres med `locale`. Valglisternes tekster ligger i `texts/options.ts` med nøglen `<liste>_<værdi>` (test i `features/dives/options.test.ts` sikrer, at alle findes).

## Data

| Sted                                            | Indhold                                                                                                                                 |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `users/{uid}/dives/{diveId}`                    | Ét dyk (`DiveData` i `features/dives/types.ts`). Flad struktur, metriske enheder, tomme felter = `null`.                                |
| `users/{uid}`                                   | Profil (`name`, `diverId`).                                                                                                             |
| `users/{uid}/certificates/{certId}`             | Certifikat (`title`, `organization`, `certDate`, `certNumber`, `instructor`, `frontPath`, `backPath`).                                  |
| Storage `users/{uid}/dives/{diveId}/site-*.jpg` | Billede fra dykkerstedet (ét pr. dyk).                                                                                                  |
| Storage `users/{uid}/dives/{diveId}/logbook-*`  | Siden fra den gamle logbog: `logbook-{ts}.jpg` (fuld størrelse, `logbookPagePath`) + `logbook-{ts}-small.jpg` (`logbookPageSmallPath`). |
| Storage `users/{uid}/certificates/{certId}/…`   | Certifikatbilleder, `front-{ts}.jpg` / `back-{ts}.jpg`.                                                                                 |

- Kun brugeren selv kan læse/skrive sin sti (`firestore.rules`, `storage.rules`).
- **Valglister** (`features/dives/options.ts`) følger SSI's lister 1:1, så dyk kan importeres fra SSI senere. Vandtype står som standard på **saltvand**.
- **Import af dyk** (Profil → "Importér dyk", `features/dives/logic/importFile.ts`): JSON-fil `{ format: 'dykkerloggen-import', version: 1, dives: DiveData[] }`. Felterne valideres (ukendte valglisteværdier → null), dyk med et `ssiId`, der allerede findes, springes over, og importerede dyk får dokument-id `ssi-<ssiId>`, så de aldrig dubleres. Brugerens 38 SSI-dyk blev 2026-11-12 hentet ud af my.divessi.com og lagt i `import/dyk-fra-ssi.json` — mappen `import/` er gitignored, da den indeholder personlige data. SSI havde ingen billeder på dykkene.
- Dykkersteder er ikke en egen collection — de udledes af dykkene (`groupDivesBySite`, samme navn = samme sted).
- **Offline:** Firestore har `persistentLocalCache`. Dyk-skrivninger afventes ikke (`useSaveDive`), så et dyk kan logges ved vandet uden dækning og sendes senere. Upload af billeder kræver forbindelse.
- **Billeder på telefonen (offline):** logbogssidernes lille version (`logbookPageSmallPath`) og certifikatbillederne gemmes i Cache Storage (`dykkerloggen-offline-billeder`, nøgle = storage-sti) via `shared/api/offlineFiles.ts`. De lægges der ved upload, og `useOfflineCopies` henter manglende kopier, når dyklisten eller Profil åbnes med forbindelse (status vises med `OfflineStatusLine`). `useStorageUrl` viser offline-kopien først og henter kun fra nettet, når der er forbindelse. `navigator.storage.persist()` anmodes ved opstart, så browseren ikke rydder kopierne.
- **Drej billeder:** `ImageField` har ↺/↻-knapper (`shared/utils/rotateImage.ts`), der drejer billedet i browseren og gemmer det som et nyt billede ved Gem. Et allerede gemt billede hentes til det (offline-kopien først); for logbogssider bruges fuld størrelse (`existingFullPath`), så opløsningen bevares.
- **Certifikat i fuld skærm:** tryk på kortet i `CertificateViewer` åbner `CertificateFill` — billedet fylder hele skærmen og drejes automatisk 90°, når kortets og skærmens retning ikke passer (liggende kort på telefon på højkant). Vend for-/bagside med knappen.
- **Logbøger:** der var tidligere en separat "Logbøger"-fane med løse logbogsbilleder (`users/{uid}/logbookScans`). Den blev fjernet 2026-11-12 efter brugerens ønske — i stedet har hvert dyk sit eget billede af siden i den gamle logbog (formularen: "Side fra den gamle logbog"; vises øverst på dykkets side og som 📖 i listen). `/logboeger` viderestiller til forsiden.
- Billeder formindskes i browseren før upload (`shared/utils/resizeImage.ts`) og gemmes som appens egen kopi — de overlever, at originalen slettes i Google Fotos/på telefonen.

## Ikke-indlysende

- **Google Fotos:** der linkes ikke til Google Fotos. Photos Library API giver siden 2025 kun adgang til billeder, brugeren vælger, og adresserne udløber efter ca. en time. Derfor kopieres billederne. På Android viser den almindelige filvælger Google Fotos som kilde.
- **Luftforbrug (SAC):** `(start − slut) × flaskevolumen / dyktid / (gns.dybde/10 + 1)`. Mangler gennemsnitsdybden, bruges maks. dybde, og resultatet markeres (`usedMaxDepth`) — det er så for lavt og tæller ikke med i statistikkens gennemsnit.
- **Mætningsgrupper** (dekompression) er planlagt, men ikke bygget. Dato, tidspunkt, dyktid og dybde gemmes allerede, så overfladeintervaller kan beregnes.
- MapLibres worker skal sættes via `shared/map/configureMapLibre.ts` (importeres før kort oprettes) — ellers virker GeoJSON-lag ikke i produktion.
- Kort uden API-nøgle: OpenStreetMap og Esri World Imagery (satellit). Stedopslag via Nominatim (`shared/api/nominatim.ts`).
