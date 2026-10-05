import type { ReactNode } from 'react'
import type { Tone } from '@/components/shared/status'
import type {
  WhiskersProject,
  WhiskersReleaseCommit,
  WhiskersReviewVerdict,
  WhiskersSuspectCommit,
} from '@/integrations/whiskers'

export type DeploySnippetProps = {
  project: WhiskersProject
  className?: string
}

export type CommitRowProps = {
  commit: WhiskersReleaseCommit | WhiskersSuspectCommit
  repository: string | null
  /** Extra evidence on the right, e.g. a suspect marker. */
  children?: ReactNode
}

export type CommitAuthorProps = {
  name: string
  login: string | null
  avatar: string | null
}

export type ReviewVerdictChipProps = {
  review: WhiskersReviewVerdict
}

export type SuspectCommitsProps = {
  issueId: string
  projectId: string
}

export type VerdictLook = {
  tone: Tone
  label: string
}

export type ReleaseNoteProps = {
  children: ReactNode
  className?: string
}
