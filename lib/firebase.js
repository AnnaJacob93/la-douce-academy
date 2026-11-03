// Import Firebase core and services
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOju0I3pvT3yz28QSH-kxyJDRrAUX7oQ4",
  authDomain: "la-douce-academy.firebaseapp.com",
  projectId: "la-douce-academy",
  storageBucket: "la-douce-academy.firebasestorage.app",
  messagingSenderId: "866278970500",
  appId: "1:866278970500:web:8362ca4424fafc41379ed1",
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Authentication, Firestore and Storage
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };