import type { ConsoleItem } from '../../shared/console-model'
import { useConsoleStore } from '../../use-console-store'
import type { DetailActions } from '../lib'
import { FixDrawer } from './fix-drawer'

export function FixDrawerSlot({ item, actions }: { item: ConsoleItem; actions: DetailActions }) {
  const fixItemId = useConsoleStore((s) => s.fixItemId)
  if (fixItemId !== item.id || !item.fix) return null
  return <FixDrawer fix={item.fix} actions={actions} />
}
