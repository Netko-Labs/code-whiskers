import { dirname } from 'node:path'
import { DEFAULT_JAIL_LIMITS, NOBODY_UID, SYSTEM_GRANTS } from './constants'
import type { JailPolicy, JailPolicyInput, PathGrant } from './types'

/** The worker's own uid when it cannot switch, so the jail still applies without root. */
export function jailIdentity(
  requestedUid: number,
  currentUid: number | undefined = process.getuid?.(),
): { uid: number; gid: number } {
  if (currentUid === 0) return { uid: requestedUid, gid: requestedUid }
  const uid = currentUid ?? requestedUid
  return { uid, gid: process.getgid?.() ?? uid }
}

/**
 * Read-only: the image's runtime, the checkout, the harness binary's directory (it re-executes
 * itself for search). Writable: one fresh home, nothing else. Network: the proxy's port only.
 */
export function jailPolicy(input: JailPolicyInput): JailPolicy {
  const grants: PathGrant[] = [
    ...SYSTEM_GRANTS,
    ...(input.extraGrants ?? []),
    { path: dirname(input.binary), access: 'exec' },
    { path: input.checkout, access: 'read' },
    { path: input.home, access: 'write' },
  ]
  return {
    ...jailIdentity(input.uid ?? NOBODY_UID),
    cwd: input.checkout,
    grants,
    connectPorts: [input.proxyPort],
    limits: { ...DEFAULT_JAIL_LIMITS, ...input.limits },
    hasSeccomp: input.hasSeccomp ?? true,
  }
}

/** Env for the jailed harness: its own home and temp, and every request through the proxy. */
export function jailEnv(
  base: Record<string, string>,
  home: string,
  proxyUrl: string,
): Record<string, string> {
  return {
    ...base,
    HOME: home,
    TMPDIR: `${home}/tmp`,
    HTTPS_PROXY: proxyUrl,
    HTTP_PROXY: proxyUrl,
    NO_PROXY: '',
  }
}
