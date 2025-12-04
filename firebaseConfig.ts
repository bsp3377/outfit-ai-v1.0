// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBk9M725UtTEEkuOixJFpVg8hElOPWH_mo",
  authDomain: "outfit-ai-studio.firebaseapp.com",
  projectId: "outfit-ai-studio",
  storageBucket: "outfit-ai-studio.firebasestorage.app",
  messagingSenderId: "663165323674",
  appId: "1:663165323674:web:c0e496219b0d4ab1cd1223",
  measurementId: "G-N00SG92K58"
};

// Initialize Firebase with error handling
let app: any;
let auth: any;
let db: any;
let googleProvider: any;
let analytics: any = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);

  // Initialize analytics only if supported
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.warn("Firebase Analytics not supported:", err);
  });
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Continue without Firebase - app should still render
}

export { app, auth, googleProvider, db, analytics };