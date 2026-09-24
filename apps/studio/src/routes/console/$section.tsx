import { createFileRoute, notFound } from '@tanstack/react-router'
import { SectionView } from '@/components/console'
import { parseSectionTab, toSectionView } from '@/components/console/shared/console-routing'

function SectionPage() {
  const { section } = Route.useParams()
  const { tab, q, service } = Route.useSearch()
  const view = toSectionView(section)
  if (!view) throw notFound()

  return <SectionView section={view} tab={tab} filters={{ q, service }} />
}

export const Route = createFileRoute('/console/$section')({
  validateSearch: parseSectionTab,
  component: SectionPage,
})
