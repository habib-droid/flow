'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Initializes Firebase SDKs using the provided configuration.
 * Always prioritizes the explicit config object to ensure reliability during builds.
 */
export function initializeFirebase() {
  let firebaseApp: FirebaseApp;
  
  const apps = getApps();
  if (apps.length > 0) {
    firebaseApp = apps[0];
  } else {
    // Surgical fix: Ensure initializeApp is always called with config, 
    // and wrap in try/catch to prevent build-time crashes on Vercel.
    try {
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      console.warn("Firebase initialization skipped or failed during build/pre-render.");
      // Provide a minimal fallback for static generation
      firebaseApp = { name: '[DEFAULT]' } as FirebaseApp;
    }
  }

  // Safely initialize services
  let auth;
  let firestore;

  try {
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  } catch (e) {
    // Fallback for build environment where Firestore/Auth might not be available
    auth = {} as any;
    firestore = {} as any;
  }

  return {
    firebaseApp,
    auth,
    firestore
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
