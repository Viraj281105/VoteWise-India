const admin = require('firebase-admin');
require('dotenv').config();

let db = null;
let auth = null;

function initializeFirebase() {
  if (admin.apps.length > 0) {
    db = admin.firestore();
    auth = admin.auth();
    return { db, auth };
  }

  try {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const serviceAccount = require(require('path').resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS));
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      if (!projectId || !privateKey || !clientEmail) {
        console.warn('[Firebase] Credentials not configured — running in mock mode.');
        return { db: null, auth: null };
      }
      admin.initializeApp({ credential: admin.credential.cert({ projectId, privateKey, clientEmail }) });
    }

    db = admin.firestore();
    auth = admin.auth();
    console.log('[Firebase] Initialized successfully.');
    return { db, auth };
  } catch (error) {
    console.warn('[Firebase] Init failed, running in mock mode:', error.message);
    return { db: null, auth: null };
  }
}

function getFirestore() { if (!db) initializeFirebase(); return db; }
function getAuth() { if (!auth) initializeFirebase(); return auth; }

module.exports = { initializeFirebase, getFirestore, getAuth };