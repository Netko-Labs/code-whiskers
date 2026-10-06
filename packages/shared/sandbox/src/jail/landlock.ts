import {
  FS,
  FS_FILE_RIGHTS,
  FS_RIGHTS_SINCE,
  NET,
  NET_RIGHTS_SINCE,
  SCOPES_SINCE,
} from './constants'
import type { LandlockRights, PathAccess } from './types'

function since(table: readonly [number, bigint][], abi: number): bigint {
  return table.reduce((rights, [added, bits]) => (abi >= added ? rights | bits : rights), 0n)
}

/** Every right this ABI can restrict: all of them are handled, so anything not granted is denied. */
export function handledRights(abi: number): LandlockRights {
  return {
    fs: since(FS_RIGHTS_SINCE, abi),
    net: since(NET_RIGHTS_SINCE, abi),
    scoped: since(SCOPES_SINCE, abi),
  }
}

const READ = FS.READ_FILE | FS.READ_DIR

/** Device nodes are never made or removed; `write` stops short of that too. */
const GRANTED: Record<PathAccess, bigint> = {
  read: READ,
  exec: READ | FS.EXECUTE,
  device: FS.READ_FILE | FS.WRITE_FILE | FS.TRUNCATE | FS.IOCTL_DEV,
  write: ~(FS.MAKE_CHAR | FS.MAKE_BLOCK | FS.EXECUTE | FS.IOCTL_DEV),
}

/** A rule's mask: within what the ruleset handles, and only file rights on a file (else EINVAL). */
export function ruleAccess(access: PathAccess, isDirectory: boolean, handledFs: bigint): bigint {
  const mask = GRANTED[access] & handledFs
  return isDirectory ? mask : mask & FS_FILE_RIGHTS
}

/** Only TCP connect to these ports; bind, and UDP where the kernel can tell, never. */
export function connectRight(handledNet: bigint): bigint {
  return handledNet & NET.CONNECT_TCP
}

/** `landlock_ruleset_attr` is versioned by size: send only the fields this ABI knows. */
export function rulesetAttrSize(abi: number): number {
  if (abi >= 6) return 24
  if (abi >= 4) return 16
  return 8
}
