import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@code-whiskers/ui/components/alert-dialog'
import { Button } from '@code-whiskers/ui/components/button'
import { IconKey } from '@tabler/icons-react'
import {
  DataRow,
  DataRowDescription,
  DataRowLead,
  DataRowMeta,
  DataRowTitle,
  DataRowTrail,
} from '@/components/shared/data-list'
import { formatAge } from '@/shared/format-date'
import type { ApiKeyRowProps } from './lib'

export function ApiKeyRow({ apiKey, onRevoke }: ApiKeyRowProps) {
  const lastUsed = apiKey.lastUsedAt ? `used ${formatAge(apiKey.lastUsedAt)} ago` : 'never used'

  return (
    <DataRow density="auto" className="px-4">
      <DataRowLead>
        <IconKey stroke={1.75} />
      </DataRowLead>
      <span className="flex min-w-0 flex-1 flex-col">
        <DataRowTitle className={apiKey.revokedAt ? 'text-muted-foreground' : undefined}>
          {apiKey.name}
        </DataRowTitle>
        <DataRowDescription className="text-2xs">
          Created {formatAge(apiKey.createdAt)} ago by you ·{' '}
          {apiKey.revokedAt ? `revoked ${formatAge(apiKey.revokedAt)} ago` : lastUsed}
        </DataRowDescription>
      </span>
      <DataRowTrail>
        <DataRowMeta>{apiKey.prefix}…</DataRowMeta>
        {onRevoke && (
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button size="xs" variant="ghost" className="text-muted-foreground" />}
            >
              Revoke
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke {apiKey.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Requests with <span className="font-mono">{apiKey.prefix}…</span> get 401 from the
                  next one on. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel size="sm">Keep it</AlertDialogCancel>
                <AlertDialogCancel size="sm" variant="destructive" onClick={() => onRevoke(apiKey)}>
                  Revoke key
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </DataRowTrail>
    </DataRow>
  )
}
