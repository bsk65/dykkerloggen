import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RequireAuth } from './features/auth/components/RequireAuth'
import { DiveListPage } from './features/dives/components/DiveListPage'
import { AppShell } from './shared/ui/AppShell'
import { RouteErrorPage } from './shared/ui/RouteErrorPage'

// Siderne med kort (MapLibre) er tunge, så de lazy-loades — så åbner
// dyklisten hurtigt, også på en dårlig forbindelse ved vandet.
/* eslint-disable react-refresh/only-export-components -- router-fil, ikke en komponentfil */
const DiveDetailPage = lazy(() =>
  import('./features/dives/components/DiveDetailPage').then((m) => ({ default: m.DiveDetailPage })),
)
const DiveFormPage = lazy(() =>
  import('./features/dives/components/DiveFormPage').then((m) => ({ default: m.DiveFormPage })),
)
const GlobePage = lazy(() =>
  import('./features/globe/components/GlobePage').then((m) => ({ default: m.GlobePage })),
)
const ProfilePage = lazy(() =>
  import('./features/profile/components/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
const CertificateFormPage = lazy(() =>
  import('./features/profile/components/CertificateFormPage').then((m) => ({
    default: m.CertificateFormPage,
  })),
)
/* eslint-enable react-refresh/only-export-components */

function page(element: ReactNode) {
  return <Suspense fallback={null}>{element}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteErrorPage />,
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DiveListPage /> },
      { path: 'dyk/nyt', element: page(<DiveFormPage />) },
      { path: 'dyk/:diveId', element: page(<DiveDetailPage />) },
      { path: 'dyk/:diveId/rediger', element: page(<DiveFormPage />) },
      { path: 'kloden', element: page(<GlobePage />) },
      // Den gamle logbogsfane er erstattet af en logbogsside på hvert dyk.
      { path: 'logboeger', element: <Navigate to="/" replace /> },
      { path: 'profil', element: page(<ProfilePage />) },
      { path: 'profil/certifikat/nyt', element: page(<CertificateFormPage />) },
      { path: 'profil/certifikat/:certId', element: page(<CertificateFormPage />) },
    ],
  },
])
