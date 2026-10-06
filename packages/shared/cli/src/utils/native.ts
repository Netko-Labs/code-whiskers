import * as fs from 'node:fs'
import { createRequire } from 'node:module'
import * as path from 'node:path'
import { getAppPackageDir } from './apps'

const CLAUDE_SDK = '@anthropic-ai/claude-agent-sdk'

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
