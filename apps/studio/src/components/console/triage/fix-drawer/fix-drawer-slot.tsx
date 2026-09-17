import type { ConsoleItem } from '../../shared/console-model'
import { useConsoleStore } from '../../use-console-store'
import type { DetailActions } from '../lib'
import { FixDrawer } from './fix-drawer'

export function FixDrawerSlot({ item, actions }: { item: ConsoleItem; actions: DetailActions }) {
  const open = useConsoleStore((s) => s.fixOpen)
  if (!open) return null
  return <FixDrawer item={item} actions={actions} />
}
