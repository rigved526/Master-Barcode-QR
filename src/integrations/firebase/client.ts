// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOTiEuFEEx9-Sxjj0UjboxCFYBhMbrGoM",
  authDomain: "scanner-6a71c.firebaseapp.com",
  projectId: "scanner-6a71c",
  storageBucket: "scanner-6a71c.firebasestorage.app",
  messagingSenderId: "655952640439",
  appId: "1:655952640439:web:dcc629e58d923e770e1032",
  measurementId: "G-JYWWNBT6CP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
