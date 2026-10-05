export type DeployOutcome =
  | { ok: true; releaseId: string; deployId: string; version: string; environment: string }
  | { ok: false; error: string }
