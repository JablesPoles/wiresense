// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your project's config keys from console.firebase.google.com
const firebaseConfig = {
    apiKey: "AIzaSyC_6iRyOA_zjdducDNL9PZIz4oO27so17s",
    authDomain: "wiresense-app.firebaseapp.com",
    projectId: "wiresense-app",
    storageBucket: "wiresense-app.firebasestorage.app",
    messagingSenderId: "308635799138",
    appId: "1:308635799138:web:7144ad048e6774052c4b3b",
    measurementId: "G-96NYF39TCG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
