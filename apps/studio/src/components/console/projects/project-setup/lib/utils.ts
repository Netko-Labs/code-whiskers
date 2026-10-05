import { searchText } from '../../../shared/console-routing'
import { DEFAULT_PLATFORM, isPlatformId } from '../../../shared/project-setup'
import { SETUP_STEPS } from './constants'
import type { SetupSearch, SetupSearchInput, SetupStepId } from './types'

function isStep(value: unknown): value is SetupStepId {
  return SETUP_STEPS.some((step) => step.id === value)
}

export function parseSetupSearch(search: SetupSearchInput): SetupSearch {
  const project = searchText(search.project)
  return {
    step: isStep(search.step) ? search.step : 'platform',
    platform: isPlatformId(search.platform) ? search.platform : DEFAULT_PLATFORM,
    ...(project && { project }),
  }
}

/** Install and verify need a project; without one the wizard is at its first step. */
export function stepOf(search: SetupSearch, hasProject: boolean): SetupStepId {
  return hasProject ? search.step : 'platform'
}
