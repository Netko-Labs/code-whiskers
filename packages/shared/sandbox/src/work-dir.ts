import { chmod, copyFile, mkdir, mkdtemp, rename, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join, sep } from 'node:path'

// A daemon in another container (Docker-in-Docker) resolves `-v` sources on its own filesystem,
// so anything bind-mounted must live on a directory both sides mount at the same path.
function sharedWorkDir(): string | null {
  return process.env.SANDBOX_WORK_DIR?.trim() || null
}

/** A fresh directory the Docker daemon can bind-mount: under `SANDBOX_WORK_DIR`, else tmpdir. */
export async function mkdtempShared(prefix: string): Promise<string> {
  const root = sharedWorkDir() ?? tmpdir()
  await mkdir(root, { recursive: true })
  return mkdtemp(join(root, prefix))
}

/** `path` as the daemon can mount it: copied once onto `SANDBOX_WORK_DIR/bin` when that is set. */
export async function stageForDaemon(path: string): Promise<string> {
  const root = sharedWorkDir()
  if (root === null || path.startsWith(root + sep)) return path
  const staged = join(root, 'bin', basename(path))
  const [source, existing] = await Promise.all([stat(path), stat(staged).catch(() => null)])
  if (existing?.size !== source.size || existing.mtimeMs < source.mtimeMs) {
    await mkdir(join(root, 'bin'), { recursive: true })
    const partial = `${staged}.${process.pid}.partial`
    await copyFile(path, partial)
    await chmod(partial, 0o755)
    await rename(partial, staged)
  }
  return staged
}
