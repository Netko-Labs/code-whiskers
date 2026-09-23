import { HOTSPOT_DIRECTORY_DEPTH } from './constants'

/** `apps/studio/src/components/x.tsx` → `apps/studio/src`; a root file sits in `.`. */
export function directoryOf(file: string, depth = HOTSPOT_DIRECTORY_DEPTH): string {
  const directories = file.split('/').slice(0, -1).filter(Boolean)
  return directories.slice(0, depth).join('/') || '.'
}
