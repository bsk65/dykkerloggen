import { useState } from 'react'
import { useUid } from '../../auth/hooks/useUid'
import { ImportFileError, onlyNewDives, parseImportFile } from '../logic/importFile'
import { importDives } from '../repository'
import type { Dive, DiveData } from '../types'

export type ImportState =
  | { step: 'idle' }
  | { step: 'ready'; found: number; fresh: DiveData[] }
  | { step: 'importing' }
  | { step: 'done'; count: number }
  | { step: 'error'; reason: 'file' | 'save' }

/** Import af dyk fra en fil: vælg fil → se hvor mange der er nye → importér. */
export function useImportDives(existing: Dive[] | null) {
  const uid = useUid()
  const [state, setState] = useState<ImportState>({ step: 'idle' })

  async function chooseFile(file: File) {
    try {
      const dives = parseImportFile(await file.text())
      setState({ step: 'ready', found: dives.length, fresh: onlyNewDives(dives, existing ?? []) })
    } catch (error) {
      if (!(error instanceof ImportFileError)) throw error
      setState({ step: 'error', reason: 'file' })
    }
  }

  async function runImport() {
    if (state.step !== 'ready') return
    const { fresh } = state
    setState({ step: 'importing' })
    try {
      await importDives(uid, fresh)
      setState({ step: 'done', count: fresh.length })
    } catch {
      setState({ step: 'error', reason: 'save' })
    }
  }

  return { state, chooseFile, runImport, reset: () => setState({ step: 'idle' }) }
}
