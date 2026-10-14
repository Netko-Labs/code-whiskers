import { useQuery } from '@tanstack/react-query'
import { Panel } from '@/components/shared/page'
import { instanceReviewerQuery, reviewerSettingsQuery } from '@/integrations/studio-api'
import { credentialState } from './lib'
import { ReviewerCredentialRow } from './reviewer-credential-row'

/** Keys are encrypted with ENCRYPTION_KEY and never shown again; env keys still fill the gaps. */
export function ReviewerCredentials() {
  const { data } = useQuery({ ...reviewerSettingsQuery(), retry: false })
  const { data: reviewer } = useQuery({ ...instanceReviewerQuery(), retry: false })
  if (!data) return null

  return (
    <Panel
      title="Provider keys"
      description="Encrypted in studio and sent only to the worker; a stored key overrides the worker's env"
      isFlush
    >
      {data.credentials.map((credential) => (
        <ReviewerCredentialRow
          key={credential.name}
          credential={credential}
          state={credentialState(credential, reviewer, data.settings.mentionProvider)}
        />
      ))}
    </Panel>
  )
}
