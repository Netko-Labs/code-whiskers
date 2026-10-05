import { useInfiniteQuery } from '@tanstack/react-query'
import { whiskersLogStreamQuery } from '@/integrations/whiskers'
import type { LogsExplorerState } from '../../../lib'
import type { LogStream } from '../types'

export function useLogStream(explorer: LogsExplorerState): LogStream {
  const query = useInfiniteQuery({
    ...whiskersLogStreamQuery(explorer.filter, explorer.window),
    retry: false,
  })

  return {
    lines: query.data?.pages.flat() ?? [],
    isPending: query.isPending,
    isError: query.isError,
    hasMore: query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
    loadMore: () => void query.fetchNextPage(),
    retry: () => void query.refetch(),
  }
}
