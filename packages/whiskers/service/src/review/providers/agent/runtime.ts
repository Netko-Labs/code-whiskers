import { chown, mkdir, mkdtemp, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, isAbsolute, join } from 'node:path'
import {
  createEgressNetwork,
  createSandbox,
  type EgressProxy,
  jailEnv,
  jailPolicy,
  NOBODY_UID,
  spawnJailed,
  stageForDaemon,
  startEgressProxy,
} from '@code-whiskers/sandbox'
import {
  CONTAINER_BIN_DIR,
  CONTAINER_HOME,
  CONTAINER_WORKDIR,
  SANDBOX_CPUS,
  SANDBOX_MEMORY,
} from './constants'
import type { AgentRuntime, CheckoutDir, DockerRuntimeOptions, JailRuntimeOptions } from './types'
import { isWithin } from './utils'

/**
 * The harness runs on the host; only its tool calls are confined, by resolving every path the
 * agent names (symlinks included) and refusing anything outside the checkout.
 */
export function hostRuntime(checkout: CheckoutDir): AgentRuntime {
  return {
    kind: 'host',
    workdir: checkout.dir,
    isInside: insideCheckout(checkout),
    spawn: null,
    destroy: async () => {},
  }
}

function insideCheckout(checkout: CheckoutDir): AgentRuntime['isInside'] {
  return async (path) => {
    const absolute = isAbsolute(path) ? path : join(checkout.root, path)
    const resolved = await realpath(absolute).catch(() => null)
    return resolved !== null && isWithin(checkout.root, resolved)
  }
}

/** A fresh home the jailed uid owns: config, session state and TMPDIR all land here. */
async function jailHome(uid: number): Promise<string> {
  const home = await mkdtemp(join(tmpdir(), 'whiskers-jail-'))
  await mkdir(join(home, 'tmp'))
  if (process.getuid?.() === 0) {
    await Promise.all([chown(home, uid, uid), chown(join(home, 'tmp'), uid, uid)])
  }
  return home
}

/**
 * The harness runs on this kernel under a launcher that drops to an unprivileged uid, caps
 * rlimits, then applies Landlock (read-only checkout and runtime, one writable home, TCP connect
 * to the proxy's port only) and a seccomp deny-list before it becomes the binary. The proxy runs
 * in this process and admits only `allowHosts`. Paths are the host's, so the host guard applies.
 */
export async function jailRuntime(options: JailRuntimeOptions): Promise<AgentRuntime> {
  const home = await jailHome(options.uid)
  const removeHome = () => rm(home, { recursive: true, force: true })
  let proxy: EgressProxy
  try {
    proxy = await startEgressProxy(options.allowHosts)
  } catch (error) {
    await removeHome()
    throw error
  }
  const policy = jailPolicy({
    checkout: options.checkout.root,
    binary: options.binary,
    home,
    proxyPort: proxy.port,
    uid: options.uid,
    limits: options.limits,
    hasSeccomp: options.hasSeccomp,
  })
  return {
    kind: 'jail',
    workdir: options.checkout.root,
    isInside: insideCheckout(options.checkout),
    spawn: (argv, env) =>
      spawnJailed({ policy, argv, env: jailEnv(env, home, proxy.url), launcherCwd: home }),
    destroy: async () => {
      try {
        await proxy.close()
      } finally {
        await removeHome()
      }
    },
  }
}

/**
 * The harness runs inside a container: checkout and binary mounted read-only, root filesystem
 * read-only, writable space only in tmpfs, and the network an internal one whose single way out
 * is a proxy admitting `allowHosts`. Tool paths are still checked, against the container's view.
 */
export async function dockerRuntime(options: DockerRuntimeOptions): Promise<AgentRuntime> {
  const egress = await createEgressNetwork({ allowHosts: options.allowHosts, ttlMs: options.ttlMs })
  // Root in the worker must not mean root in the sandbox; the checkout is world-readable.
  const isRoot = process.getuid?.() === 0
  const uid = isRoot ? NOBODY_UID : (process.getuid?.() ?? 1000)
  const gid = isRoot ? NOBODY_UID : (process.getgid?.() ?? 1000)
  const user = `${uid}:${gid}`
  let binary: string
  try {
    binary = await stageForDaemon(options.binary)
  } catch (error) {
    await egress.destroy()
    throw error
  }
  let sandbox: Awaited<ReturnType<typeof createSandbox>>
  try {
    sandbox = await createSandbox({
      image: options.image,
      ttlMs: options.ttlMs,
      memory: SANDBOX_MEMORY,
      cpus: SANDBOX_CPUS,
      network: egress.network,
      readOnlyRoot: true,
      tmpfs: ['/tmp:rw,size=256m', `${CONTAINER_HOME}:rw,size=256m,uid=${uid},gid=${gid},mode=700`],
      user,
      mounts: [
        { host: options.checkout.dir, container: CONTAINER_WORKDIR, readOnly: true },
        {
          host: binary,
          container: `${CONTAINER_BIN_DIR}/${basename(options.binary)}`,
          readOnly: true,
        },
      ],
    })
  } catch (error) {
    await egress.destroy()
    throw error
  }
  return {
    kind: 'docker',
    workdir: CONTAINER_WORKDIR,
    isInside: async (path) => isWithin(CONTAINER_WORKDIR, path, 'posix'),
    spawn: (argv, env) =>
      sandbox.spawn({
        argv,
        env: { ...env, HTTPS_PROXY: egress.proxyUrl },
        workdir: CONTAINER_WORKDIR,
      }),
    destroy: async () => {
      try {
        await sandbox.destroy()
      } finally {
        await egress.destroy()
      }
    },
  }
}
