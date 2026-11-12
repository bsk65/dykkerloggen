import type { Dive } from '../types'
import { emptyDiveForm, formToDive } from './diveForm'

/** Et dyk til tests — kun de felter, testen handler om, skal angives. */
export function testDive(overrides: Partial<Dive> = {}): Dive {
  return {
    ...formToDive(emptyDiveForm(1, new Date(2026, 0, 1, 10, 0))),
    sitePhotoPath: null,
    source: 'app',
    ssiId: null,
    id: 'dive',
    ...overrides,
  }
}
