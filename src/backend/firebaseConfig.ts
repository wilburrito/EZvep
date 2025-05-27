// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, Firestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Using temporary development values
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY || "temp-api-key",
  authDomain: process.env.REACT_APP_AUTH_DOMAIN || "temp-project.firebaseapp.com",
  projectId: process.env.REACT_APP_PROJECT_ID || "temp-project-id",
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET || "temp-project.appspot.com",
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_ID || "1:123456789:web:abcdef1234567890",
  measurementId: process.env.REACT_APP_MEASUREMENT_ID || "G-TEMP1234"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);
// Only initialize analytics in production to avoid development errors
if (process.env.NODE_ENV === 'production') {
  getAnalytics(app);
}

export { db };
