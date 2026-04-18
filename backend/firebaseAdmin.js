/**
 * firebaseAdmin.js
 * ----------------
 * Initializes and exports the Firebase Admin SDK.
 * Provides access to Firestore (db) and Firebase Auth (auth).
 * Loaded once at startup, subsequent requires get the cached instance.
 */

const admin = require("firebase-admin");
const path = require("path");

// Initialize only once (guard against hot-reload re-initialization)
if (!admin.apps.length) {
  let credential;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccount = require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH));
    credential = admin.credential.cert(serviceAccount);
    console.log(`📡 Using Service Account for Project: ${serviceAccount.project_id}`);
  } else {
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    });
    console.log(`📡 Using Env Vars for Project: ${process.env.FIREBASE_PROJECT_ID}`);
  }

  admin.initializeApp({ 
    credential,
    projectId: process.env.FIREBASE_PROJECT_ID || (process.env.FIREBASE_SERVICE_ACCOUNT_PATH ? require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)).project_id : undefined)
  });
  console.log("✅ Firebase Admin initialized");
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
