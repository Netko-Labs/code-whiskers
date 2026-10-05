import type { SectionDefinition } from '../../../shared/console-model'
import type { IssueSectionView, SectionScreenView, TableSectionView } from '../types'
import {
  INTEGRATIONS_SECTION,
  RELEASES_SECTION,
} from './empty-sections'

export {
  INTEGRATIONS_SECTION,
  RELEASES_SECTION,
}

export const SECTIONS: Record<TableSectionView, SectionDefinition> = {
  releases: RELEASES_SECTION,
  integrations: INTEGRATIONS_SECTION,
}

export const ISSUE_SECTION_VIEWS: IssueSectionView[] = ['issues', 'regressions']

export const SECTION_VIEWS: SectionScreenView[] = [
  ...(Object.keys(SECTIONS) as TableSectionView[]),
  ...ISSUE_SECTION_VIEWS,
]
