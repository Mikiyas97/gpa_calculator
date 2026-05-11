// Data Persistence and Synchronization
import { doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";

const STORAGE_KEY = "gpaRecords";

export function getLocalRecords() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

export function saveLocalRecords(records) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function initCloudSync(uid, callback) {
    return onSnapshot(doc(db, "users", uid), (docSnap) => {
        const localRecords = getLocalRecords();
        if (docSnap.exists()) {
            const cloudData = docSnap.data().records || [];
            
            // Basic merge: if cloud has data, use it as source of truth
            // but we could also check timestamps if we had them.
            // For now, if cloud is empty but local isn't, don't overwrite local yet.
            if (cloudData.length === 0 && localRecords.length > 0) {
                syncToCloud(uid, localRecords);
                callback(localRecords);
            } else {
                saveLocalRecords(cloudData);
                callback(cloudData);
            }
        } else {
            // New user on Firebase: sync local data to cloud if it exists
            if (localRecords.length > 0) {
                syncToCloud(uid, localRecords);
                callback(localRecords);
            } else {
                saveLocalRecords([]);
                callback([]);
            }
        }
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
        throw error;
    }
}

export function clearLocalData() {
    localStorage.removeItem(STORAGE_KEY);
}