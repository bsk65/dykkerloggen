import type { DiveForm } from '../../logic/diveForm'

export type SetField = <K extends keyof DiveForm>(key: K, value: DiveForm[K]) => void

/** Fælles props for formularens sektioner. */
export type FormSectionProps = { form: DiveForm; set: SetField }
