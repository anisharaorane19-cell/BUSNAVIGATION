import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
  apiKey: "AIzaSyBG1xBdzVTwc9r17dq6DOoQeX-BlKx-1Z0",
  authDomain: "bustracking20.firebaseapp.com",
  databaseURL: "https://bustracking20-default-rtdb.firebaseio.com",
  projectId: "bustracking20",
  storageBucket: "bustracking20.firebasestorage.app",
  messagingSenderId: "154822758103",
  appId: "1:154822758103:web:8867f287994c3e70086a92"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app); // For static data (Users, Routes, Stops)
export const realDb = getDatabase(app); // For live data (GPS locations)

export default app;

