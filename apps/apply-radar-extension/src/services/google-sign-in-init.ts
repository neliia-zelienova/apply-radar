import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  authDomain: import.meta.env.VITE_GOOGLE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_GOOGLE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_GOOGLE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_GOOGLE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_GOOGLE_APP_ID,
  measurementId: import.meta.env.VITE_GOOGLE_MEASUREMENT_ID,
};

const requiredFirebaseEnvKeys = [
  "VITE_GOOGLE_API_KEY",
  "VITE_GOOGLE_AUTH_DOMAIN",
  "VITE_GOOGLE_PROJECT_ID",
  "VITE_GOOGLE_STORAGE_BUCKET",
  "VITE_GOOGLE_MESSAGING_SENDER_ID",
  "VITE_GOOGLE_APP_ID",
] as const;

const missingFirebaseEnvKeys = requiredFirebaseEnvKeys.filter(
  (key) => !import.meta.env[key],
);

if (missingFirebaseEnvKeys.length > 0) {
  // Make this error actionable (instead of failing later inside Firebase init)
  throw new Error(
    [
      "Firebase is not configured for the extension.",
      "Missing env vars:",
      ...missingFirebaseEnvKeys.map((k) => `- ${k}`),
      "\nFix:",
      "- create /apps/apply-radar-extension/.env (or .env.local)",
      "- ensure keys are prefixed with VITE_ (Vite only exposes those to the browser)",
      "- restart the Vite dev server / rebuild the extension",
    ].join("\n"),
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

auth.useDeviceLanguage();

// Note: Google sign-in is implemented elsewhere; this file currently exists to
// keep Firebase init logic in one place (and validate env vars early).

export const googleProvider = new GoogleAuthProvider();

export const signInWithGooglePopup = () =>
  signInWithPopup(auth, googleProvider);
