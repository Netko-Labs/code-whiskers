import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { studioEnvConfig } from '@code-whiskers/studio-config'

const MASTER_KEY = studioEnvConfig.app.encryptionKey
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
// Hashed rather than hex-decoded: any length of secret works, and a short one cannot be
// silently truncated into a weaker key.
const KEY_BUFFER = createHash('sha256').update(MASTER_KEY).digest()

function requireKey(): void {
  if (!MASTER_KEY) throw new Error('ENCRYPTION_KEY is not set — secrets cannot be stored')
}

export const encrypt = (text: string) => {
  requireKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, KEY_BUFFER, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export const decrypt = (hash: string) => {
  requireKey()
  const [ivHex, authTagHex, encryptedHex] = hash.split(':')

  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error('Invalid encrypted key format.')
  }

  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')

  const decipher = createDecipheriv(ALGORITHM, KEY_BUFFER, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])

  return decrypted.toString('utf8')
}
