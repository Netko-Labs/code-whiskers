import { realpath } from 'node:fs/promises'
import { basename, isAbsolute, join } from 'node:path'
import { createEgressNetwork, createSandbox } from '@code-whiskers/sandbox'
import {
  CONTAINER_BIN_DIR,
  CONTAINER_HOME,
  CONTAINER_WORKDIR,
  SANDBOX_CPUS,
  SANDBOX_MEMORY,
} from './constants'
import type { AgentRuntime, CheckoutDir, DockerRuntimeOptions } from './types'
import { isWithin } from './utils'

/**
 * The harness runs on the host; only its tool calls are confined, by resolving every path the
 * agent names (symlinks included) and refusing anything outside the checkout.
 */
export function hostRuntime(checkout: CheckoutDir): AgentRuntime {
  return {
    kind: 'host',
    workdir: checkout.dir,
    isInside: async (path) => {
      const absolute = isAbsolute(path) ? path : join(checkout.root, path)
      const resolved = await realpath(absolute).catch(() => null)
      return resolved !== null && isWithin(checkout.root, resolved)
    },
    spawn: null,
    destroy: async () => {},
  }
}

/**
 * The harness runs inside a container: checkout and binary mounted read-only, root filesystem
 * read-only, writable space only in tmpfs, and the network an internal one whose single way out
 * is a proxy admitting `allowHosts`. Tool paths are still checked, against the container's view.
 */
export async function dockerRuntime(options: DockerRuntimeOptions): Promise<AgentRuntime> {
  const egress = await createEgressNetwork({ allowHosts: options.allowHosts, ttlMs: options.ttlMs })
  const user = `${process.getuid?.() ?? 1000}:${process.getgid?.() ?? 1000}`
  const [uid, gid] = user.split(':')
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
          host: options.binary,
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
