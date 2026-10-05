import { IconAlertCircle, IconHash } from '@tabler/icons-react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { whiskersIssuesQuery } from '@/integrations/whiskers'
import { formatAge } from '@/shared/format-date'
import type { PaletteCommand } from '../types'
import { looksLikeIssueId } from '../utils'
import { ISSUE_RESULTS, ISSUE_SEARCH_DEBOUNCE_MS, MIN_ISSUE_QUERY } from '../values'

/** Title search runs on whiskers; a pasted id gets a direct jump even before results land. */
export function useIssueCommands(query: string, close: () => void): PaletteCommand[] {
  const navigate = useNavigate()
  const [needle, setNeedle] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setNeedle(query.trim()), ISSUE_SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

  const { data } = useInfiniteQuery({
    ...whiskersIssuesQuery({ status: 'all', sort: 'last_seen', q: needle, limit: ISSUE_RESULTS }),
    enabled: needle.length >= MIN_ISSUE_QUERY,
    retry: false,
  })

  return useMemo(() => {
    const open = (issueId: string) => () => {
      close()
      void navigate({ to: '/console/issues/$issueId', params: { issueId } })
    }
    const found: PaletteCommand[] =
      needle.length < MIN_ISSUE_QUERY
        ? []
        : (data?.pages[0]?.issues ?? []).map((issue) => ({
            id: `issue:${issue.id}`,
            group: 'Issues',
            label: issue.title,
            icon: IconAlertCircle,
            hint: `${formatAge(issue.lastSeen)} ago`,
            keywords: [needle, issue.id, issue.culprit ?? ''],
            run: open(issue.id),
          }))
    const trimmed = query.trim()
    if (!looksLikeIssueId(trimmed)) return found
    return [
      {
        id: `issue-id:${trimmed}`,
        group: 'Issues',
        label: `Open issue ${trimmed}`,
        icon: IconHash,
        keywords: [trimmed],
        run: open(trimmed),
      },
      ...found,
    ]
  }, [data, needle, query, close, navigate])
}
