import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { env } from "./env";

/**
 * Server-side Firebase Admin instance. Used only to VERIFY ID tokens issued
 * by the client-side Firebase SDK, and to manage custom claims for
 * role-based access (e.g. setting `role: "admin"` on a user record).
 * The client never talks to this — only apps/api does.
 */
function getFirebaseAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0) return existing[0]!;

  return initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      // Render literal \n from the .env file as real newlines
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export const firebaseAuth = getAuth(getFirebaseAdminApp());
