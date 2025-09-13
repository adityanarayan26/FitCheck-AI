// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// (Optional) import other Firebase services here

// Prevent multiple initializations
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: "fitcheck-ai-c9f34",
  storageBucket: "fitcheck-ai-c9f34.firebasestorage.app",
  messagingSenderId: "160623249147",
  appId: "1:160623249147:web:409ca6413b8bc817b8925e",
  measurementId: "G-VGNRNZ7CF7"
};

// ✅ Use getApps() / getApp() to prevent multiple initializations in Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Initialize Auth
export const auth = getAuth(app);

// ✅ Add Google Provider export
export const googleProvider = new GoogleAuthProvider();