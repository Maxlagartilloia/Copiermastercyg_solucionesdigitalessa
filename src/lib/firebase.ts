
'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "copiermaster-cg",
  "appId": "1:923270501643:web:74f4f429ce0458a63efe0e",
  "storageBucket": "copiermaster-cg.firebasestorage.app",
  "apiKey": "AIzaSyDUNu5VFQ5jx8I5a1WtUhFpyz-c7NIfLrY",
  "authDomain": "copiermaster-cg.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "923270501643"
};

// Initialize Firebase
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
