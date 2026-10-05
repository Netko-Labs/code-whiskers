import { Switch } from '@code-whiskers/ui/components/switch'
import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import {
  DataRow,
  DataRowDescription,
  DataRowLead,
  DataRowMeta,
  DataRowTitle,
  DataRowTrail,
} from '@/components/shared/data-list'
import { SeverityDot } from '@/components/shared/status'
import { formatAge } from '@/shared/format-date'
import { DestinationIcon } from '../shared/destination-icon'
import { STATE_COPY, whenSummary } from '../shared/rule-copy'
import { type RuleRowProps, ruleDestinations } from './lib'

const SHOWN_DESTINATIONS = 3

/** The switch sits beside the row link, never inside it: one interactive element per target. */
export function RuleRow({ rule, destinations, onEnabledChange }: RuleRowProps) {
  const targets = ruleDestinations(rule, destinations)
  const isFiring = rule.state === 'firing'
  const isMuted = rule.state === 'muted'
  const state = STATE_COPY[rule.state]

  return (
    <div className="relative">
      <DataRow
        tone={isFiring ? 'error' : 'neutral'}
        render={<Link to="/console/alerts/$ruleId" params={{ ruleId: rule.id }} />}
        className="pr-16"
      >
        <DataRowLead>
          <SeverityDot tone={state.tone} isPulsing={isFiring} label={state.label} />
        </DataRowLead>
        <DataRowTitle className={cn(isMuted && 'text-muted-foreground')}>{rule.name}</DataRowTitle>
        <DataRowDescription className="font-mono text-2xs">{whenSummary(rule)}</DataRowDescription>
        <DataRowTrail>
          {isFiring && <span className="font-medium text-2xs text-severity-error-ink">Firing</span>}
          {targets.length === 0 ? (
            <span className="text-2xs text-severity-warning-ink">No destination</span>
          ) : (
            <span className="flex items-center gap-1" title={targets.map((t) => t.name).join(', ')}>
              {targets.slice(0, SHOWN_DESTINATIONS).map((target) => (
                <DestinationIcon key={target.id} kind={target.kind} />
              ))}
              {targets.length > SHOWN_DESTINATIONS && (
                <span className="font-mono text-2xs text-muted-foreground">
                  +{targets.length - SHOWN_DESTINATIONS}
                </span>
              )}
            </span>
          )}
          <DataRowMeta className="w-16 text-right">
            {rule.lastFiredAt ? `${formatAge(rule.lastFiredAt)} ago` : 'never'}
          </DataRowMeta>
        </DataRowTrail>
      </DataRow>
      <Switch
        size="sm"
        checked={!isMuted}
        onCheckedChange={onEnabledChange}
        aria-label={isMuted ? `Arm ${rule.name}` : `Mute ${rule.name}`}
        className="absolute top-1/2 right-gutter -translate-y-1/2"
      />
    </div>
  )
}
