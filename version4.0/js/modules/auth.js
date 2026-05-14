// Authentication Logic
import { 
    onAuthStateChanged, 
    signInWithPopup, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth, provider } from "./firebase.js";
import { clearLocalData } from "./storage.js";

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
        let errorMsg = "Failed to sign in with Google.";
        
        if (err.code === "auth/popup-closed-by-user") {
            errorMsg = "The sign-in popup was closed before completing. Please try again.";
        } else if (err.code === "auth/network-request-failed") {
            errorMsg = "Network error. Please check your internet connection.";
        } else if (err.code === "auth/cancelled-by-user") {
            errorMsg = "Login was cancelled.";
        }
        
        alert(errorMsg);
        throw err;
    }
}

export async function logoutUser() {
    try {
        await signOut(auth);
        clearLocalData(); // Wipe browser memory
    } catch (err) {
        console.error("Logout Error:", err);
        throw err;
    }
}

export function getCurrentUser() {
    return auth.currentUser;
}