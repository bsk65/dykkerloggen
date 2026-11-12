import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Mangler miljøvariabel ${name} — se .env.example`)
  }
  return value
}

const env = import.meta.env

const firebaseConfig = {
  apiKey: requireEnv('VITE_FIREBASE_API_KEY', env.VITE_FIREBASE_API_KEY),
  authDomain: requireEnv('VITE_FIREBASE_AUTH_DOMAIN', env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: requireEnv('VITE_FIREBASE_PROJECT_ID', env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: requireEnv('VITE_FIREBASE_STORAGE_BUCKET', env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: requireEnv(
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  ),
  appId: requireEnv('VITE_FIREBASE_APP_ID', env.VITE_FIREBASE_APP_ID),
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
// Dykkene gemmes også på enheden (IndexedDB), så logbogen kan bruges uden
// forbindelse — f.eks. ved et dykkersted uden dækning. Ændringer sendes,
// når forbindelsen er tilbage.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})
export const storage = getStorage(app)
