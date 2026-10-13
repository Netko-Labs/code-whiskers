import { ApiKeyCreateSchema } from '@code-whiskers/studio-domain'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { type ApiKey, apiKeysQuery, createApiKey } from '@/integrations/studio-api'
import { useConsoleStore } from '../../../../use-console-store'
import { formError } from '../../../lib'
import type { ApiKeyCreateForm, CreatedSecret } from '../types'

/** Not optimistic: the secret only exists in studio's answer, and it is shown exactly once. */
export function useApiKeyCreate(): ApiKeyCreateForm {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [scope, setScope] = useState<ApiKey['scope']>('read')
  const [isTouched, setTouched] = useState(false)
  const [secret, setSecret] = useState<CreatedSecret | null>(null)

  const mutation = useMutation({
    mutationFn: (input: { name: string; scope: ApiKey['scope'] }) =>
      createApiKey(input.name, input.scope),
    onSuccess: (created, input) => {
      setSecret({ name: input.name, key: created.key, scope: input.scope })
      setName('')
      setTouched(false)
      void queryClient.invalidateQueries({ queryKey: apiKeysQuery().queryKey })
    },
    onError: (error: Error) => useConsoleStore.getState().flash(error.message),
  })

  return {
    name,
    scope,
    setScope,
    error: isTouched ? formError(ApiKeyCreateSchema, { name }) : null,
    isPending: mutation.isPending,
    secret,
    setName: (next) => {
      setName(next)
      setTouched(true)
    },
    submit: () => {
      setTouched(true)
      const parsed = ApiKeyCreateSchema.safeParse({ name, scope })
      if (parsed.success) mutation.mutate(parsed.data)
    },
    dismissSecret: () => setSecret(null),
  }
}
