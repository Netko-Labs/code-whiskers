import { Panel } from '@/components/shared/page'
import { formatAge } from '@/shared/format-date'
import { formatBytes, type InstanceStorageProps, STORAGE_CELL, STORAGE_HEAD } from './lib'

/** Every table on disk across both databases, bar-scaled against the largest. */
export function InstanceStorage({ stores, retentionNote }: InstanceStorageProps) {
  const largest = Math.max(1, ...stores.map((store) => store.bytes))

  return (
    <Panel title="Storage" description={retentionNote} isFlush className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-ui">
        <thead>
          <tr className="border-rule-soft border-b">
            <th className={STORAGE_HEAD}>Table</th>
            <th className={STORAGE_HEAD}>Database</th>
            <th className={STORAGE_HEAD}>On disk</th>
            <th className={`${STORAGE_HEAD} text-right`}>Rows</th>
            <th className={`${STORAGE_HEAD} text-right`}>Oldest</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr
              key={`${store.database}:${store.table}`}
              className="border-rule-soft border-b last:border-b-0"
            >
              <td className={`${STORAGE_CELL} font-mono text-xs`}>{store.table}</td>
              <td className={`${STORAGE_CELL} text-2xs text-muted-foreground`}>{store.database}</td>
              <td className={`${STORAGE_CELL} w-[34%]`}>
                <span className="flex items-center gap-2">
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-surface-subtle">
                    <span
                      className="block h-full rounded-full bg-chart-2"
                      style={{ width: `${Math.max(1, (store.bytes / largest) * 100)}%` }}
                    />
                  </span>
                  <span className="w-14 text-right font-mono text-2xs tabular-nums">
                    {formatBytes(store.bytes)}
                  </span>
                </span>
              </td>
              <td className={`${STORAGE_CELL} text-right font-mono text-xs tabular-nums`}>
                {store.isEstimate ? '≈' : ''}
                {store.rows.toLocaleString()}
              </td>
              <td className={`${STORAGE_CELL} text-right font-mono text-2xs text-muted-foreground`}>
                {store.oldest ? formatAge(store.oldest) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  )
}
