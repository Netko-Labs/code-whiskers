import { runMigrations } from './migrations'

// CLI entry for `db:migrate` and the bundled {out}/migrate/migrate.js.
await runMigrations()
console.log('✅ migrations applied')
process.exit(0)
