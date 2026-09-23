export const STUDIO_STORES = [
  { table: 'user', oldest: 'created_at' },
  { table: 'session', oldest: 'created_at' },
  { table: 'organization', oldest: 'synced_at' },
  { table: 'repository', oldest: 'synced_at' },
  { table: 'triage_state', oldest: 'updated_at' },
  { table: 'triage_comment', oldest: 'created_at' },
] as const
