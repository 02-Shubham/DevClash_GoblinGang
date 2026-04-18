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
    // Option 1: Use a service account JSON file
    const serviceAccount = require(
      path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    );
    credential = admin.credential.cert(serviceAccount);
  } else {
    // Option 2: Use individual environment variables
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // The private key comes with escaped newlines from env vars
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }

  admin.initializeApp({ credential });
  console.log("✅ Firebase Admin initialized");
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
