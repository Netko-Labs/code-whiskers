import * as fs from 'node:fs'
import { createRequire } from 'node:module'
import * as path from 'node:path'
import { getAppPackageDir } from './apps'
import { run } from './shell'

const CLAUDE_SDK = '@anthropic-ai/claude-agent-sdk'
const JAIL_LAUNCHER = '@code-whiskers/sandbox/jail-launcher'

function isMusl(): boolean {
  const report = process.report?.getReport() as { header?: { glibcVersionRuntime?: string } }
  return report?.header?.glibcVersionRuntime === undefined
}

/**
 * The Claude Agent SDK spawns a native `claude` from a platform package a `bun build` bundle
 * cannot carry. Copy this platform's build to `{out}/claude/claude`, where the worker looks for
 * it first. An app whose service does not depend on the SDK is left alone.
 */
export function bundleClaudeBinary(appName: string, outDir: string): void {
  const service = path.join(getAppPackageDir(appName), 'service', 'package.json')
  let sdk: string
  try {
    sdk = createRequire(service).resolve(CLAUDE_SDK)
  } catch {
    return
  }
  const libc = process.platform === 'linux' && isMusl() ? '-musl' : ''
  const name = process.platform === 'win32' ? 'claude.exe' : 'claude'
  const platformPackage = `${CLAUDE_SDK}-${process.platform}-${process.arch}${libc}`
  const binary = createRequire(sdk).resolve(`${platformPackage}/${name}`)
  const target = path.join(outDir, 'claude', name)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.copyFileSync(binary, target)
  fs.chmodSync(target, 0o755)
  console.log(`🤖 Copied ${platformPackage} into ${path.relative(process.cwd(), target)}`)
}

/**
 * The jail launcher runs as its own process (it restricts itself, then becomes the harness), so
 * it is a second bundle at `{out}/jail/jail.js`, where the sandbox package looks for it first.
 */
export async function bundleJailLauncher(appName: string, outDir: string): Promise<void> {
  const service = path.join(getAppPackageDir(appName), 'service', 'package.json')
  let entry: string
  try {
    entry = createRequire(service).resolve(JAIL_LAUNCHER)
  } catch {
    return
  }
  const target = path.join(outDir, 'jail')
  await run(['bun', 'build', entry, '--outfile', path.join(target, 'jail.js'), '--target', 'bun'])
  console.log(`🔒 Bundled the jail launcher into ${path.relative(process.cwd(), target)}`)
}
