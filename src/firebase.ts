// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAZppuAo7Idy1YgmKVTfKlJczDngqmoKSs",
  authDomain: "pwa-bsh.firebaseapp.com",
  projectId: "pwa-bsh",
  storageBucket: "pwa-bsh.appspot.com",
  messagingSenderId: "474559800337",
  appId: "1:474559800337:web:86b885e69303d4bb2b7db0",
  measurementId: "G-88RXSHDCXS"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
