import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- Firebase Imports ---
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyBOcX-_ewsL3Y_65pHutEcW42EsFq1SYYI",
  authDomain: "jee-prep-planner-a2933.firebaseapp.com",
  projectId: "jee-prep-planner-a2933",
  storageBucket: "jee-prep-planner-a2933.firebasestorage.app",
  messagingSenderId: "730499425972",
  appId: "1:730499425972:web:1ebb2b41c3da26f35c59e1",
  measurementId: "G-2WDBT7VCDF"
};

// --- Initialize Firebase ---
const appFirebase = initializeApp(firebaseConfig);
const auth = getAuth(appFirebase);
const provider = new GoogleAuthProvider();
const db = getFirestore(appFirebase);

// --- Login / Logout Functions ---
export const login = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Logged in:", result.user);
  } catch (error) {
    console.error("Login failed:", error);
  }
};

export const logout = async () => {
  await signOut(auth);
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User is logged in:", user.email);

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("User data:", docSnap.data());
    } else {
      await setDoc(docRef, { subjects: [], schedule: [], testRecords: [] });
    }
  } else {
    console.log("User logged out");
  }
});

// Export auth and db so App.tsx can use them
export { auth, db };

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
