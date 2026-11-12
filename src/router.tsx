import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'
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
const LogbookPage = lazy(() =>
  import('./features/logbook/components/LogbookPage').then((m) => ({ default: m.LogbookPage })),
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
      { path: 'logboeger', element: page(<LogbookPage />) },
    ],
  },
])
