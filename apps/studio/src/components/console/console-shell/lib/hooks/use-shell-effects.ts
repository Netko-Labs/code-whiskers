import { useStoredMotion } from '@/shared/motion'
import { useGithubSync } from '../../../shared/console-data'
import { useGlobalShortcuts } from './use-global-shortcuts'
import { useNavPreference } from './use-nav-preference'

/** Everything the shell starts once per console session. */
export function useShellEffects(): void {
  useNavPreference()
  useStoredMotion()
  useGlobalShortcuts()
  useGithubSync()
}
