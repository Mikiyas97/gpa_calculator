// Firebase Configuration & Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBSAyur9cft_dg0E69TX3d6IR6ZxjcZza0",
  authDomain: "gpacalculator-e601c.firebaseapp.com",
  projectId: "gpacalculator-e601c",
  storageBucket: "gpacalculator-e601c.firebasestorage.app",
  messagingSenderId: "979985948348",
  appId: "1:979985948348:web:78ee50b85f73dd50497ab9",
  measurementId: "G-9JN4R2JNCY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { app, auth, db, provider };