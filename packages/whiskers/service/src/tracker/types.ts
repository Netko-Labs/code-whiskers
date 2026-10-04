export type IngestBody =
  | { ok: true; bytes: Uint8Array }
  | { ok: false; status: 400 | 413 | 415; error: string }
