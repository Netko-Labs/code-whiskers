import { Page } from '@/components/shared/page'
import type { SettingsLayoutProps } from './lib'
import { SettingsNav } from './settings-nav'

/** Every settings tab shares the rail; only the right side changes between them. */
export function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col md:flex-row">
      <SettingsNav />
      <Page>{children}</Page>
    </div>
  )
}
