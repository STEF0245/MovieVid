import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read service account key
const serviceAccount = JSON.parse(
	readFileSync(join(__dirname, 'config', 'serviceAccountKey.json'), 'utf8')
)

// Initialize Firebase Admin SDK
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
})

export { admin }
