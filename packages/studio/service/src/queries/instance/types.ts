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
