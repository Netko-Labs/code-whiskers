import { useQuery } from '@tanstack/react-query'
import { type Viewer, viewerQuery } from '@/integrations/studio-api'

export function useViewer(): Viewer | undefined {
  return useQuery({ ...viewerQuery(), retry: false }).data
}
