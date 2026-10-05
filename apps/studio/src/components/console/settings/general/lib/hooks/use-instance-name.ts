import { InstanceSettingsSchema } from '@code-whiskers/studio-domain'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  type Instance,
  type InstanceSettingsInput,
  instanceQuery,
  updateInstanceSettings,
} from '@/integrations/studio-api'
import { useConsoleStore } from '../../../../use-console-store'
import { formError } from '../../../lib'
import type { InstanceNameForm } from '../types'

/** Saves optimistically: the new name shows at once and rolls back if studio refuses it. */
export function useInstanceName(instance: Instance | undefined): InstanceNameForm {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<string | null>(null)
  const saved = instance?.name ?? ''
  const name = draft ?? saved
  const key = instanceQuery().queryKey

  const mutation = useMutation({
    mutationFn: (input: InstanceSettingsInput) => updateInstanceSettings(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: key, exact: true })
      const previous = queryClient.getQueryData(key)
      if (previous) queryClient.setQueryData(key, { ...previous, name: input.name })
      setDraft(null)
      return { previous }
    },
    onError: (error: Error, input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
      setDraft(input.name)
      useConsoleStore.getState().flash(error.message)
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(key, (current) => current && { ...current, ...settings })
      useConsoleStore.getState().flash(`Renamed to ${settings.name}`)
    },
  })

  return {
    name,
    error: draft === null ? null : formError(InstanceSettingsSchema, { name }),
    isDirty: draft !== null && draft.trim() !== saved,
    isPending: mutation.isPending,
    setName: setDraft,
    reset: () => setDraft(null),
    save: () => {
      const parsed = InstanceSettingsSchema.safeParse({ name })
      if (parsed.success && parsed.data.name !== saved) mutation.mutate(parsed.data)
    },
  }
}
