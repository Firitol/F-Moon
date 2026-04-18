/**
 * Firebase Configuration
 * 
 * These values are provided via environment variables for security and flexibility.
 * Hardcoded values serve as fallbacks for local development.
 * 
 * For Vercel deployment:
 * Add these keys to your Vercel Project Settings > Environment Variables.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBHzz8jdxqAYsxK2gmThxo4CPl2eWjtjGY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-3474532440-24ca5.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-3474532440-24ca5",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-3474532440-24ca5.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "866524246303",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:866524246303:web:60bc55d64537ec594f402a",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};
