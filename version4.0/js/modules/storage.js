// Data Persistence and Synchronization with User Isolation
import { doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";

const STORAGE_KEY = "gpaRecords";
const PROFILE_KEY = "userProfile";

export function getLocalRecords() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

export function saveLocalRecords(records) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getLocalProfile() {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
}

export function saveLocalProfile(profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

/**
 * Initializes synchronization. 
 * CRITICAL: Prioritizes Cloud data to prevent cross-user leakage.
 */
export function initCloudSync(uid, callback) {
    if (!uid) return null;

    return onSnapshot(doc(db, "users", uid), (docSnap) => {
        if (!docSnap.exists()) {
            // New user: Only sync local if it's currently empty in cloud
            const localRecords = getLocalRecords();
            const localProfile = getLocalProfile();
            if (localRecords.length > 0) syncToCloud(uid, localRecords);
            if (Object.keys(localProfile).length > 0) syncProfileToCloud(uid, localProfile);
            return;
        }

        const data = docSnap.data();
        const cloudRecords = data.records || [];
        const cloudProfile = data.profile || {};
        
        // Force update local storage with cloud data (Isolates users)
        saveLocalRecords(cloudRecords);
        saveLocalProfile(cloudProfile);
        
        callback(cloudRecords, cloudProfile);
    });
}

export async function syncToCloud(uid, records) {
    if (!uid) return;
    try {
        await setDoc(doc(db, "users", uid), {
            records: records,
            lastUpdated: new Date()
        }, { merge: true });
    } catch (error) {
        console.error("Cloud Sync Error:", error);
    }
}

export async function syncProfileToCloud(uid, profile) {
    if (!uid) return;
    try {
        await setDoc(doc(db, "users", uid), {
            profile: profile,
            lastUpdated: new Date()
        }, { merge: true });
    } catch (error) {
        console.error("Profile Sync Error:", error);
    }
}

/**
 * Wipes all session data. Must be called on logout.
 */
export function clearLocalData() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROFILE_KEY);
    // Force a UI refresh by clearing inputs if possible
    window.location.reload(); 
}