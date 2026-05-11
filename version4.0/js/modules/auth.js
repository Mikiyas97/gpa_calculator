// Authentication Logic
import { 
    onAuthStateChanged, 
    signInWithPopup, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth, provider } from "./firebase.js";

export function initAuth(callback) {
    onAuthStateChanged(auth, (user) => {
        callback(user);
    });
}

export async function loginWithGoogle() {
    try {
        await signInWithPopup(auth, provider);
    } catch (err) {
        console.error("Login Error:", err);
        throw err;
    }
}

export async function logoutUser() {
    try {
        await signOut(auth);
    } catch (err) {
        console.error("Logout Error:", err);
        throw err;
    }
}

export function getCurrentUser() {
    return auth.currentUser;
}