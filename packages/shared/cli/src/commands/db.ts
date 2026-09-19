import { existsSync, readFileSync } from 'node:fs'
import * as path from 'node:path'
import {
  getAppDir,
  getAvailableApps,
  getRepositoryDir,
  parseAppArg,
  validateApp,
} from '../utils/apps'
import { getPackageScope } from '../utils/scope'
import { getRootDir, loadEnvFile, run } from '../utils/shell'

/**
 * ✧･ﾟ: *✧･ﾟ:* DATABASE COMMANDS *:･ﾟ✧*:･ﾟ✧
 *
 * Drizzle database commands per app (◕‿◕✿)
 */

/** A worker app shares another app's database and owns no migrations of its own. */
function hasDbScript(appName: string, script: string): boolean {
  const manifest = path.join(getRepositoryDir(appName), 'package.json')
  if (!existsSync(manifest)) return false
  const { scripts } = JSON.parse(readFileSync(manifest, 'utf-8')) as {
    scripts?: Record<string, string>
  }
  return Boolean(scripts?.[script])
}

/**
 * Run Drizzle migrations for an app
 */
export async function dbMigrate(args: string[]) {
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
  const repoDir = getRepositoryDir(appName)
  const envFile = path.join(appDir, '.env')

  if (!hasDbScript(appName, 'db:migrate')) {
    console.log(`⏭️  ${appName} has no migrations of its own — skipping.`)
    return
  }

  console.log(`🗃️  Running migrations for ${appName}...`)

  await run(['bun', 'run', `--env-file=${envFile}`, '--cwd', repoDir, 'db:migrate'], {
    cwd: getRootDir(),
  })

  console.log(`✅ Migrations for ${appName} completed!`)
}

/**
 * Generate Drizzle schema for an app
 */
export async function dbGenerate(args: string[]) {
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

  if (!hasDbScript(appName, 'db:generate')) {
    console.log(`⏭️  ${appName} has no schema of its own — skipping.`)
    return
  }

  console.log(`🗃️  Generating schema for ${appName}...`)

  const scope = await getPackageScope()
  await run(['bun', 'run', '--filter', `${scope}/${appName}-repository`, 'db:generate'], {
    cwd: getRootDir(),
  })

  console.log(`✅ Schema generation for ${appName} completed!`)
}

/**
 * Run seed script for an app
 */
export async function dbSeed(args: string[]) {
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
  const repoDir = getRepositoryDir(appName)
  const envFile = path.join(appDir, '.env')

  console.log(`🌱 Seeding database for ${appName}...`)

  await run(['bun', 'run', `--env-file=${envFile}`, '--cwd', repoDir, 'db:seed'], {
    cwd: getRootDir(),
  })

  console.log(`✅ Database seeding for ${appName} completed!`)
}

/**
 * Push schema changes directly (no migration file)
 */
export async function dbPush(args: string[]) {
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
  const repoDir = getRepositoryDir(appName)
  const envFile = path.join(appDir, '.env')
  const appEnv = loadEnvFile(envFile)

  console.log(`🚀 Pushing schema changes for ${appName}...`)

  await run(['bunx', '--bun', 'drizzle-kit', 'push'], {
    cwd: repoDir,
    env: { ...appEnv, DOTENV_CONFIG_PATH: envFile },
  })

  console.log(`✅ Schema push for ${appName} completed!`)
}

/**
 * Open Drizzle Studio for an app
 */
export async function dbStudio(args: string[]) {
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
  const repoDir = getRepositoryDir(appName)
  const envPath = path.join(appDir, '.env')

  if (!existsSync(envPath)) {
    console.error(`❌ No .env file found for ${appName}`)
    process.exit(1)
  }

  console.log(`🔍 Opening Drizzle Studio for ${appName}...`)
  const env = loadEnvFile(envPath)

  await run(['bunx', 'drizzle-kit', 'studio'], {
    cwd: repoDir,
    env,
  })
}
