import { Button, buttonVariants } from '@code-whiskers/ui/components/button'
import { Link } from '@tanstack/react-router'
import { KeyValue, KeyValueList, Section } from '@/components/shared/page'
import { SeverityDot } from '@/components/shared/status'
import { formatAge, formatDateTime } from '@/shared/format-date'
import { alertCondition } from '../../../shared/console-data'
import { ALERT_KIND_LABEL, type AlertDetailProps, useAlertActions } from '../../lib'

/** A firing rule: what it watches, when it last held, and the one way to quiet it here. */
export function AlertDetail({ rule }: AlertDetailProps) {
  const { mute } = useAlertActions(rule)
  const firedAt = rule.lastFiredAt

  return (
    <div className="flex min-h-0 flex-1 animate-enter flex-col">
      <header className="flex shrink-0 flex-col gap-3 border-border border-b px-8 pt-5 pb-4">
        <div className="flex items-center justify-between gap-4">
          <span className="truncate text-2xs text-muted-foreground">
            {rule.organization} / <span className="font-mono">alert</span>
          </span>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/console/alerts/$ruleId"
              params={{ ruleId: rule.id }}
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              Edit rule
            </Link>
            <Button size="sm" onClick={mute} title="e">
              Mute
            </Button>
          </div>
        </div>
        <h2 className="m-0 font-semibold text-foreground text-title text-pretty">{rule.name}</h2>
        <div className="flex items-center gap-2 text-ui">
          <SeverityDot tone="error" isPulsing />
          <span className="font-medium">Firing</span>
          {firedAt && (
            <span className="text-muted-foreground">· since {formatAge(firedAt)} ago</span>
          )}
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-auto px-8 py-6">
        <Section
          title="Condition"
          description="Whiskers checks it every minute; its destinations hear about it."
        >
          <p className="m-0 font-mono text-body text-ui">{alertCondition(rule)}</p>
        </Section>
        <KeyValueList>
          <KeyValue label="Trigger">
            {rule.triggers.map((trigger) => ALERT_KIND_LABEL[trigger]).join(' or ')}
          </KeyValue>
          <KeyValue label="Window">{rule.windowMinutes}m</KeyValue>
          <KeyValue label="Threshold">{rule.threshold}</KeyValue>
          <KeyValue label="Last fired">{firedAt ? formatDateTime(firedAt) : '—'}</KeyValue>
          <KeyValue label="Last checked">
            {rule.lastEvaluatedAt ? `${formatAge(rule.lastEvaluatedAt)} ago` : '—'}
          </KeyValue>
        </KeyValueList>
      </div>
    </div>
  )
}
