import { readdirSync } from 'node:fs'
import { z } from 'zod'
import { JAIL_EXIT_SETUP_FAILED, MIN_LANDLOCK_ABI, PROBE_FLAG } from './constants'
import {
  applyLandlock,
  applyLimits,
  applySeccomp,
  closeInheritedFds,
  dropPrivileges,
  enterJail,
  landlockAbi,
  noNewPrivileges,
} from './enter'
import { execve } from './libc'
import { JailPolicySchema } from './schemas'
import type { JailPolicy, JailProbe } from './types'

function describe(error: unknown): string {
  if (error instanceof z.ZodError) return z.prettifyError(error)
  return error instanceof Error ? error.message : String(error)
}

/** The root directory is never granted to the probe: listing it afterwards means Landlock did not take. */
function isConfined(): boolean {
  try {
    readdirSync('/')
    return false
  } catch {
    return true
  }
}

const report = (probe: JailProbe) => process.stdout.write(`${JSON.stringify(probe)}\n`)

/**
 * The real sequence on a throwaway process, so the worker learns what this host allows. Each
 * stage reports before the next: a filter that kills the probe still leaves the Landlock verdict.
 */
function probe(policy: JailPolicy): void {
  const abi = landlockAbi()
  const result: JailProbe = {
    isUsable: false,
    landlockAbi: abi || null,
    canDropUid: false,
    hasSeccomp: false,
    reason: null,
  }
  if (abi < MIN_LANDLOCK_ABI) {
    report({ ...result, reason: abi ? `Landlock ABI ${abi} < ${MIN_LANDLOCK_ABI}` : 'no Landlock' })
    return
  }
  try {
    result.canDropUid = dropPrivileges(policy)
    noNewPrivileges()
    applyLimits(policy.limits)
    applyLandlock(policy, abi)
  } catch (error) {
    report({ ...result, reason: describe(error) })
    return
  }
  if (!isConfined()) {
    report({ ...result, reason: 'Landlock accepted the rules but did not apply' })
    return
  }
  const confined = { ...result, isUsable: true }
  report({ ...confined, reason: 'seccomp killed the probe' })
  try {
    applySeccomp()
    report({ ...confined, hasSeccomp: true })
  } catch (error) {
    report({ ...confined, reason: `no seccomp: ${describe(error)}` })
  }
}

function run(policy: JailPolicy, binary: string, args: string[]): never {
  enterJail(policy)
  closeInheritedFds()
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  )
  return execve(binary, [binary, ...args], env)
}

const parsePolicy = (json = '') => JailPolicySchema.parse(JSON.parse(json))
const [first, ...rest] = process.argv.slice(2)
try {
  if (first === PROBE_FLAG) {
    probe(parsePolicy(rest[0]))
    process.exit(0)
  }
  const [binary, ...args] = rest
  if (!binary) throw new Error('usage: jail <policy-json> <binary> [args...]')
  run(parsePolicy(first), binary, args)
} catch (error) {
  process.stderr.write(`jail: ${describe(error)}\n`)
  process.exit(JAIL_EXIT_SETUP_FAILED)
}
