import type { WhiskersProject } from '@/integrations/whiskers'
import { OTLP_KEY_HEADER } from './values'

/** The project in scope that can ingest: one with an enabled key, the oldest first. */
export function ingestingProject(
  projects: WhiskersProject[],
  projectIds: string[] | undefined,
): WhiskersProject | null {
  const inScope = projectIds ? projects.filter((p) => projectIds.includes(p.id)) : projects
  return inScope.find((project) => project.keys.some((key) => key.isEnabled)) ?? null
}

export function otlpEndpoint(origin: string): string {
  return `${origin.replace(/\/$/, '')}/otlp`
}

/** OpenTelemetry SDKs read these at start; the exporter appends `/v1/logs` and `/v1/traces`. */
export function otlpEnvSnippet(endpoint: string, key: string): string {
  return [
    `OTEL_EXPORTER_OTLP_ENDPOINT=${endpoint}`,
    'OTEL_EXPORTER_OTLP_PROTOCOL=http/json',
    `OTEL_EXPORTER_OTLP_HEADERS=${OTLP_KEY_HEADER}=${key}`,
    'OTEL_SERVICE_NAME=checkout',
  ].join('\n')
}
