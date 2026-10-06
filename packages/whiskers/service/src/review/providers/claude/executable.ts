import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { BUNDLED_CLAUDE_PATH, SDK_PACKAGE } from './constants'
import type { ExecutableLookup, ResolvedExecutable } from './types'

/**
 * `CLAUDE_CODE_EXECUTABLE` wins; a build ships the binary next to the bundle; in a source
 * checkout the SDK finds its own platform package.
 */
export function resolveClaudeExecutable({
  configured,
  mainDir,
  exists,
}: ExecutableLookup): ResolvedExecutable {
  if (configured) return { path: configured, source: 'env' }
  const bundled = join(mainDir, BUNDLED_CLAUDE_PATH)
  if (exists(bundled)) return { path: bundled, source: 'bundled' }
  return { path: null, source: 'sdk' }
}

function isMusl(): boolean {
  const report = process.report?.getReport() as { header?: { glibcVersionRuntime?: string } }
  return report?.header?.glibcVersionRuntime === undefined
}

/** The platform package the SDK would spawn, as the SDK picks it; null outside a source checkout. */
export function sdkPlatformBinary(
  platform: NodeJS.Platform = process.platform,
  arch: string = process.arch,
): string | null {
  const suffix = platform === 'linux' && isMusl() ? '-musl' : ''
  const binary = platform === 'win32' ? 'claude.exe' : 'claude'
  try {
    const sdk = createRequire(import.meta.url).resolve(SDK_PACKAGE)
    return createRequire(sdk).resolve(`${SDK_PACKAGE}-${platform}-${arch}${suffix}/${binary}`)
  } catch {
    return null
  }
}

/** The binary on this host, wherever it comes from. */
export function hostClaudeBinary(configured: string | undefined): ResolvedExecutable {
  const resolved = resolveClaudeExecutable({
    configured,
    mainDir: dirname(Bun.main),
    exists: existsSync,
  })
  if (resolved.path) return resolved
  const fromSdk = sdkPlatformBinary()
  return fromSdk ? { path: fromSdk, source: 'sdk' } : { path: null, source: 'missing' }
}
