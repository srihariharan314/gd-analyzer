// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Your Firebase configuration - REPLACE WITH YOUR OWN CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyA5ntQkBU1aH2ViNbqL-5gRwTcCDfiV4HI",
    authDomain: "group-discussion-c76d9.firebaseapp.com",
    projectId: "group-discussion-c76d9",
    storageBucket: "group-discussion-c76d9.firebasestorage.app",
    messagingSenderId: "623101942920",
    appId: "1:623101942920:web:c6171801fccfc8c26a133d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("Firebase initialized successfully!");