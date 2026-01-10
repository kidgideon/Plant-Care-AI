// firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyCG7d0afTpnkoKwPzV5QBGJCmbUX3tTWyk",
  authDomain: "ai-plant-health-analyser.firebaseapp.com",
  projectId: "ai-plant-health-analyser",
  storageBucket: "ai-plant-health-analyser.firebasestorage.app",
  messagingSenderId: "963001024490",
  appId: "1:963001024490:web:baa314adefa78941317c93",
  measurementId: "G-C8PDBB29L9"
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ✅ Properly typed
export let analytics: Analytics | null = null;

isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});
