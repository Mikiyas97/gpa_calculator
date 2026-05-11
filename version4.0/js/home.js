// Entry point for index.html (Calculator)
import { initAuth, loginWithGoogle, logoutUser } from "./modules/auth.js";
import { initCloudSync, saveLocalRecords, getLocalRecords, syncToCloud } from "./modules/storage.js";
import { createSubjectRow, calculateCurrentGPA } from "./modules/calculator.js";
import { initTheme, toggleUserUI, showAuthPage, hideAuthPage } from "./modules/ui.js";
import { initChatbot } from "./modules/chatbot.js";

let totalSubject = 1;
let editingId = null;
let unsubscribeSync = null;

const addBtn = document.getElementById("addBtn");
const calculateBtn = document.getElementById("calculateBtn");
const resetBtn = document.getElementById("resetBtn");
const saveBtn = document.getElementById("saveBtn");
const addPlace = document.getElementById("addPlace");
const resultDisplay = document.getElementById("result");
const loginBtn = document.getElementById("loginBtn");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const saveModal = document.getElementById("saveModal");
const confirmSaveBtn = document.getElementById("confirmSaveBtn");
const cancelSaveBtn = document.getElementById("cancelSaveBtn");
const saveYearSelect = document.getElementById("save-year");
const saveSemesterSelect = document.getElementById("save-semester");
const saveWarning = document.getElementById("save-warning");

// --- Initialization ---

initTheme();
initChatbot();

// Initialize first row listener
const firstScoreInput = document.getElementById("score-1");
if (firstScoreInput) {
    firstScoreInput.addEventListener('input', () => {
        import('./modules/calculator.js').then(m => m.updateGradeInRow(1));
    });
}

function updateProgressBar() {
    const records = getLocalRecords();
    const progressBar = document.getElementById("progress-bar");
    if (progressBar && records.length > 0) {
        // Simple logic: 8 semesters = 100%
        const percent = Math.min((records.length / 8) * 100, 100);
        progressBar.style.width = `${percent}%`;
    }
}

updateProgressBar();

initAuth((user) => {
    toggleUserUI(user);
    if (user) {
        if (unsubscribeSync) unsubscribeSync();
        unsubscribeSync = initCloudSync(user.uid, (records) => {
            updateProgressBar();
            // Check if we are editing something that was updated
            if (editingId) {
                const record = records.find(r => r.id === editingId);
                if (!record) editingId = null;
            }
        });
        hideAuthPage("home-page");
    } else {
        if (unsubscribeSync) unsubscribeSync();
        unsubscribeSync = null;
    }
});

// Handle edit from Data page
const editId = sessionStorage.getItem("editRecordId");
if (editId) {
    sessionStorage.removeItem("editRecordId");
    const records = getLocalRecords();
    const record = records.find(r => r.id == editId);
    if (record) {
        editingId = record.id;
        saveYearSelect.value = record.year;
        saveSemesterSelect.value = record.semester;
        addPlace.innerHTML = "";
        totalSubject = 0;
        record.subjects.forEach(s => {
            totalSubject++;
            addPlace.appendChild(createSubjectRow(totalSubject, s));
            import('./modules/calculator.js').then(m => m.updateGradeInRow(totalSubject));
        });
        calculateBtn.click();
    }
}

// --- Event Listeners ---

addBtn.addEventListener("click", (e) => {
    e.preventDefault();
    totalSubject++;
    addPlace.appendChild(createSubjectRow(totalSubject));
});

calculateBtn.addEventListener("click", () => {
    const result = calculateCurrentGPA(totalSubject);
    resultDisplay.innerText = `${result.gpa}/4.0`;
    resultDisplay.classList.remove("gpa-high", "gpa-mid", "gpa-low");
    const val = parseFloat(result.gpa);
    if (val >= 3.5) resultDisplay.classList.add("gpa-high");
    else if (val >= 2.5) resultDisplay.classList.add("gpa-mid");
    else if (val > 0) resultDisplay.classList.add("gpa-low");
    resultDisplay.style.display = "flex";
});

resetBtn.addEventListener("click", () => {
    addPlace.innerHTML = "";
    totalSubject = 1;
    addPlace.appendChild(createSubjectRow(totalSubject));
    editingId = null;
    resultDisplay.innerText = "0.0/4.0";
});

saveBtn.addEventListener("click", () => {
    initAuth((user) => {
        if (!user) {
            showAuthPage();
        } else {
            saveModal.style.display = "flex";
        }
    });
});

confirmSaveBtn.addEventListener("click", async () => {
    const result = calculateCurrentGPA(totalSubject);
    const year = saveYearSelect.value;
    const semester = saveSemesterSelect.value;
    let savedRecords = getLocalRecords();
    
    if (savedRecords.find(r => r.year === year && r.semester === semester && r.id !== editingId)) {
        saveWarning.style.display = "block";
        return;
    }

    const record = { 
        id: editingId || Date.now(), 
        year, 
        semester, 
        gpa: result.gpa, 
        subjects: result.subjects 
    };

    if (editingId) {
        savedRecords = savedRecords.map(r => r.id === editingId ? record : r);
    } else {
        savedRecords.push(record);
    }

    saveLocalRecords(savedRecords);
    
    initAuth(async (user) => {
        if (user) {
            await syncToCloud(user.uid, savedRecords);
        }
    });

    saveModal.style.display = "none";
    editingId = null;
    alert("Record Saved Successfully!");
});

cancelSaveBtn.addEventListener("click", () => {
    saveModal.style.display = "none";
});

loginBtn.addEventListener("click", showAuthPage);
googleLoginBtn.addEventListener("click", loginWithGoogle);
logoutBtn.addEventListener("click", logoutUser);

// Handle "Modify Existing" from warning
document.getElementById("modifyExistingBtn").addEventListener("click", () => {
    saveWarning.style.display = "none";
    // Logic to find and set editingId to the duplicate record could go here
});

window.onclick = (e) => {
    if (e.target == saveModal) saveModal.style.display = "none";
};

// Expose updateGrade for legacy inline oninput if needed (though we use listeners now)
window.updateGrade = (id) => {
    import('./modules/calculator.js').then(m => m.updateGradeInRow(id));
};