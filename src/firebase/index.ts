'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Returns the initialized Firebase SDKs.
 * @param firebaseApp The initialized FirebaseApp instance.
 */
export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

/**
 * Initializes the Firebase application.
 * Handles both automatic configuration (for Firebase Hosting) and 
 * explicit configuration (for Vercel/local development).
 */
export function initializeFirebase() {
  // Return existing instances if already initialized
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  let firebaseApp: FirebaseApp;

  try {
    /**
     * Attempt to initialize without arguments.
     * This is required for Firebase App Hosting and other environments that 
     * automatically inject configuration into the runtime.
     */
    firebaseApp = initializeApp();
  } catch (e: any) {
    /**
     * If auto-init fails with 'app/no-options', it means we are in an environment 
     * like Vercel or local development where the config must be provided explicitly.
     * We catch this and fall back to the config object in src/firebase/config.ts.
     */
    if (e.code !== 'app/no-options') {
      // Log only unexpected initialization errors
      console.warn('Unexpected Firebase initialization attempt failure:', e);
    }
    
    firebaseApp = initializeApp(firebaseConfig);
  }

  return getSdks(firebaseApp);
}

// Barrel exports for Firebase functionality
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
