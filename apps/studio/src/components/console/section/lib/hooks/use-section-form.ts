import { useState } from 'react'
import type { SectionForm, SectionFormResult } from '../../../shared/console-model'
import type { SectionFormState } from '../types'

function initialValues(form: SectionForm): Record<string, string> {
  return Object.fromEntries(
    form.fields.map((field) => [
      field.name,
      field.defaultValue ?? (field.kind === 'select' ? (field.options?.[0]?.value ?? '') : ''),
    ]),
  )
}

/** One state object: values, the pending flag, the error and the result move together. */
export function useSectionForm(form: SectionForm): SectionFormState {
  const [state, setState] = useState<{
    values: Record<string, string>
    isPending: boolean
    error: string | null
    result: SectionFormResult
  }>(() => ({ values: initialValues(form), isPending: false, error: null, result: undefined }))

  return {
    ...state,
    setValue: (name, value) =>
      setState((current) => ({ ...current, values: { ...current.values, [name]: value } })),
    reset: () =>
      setState({ values: initialValues(form), isPending: false, error: null, result: undefined }),
    submit: async () => {
      const missing = form.fields.find(
        (field) => field.isRequired && !state.values[field.name]?.trim(),
      )
      if (missing) {
        setState((current) => ({ ...current, error: `${missing.label} is required` }))
        return false
      }
      setState((current) => ({ ...current, isPending: true, error: null }))
      try {
        const result = await form.onSubmit(state.values)
        setState((current) => ({ ...current, isPending: false, result }))
        return !result?.reveal
      } catch (error) {
        setState((current) => ({
          ...current,
          isPending: false,
          error: error instanceof Error ? error.message : 'Something went wrong',
        }))
        return false
      }
    },
  }
}
