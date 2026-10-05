export interface StudioStore {
  table: string
  bytes: number
  rows: number
  oldest: Date | null
}

export interface StudioStorage {
  databaseBytes: number
  stores: StudioStore[]
}

export interface InstanceSettingsRecord {
  name: string
  /** Null while the name is still the default. */
  updatedAt: Date | null
}
