/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, UserCredential } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyWealthFolioAuth2026',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'wealthfolio-auth.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'wealthfolio-auth',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'wealthfolio-auth.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '928374829104',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:928374829104:web:a1b2c3d4e5f6',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-3BSLF6X41T',
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

/**
 * Execute Firebase Google OAuth popup authentication
 */
export async function signInWithFirebaseGoogle(): Promise<{
  accessToken: string | null;
  user: {
    email: string;
    name: string;
    picture?: string;
  };
}> {
  const result: UserCredential = await signInWithPopup(auth, googleProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential?.accessToken || null;

  return {
    accessToken,
    user: {
      email: result.user.email || '',
      name: result.user.displayName || result.user.email?.split('@')[0] || 'Google User',
      picture: result.user.photoURL || undefined,
    },
  };
}
