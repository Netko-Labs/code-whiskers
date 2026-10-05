import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ALERTS_KEY } from '@/integrations/alerts-api'
import { createIntegration, integrationsQuery, STUDIO_QUERY_KEY } from '@/integrations/studio-api'
import { useConsoleStore } from '../../../../use-console-store'
import type { AddDestinationForm, DestinationFields } from '../types'

export function useAddDestination(defaultInstallation: string, onDone: () => void) {
  const queryClient = useQueryClient()
  const [fields, setFields] = useState<DestinationFields>({
    kind: 'slack',
    name: '',
    url: '',
    installationId: '',
  })
  const installationId = fields.installationId || defaultInstallation
  const mutation = useMutation({
    mutationFn: () =>
      createIntegration({
        installationId: Number(installationId),
        kind: fields.kind,
        name: fields.name.trim(),
        url: fields.url.trim(),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: integrationsQuery().queryKey })
      // The first destination arms default rules that were waiting for one.
      void queryClient.invalidateQueries({ queryKey: [STUDIO_QUERY_KEY, ALERTS_KEY] })
      useConsoleStore.getState().flash(`${fields.name.trim()} added — send it a test`)
      setFields((current) => ({ ...current, name: '', url: '' }))
      onDone()
    },
  })

  const form: AddDestinationForm = {
    ...fields,
    installationId,
    error: mutation.error?.message ?? null,
    isPending: mutation.isPending,
    canSubmit:
      Boolean(fields.name.trim()) && fields.url.trim().startsWith('https://') && !!installationId,
    setKind: (kind) => setFields((current) => ({ ...current, kind })),
    setName: (name) => setFields((current) => ({ ...current, name })),
    setUrl: (url) => setFields((current) => ({ ...current, url })),
    setInstallationId: (id) => setFields((current) => ({ ...current, installationId: id })),
    submit: () => mutation.mutate(),
  }
  return form
}
