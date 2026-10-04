import {
  brotliDecompressSync,
  gunzipSync,
  inflateRawSync,
  inflateSync,
  type ZlibOptions,
} from 'node:zlib'
import { MAX_COMPRESSED_BODY_BYTES, MAX_DECOMPRESSED_BODY_BYTES, MIB } from './constants'
import type { IngestBody } from './types'

const TOO_LARGE: IngestBody = {
  ok: false,
  status: 413,
  error: `body over ${MAX_COMPRESSED_BODY_BYTES / MIB} MiB sent or ${MAX_DECOMPRESSED_BODY_BYTES / MIB} MiB decoded`,
}

// `maxOutputLength` makes zlib throw a RangeError instead of inflating a bomb.
const ZLIB_OPTIONS: ZlibOptions = { maxOutputLength: MAX_DECOMPRESSED_BODY_BYTES }

function inflate(bytes: Uint8Array): Uint8Array {
  try {
    return inflateSync(bytes, ZLIB_OPTIONS)
  } catch (error) {
    if (error instanceof RangeError) throw error
    // HTTP `deflate` should be zlib-wrapped, but some clients send it raw.
    return inflateRawSync(bytes, ZLIB_OPTIONS)
  }
}

function decompress(encoding: string, bytes: Uint8Array): Uint8Array | undefined {
  switch (encoding) {
    case 'gzip':
    case 'x-gzip':
      return gunzipSync(bytes, ZLIB_OPTIONS)
    case 'deflate':
      return inflate(bytes)
    case 'br':
      return brotliDecompressSync(bytes, ZLIB_OPTIONS)
    default:
      return undefined
  }
}

function encodingsOf(header: string | null): string[] {
  return (header ?? '')
    .split(',')
    .map((encoding) => encoding.trim().toLowerCase())
    .filter((encoding) => encoding && encoding !== 'identity')
}

async function readBounded(request: Request): Promise<Uint8Array | undefined> {
  if (Number(request.headers.get('content-length') ?? 0) > MAX_COMPRESSED_BODY_BYTES) return
  if (!request.body) return new Uint8Array()
  const chunks: Uint8Array[] = []
  let size = 0
  for await (const chunk of request.body) {
    size += chunk.byteLength
    if (size > MAX_COMPRESSED_BODY_BYTES) return
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

/** Reads a Sentry SDK body: bounded on the wire, decoded in reverse `content-encoding` order. */
export async function readIngestBody(request: Request): Promise<IngestBody> {
  const raw = await readBounded(request)
  if (!raw) return TOO_LARGE
  let bytes = raw
  try {
    for (const encoding of encodingsOf(request.headers.get('content-encoding')).reverse()) {
      const decoded = decompress(encoding, bytes)
      if (!decoded) return { ok: false, status: 415, error: `unsupported encoding ${encoding}` }
      bytes = decoded
    }
  } catch (error) {
    if (error instanceof RangeError) return TOO_LARGE
    return { ok: false, status: 400, error: 'body could not be decompressed' }
  }
  return { ok: true, bytes }
}
