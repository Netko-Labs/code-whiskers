import * as fs from 'node:fs'
import * as path from 'node:path'
import {
  getAppDir,
  getAppKind,
  getAvailableApps,
  getRepositoryDir,
  parseAppArg,
  validateApp,
} from '../utils/apps'
import { loadEnvFile, run } from '../utils/shell'

/**
 * ✧･ﾟ: *✧･ﾟ:* BUILD COMMAND *:･ﾟ✧*:･ﾟ✧
 *
 * Build an app for production (◕‿◕✿)
 */

/**
 * Build an app for production. Vite apps run `vite build` (Nitro -> .output);
 * headless server apps bundle their entry with `bun build` (-> dist). Both get
 * a self-contained `{out}/migrate/migrate.js` + drizzle folder for Coolify's
 * pre-deployment command.
 */
export async function build(args: string[]) {
  const appName = parseAppArg(args)

  if (!appName) {
    console.error('❌ Please specify an app with --app <name>')
    console.log(`Available apps: ${getAvailableApps().join(', ')}`)
    process.exit(1)
  }

  if (!validateApp(appName)) {
    console.error(`❌ App "${appName}" not found`)
    console.log(`Available apps: ${getAvailableApps().join(', ')}`)
    process.exit(1)
  }

  const appDir = getAppDir(appName)
  const envFile = path.join(appDir, '.env')
  const appEnv = loadEnvFile(envFile)
  const kind = getAppKind(appName)

  console.log(`📦 Building ${appName} for production...`)

  const outDir = kind === 'vite' ? '.output' : 'dist'
  const command =
    kind === 'vite'
      ? ['bun', '--bun', 'vite', 'build']
      : ['bun', 'build', 'src/index.ts', '--outdir', outDir, '--target', 'bun']

  // A dev NODE_ENV in .env would make Vite emit a development SSR bundle
  await run(command, {
    cwd: appDir,
    env: { ...appEnv, NODE_ENV: 'production' },
  })

  await bundleMigrations(appName, path.join(appDir, outDir))

  console.log(`✅ Build for ${appName} completed!`)
}

/**
 * Always emits `{out}/migrate/migrate.js`, even for an app that owns no
 * migrations. Coolify's pre-deployment command runs inside the *previous*
 * container, so an app that stops shipping this file strands the hook: every
 * later deploy dies on `Module not found` before it can build the container
 * that would have fixed it. A no-op costs nothing and breaks that cycle.
 */
async function bundleMigrations(appName: string, outDir: string) {
  const dbDir = path.join(getRepositoryDir(appName), 'src', 'db')
  const entry = path.join(dbDir, 'migrate.ts')
  const migrateOut = path.join(outDir, 'migrate')

  if (!fs.existsSync(entry)) {
    fs.mkdirSync(migrateOut, { recursive: true })
    fs.writeFileSync(
      path.join(migrateOut, 'migrate.js'),
      `console.log('${appName} owns no migrations — nothing to apply.')\n`,
    )
    console.log(`🗃️  ${appName} owns no migrations — wrote a no-op migrate entry.`)
    return
  }

  const drizzleDir = path.join(dbDir, 'drizzle')
  assertJournalComplete(drizzleDir)

  console.log(`🗃️  Bundling migrations into ${path.relative(process.cwd(), migrateOut)}...`)
  await run(['bun', 'build', entry, '--outdir', migrateOut, '--target', 'bun'])
  fs.cpSync(drizzleDir, path.join(migrateOut, 'drizzle'), { recursive: true })
}

/**
 * A journal entry without its .sql builds fine and only fails in the pre-deployment
 * hook — which then runs inside that image on every later deploy. Fail the build instead.
 */
function assertJournalComplete(drizzleDir: string) {
  const journal = JSON.parse(
    fs.readFileSync(path.join(drizzleDir, 'meta', '_journal.json'), 'utf8'),
  ) as { entries: { tag: string }[] }
  const missing = journal.entries
    .map((entry) => `${entry.tag}.sql`)
    .filter((file) => !fs.existsSync(path.join(drizzleDir, file)))
  if (missing.length === 0) return

  console.error(`❌ Migration journal lists files that do not exist: ${missing.join(', ')}`)
  process.exit(1)
}
