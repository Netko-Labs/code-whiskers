import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { SectionView } from '@/components/console'
import {
  MOVED_SECTIONS,
  parseSectionTab,
  toSectionView,
} from '@/components/console/shared/console-routing'

function SectionPage() {
  const { section } = Route.useParams()
  const { tab, ...filters } = Route.useSearch()
  const view = toSectionView(section)
  if (!view) throw notFound()

  return <SectionView section={view} tab={tab} filters={filters} />
}

export const Route = createFileRoute('/console/$section')({
  validateSearch: parseSectionTab,
  beforeLoad: ({ params }) => {
    const moved = MOVED_SECTIONS[params.section]
    if (moved) throw redirect({ to: moved, replace: true })
  },
  component: SectionPage,
})
