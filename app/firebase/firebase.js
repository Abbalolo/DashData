// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API,
  authDomain: "dashdata-94ff5.firebaseapp.com",
  projectId: "dashdata-94ff5",
  storageBucket: "dashdata-94ff5.firebasestorage.app",
  messagingSenderId: "764879322471",
  appId: "1:764879322471:web:81064548778ca6477003c2",
  measurementId: "G-X3PMZL71Z0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
