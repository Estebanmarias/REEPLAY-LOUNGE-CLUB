import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Using hardcoded configuration to ensure reliable connection
const firebaseConfig = {
  apiKey: "AIzaSyDYX9yEqhU8jZA8csLSj3utQd7DQxdCjSY",
  authDomain: "reeplay-lounge.firebaseapp.com",
  projectId: "reeplay-lounge",
  storageBucket: "reeplay-lounge.firebasestorage.app",
  messagingSenderId: "752747780855",
  appId: "1:752747780855:web:9a970328556b76979fd1f2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
