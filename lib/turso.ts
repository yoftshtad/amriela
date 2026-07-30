import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url) {
  throw new Error('TURSO_DATABASE_URL is missing in environment variables')
}

if (!authToken) {
  throw new Error('TURSO_AUTH_TOKEN is missing in environment variables')
}

export const db = createClient({
  url,
  authToken,
})