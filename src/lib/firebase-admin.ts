import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'

let app: admin.app.App | undefined

function initFromEnv(): admin.app.App {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  let privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n')
  }

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin credentials (env)')
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })
}

function initFromFile(filePath: string): admin.app.App {
  const resolved = path.resolve(filePath)
  const raw = fs.readFileSync(resolved, 'utf8')
  const json = JSON.parse(raw)

  // Some environments store private_key with escaped newlines; normalize
  if (typeof json.private_key === 'string') {
    json.private_key = json.private_key.replace(/\\n/g, '\n')
  }

  return admin.initializeApp({
    credential: admin.credential.cert(json as admin.ServiceAccount),
  })
}

export function getAdminApp() {
  if (!app) {
    const credsPath = process.env.FIREBASE_CREDENTIALS_PATH
    if (credsPath && process.env.NODE_ENV !== 'production') {
      app = initFromFile(credsPath)
    } else {
      // In production, check for required env vars
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        console.error('Missing Firebase Admin env vars on production:', {
          hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
          hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
          hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        })
      }
      app = initFromEnv()
    }
  }
  return app!
}

export const adminAuth = (): admin.auth.Auth => admin.auth(getAdminApp())
