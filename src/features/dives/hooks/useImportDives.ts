import { useState } from 'react'
import { useUid } from '../../auth/hooks/useUid'
import { ImportFileError, onlyNewDives, parseImportFile } from '../logic/importFile'
import { parseUddf, UddfError } from '../logic/uddf'
import { planUddfImport, type ImportPlan } from '../logic/uddfImport'
import { saveImport } from '../repository'
import type { Dive } from '../types'

export type ImportState =
  | { step: 'idle' }
  | { step: 'ready'; plan: ImportPlan }
  | { step: 'importing' }
  | { step: 'done'; created: number; linked: number }
  | { step: 'error'; reason: 'file' | 'save' }

/** Læser en importfil: Dykkerloggens egen (JSON) eller en UDDF-fil fra en dykkercomputer. */
function planFromFile(content: string, existing: Dive[]): ImportPlan {
  if (/<uddf[\s>]/.test(content.slice(0, 2000))) return planUddfImport(parseUddf(content), existing)
  const dives = parseImportFile(content)
  const fresh = onlyNewDives(dives, existing)
  return {
    found: dives.length,
    newDives: fresh.map((data) => ({ data, profile: null, docId: null })),
    links: [],
    duplicates: dives.length - fresh.length,
  }
}

/** Import af dyk fra en fil: vælg fil → se hvad der sker → importér. */
export function useImportDives(existing: Dive[] | null) {
  const uid = useUid()
  const [state, setState] = useState<ImportState>({ step: 'idle' })

  async function chooseFile(file: File) {
    try {
      setState({ step: 'ready', plan: planFromFile(await file.text(), existing ?? []) })
    } catch (error) {
      if (!(error instanceof ImportFileError) && !(error instanceof UddfError)) {
        console.error('Importfilen kunne ikke læses', error)
      }
      setState({ step: 'error', reason: 'file' })
    }
  }

  async function runImport() {
    if (state.step !== 'ready') return
    const { plan } = state
    setState({ step: 'importing' })
    try {
      await saveImport(uid, plan)
      setState({ step: 'done', created: plan.newDives.length, linked: plan.links.length })
    } catch (error) {
      console.error('Importen kunne ikke gemmes', error)
      setState({ step: 'error', reason: 'save' })
    }
  }

  return { state, chooseFile, runImport, reset: () => setState({ step: 'idle' }) }
}
