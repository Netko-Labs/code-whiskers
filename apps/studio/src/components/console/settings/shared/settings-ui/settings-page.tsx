import { PageBody, PageHeader } from '@/components/shared/page'
import type { SettingsPageProps } from './lib'

/** A settings tab: title and one line, then stacked panels in the narrow column. */
export function SettingsPage({ title, description, actions, children }: SettingsPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col">
      <PageHeader title={title} description={description} actions={actions} />
      <PageBody width="narrow" className="animate-enter-up gap-8 pt-2 pb-12">
        {children}
      </PageBody>
    </div>
  )
}
