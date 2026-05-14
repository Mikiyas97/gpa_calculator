// Entry point for data.html (Records & Analytics)
import { initAuth, loginWithGoogle, logoutUser } from "./modules/auth.js";
import { initCloudSync, saveLocalRecords, getLocalRecords, syncToCloud } from "./modules/storage.js";
import { updateAllCharts } from "./modules/charts.js";
import { initTheme, initMenuToggle, toggleUserUI, showAuthPage, hideAuthPage } from "./modules/ui.js";
import { initChatbot } from "./modules/chatbot.js";
import { initProfileModal, checkNewUserProfile } from "./modules/profile.js";

const savedPlace = document.getElementById("savedPlace");
const clearAllBtn = document.getElementById("clearAllBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

const cumulativeGpaDisplay = document.getElementById("cumulative-gpa");
const cumulativeCountDisplay = document.getElementById("cumulative-count");
const emptyState = document.getElementById("empty-state");
const chartSection = document.getElementById("chart-section");
const cumulativeSection = document.getElementById("cumulative-section");
const recordsSection = document.getElementById("records-section");

const loginBtn = document.getElementById("loginBtn");
const googleLoginBtn = document.getElementById("googleLoginBtn");

let unsubscribeSync = null;

// --- Initialization ---

initTheme();
initMenuToggle();
initChatbot();
initProfileModal();

initAuth((user) => {
    toggleUserUI(user);
    if (user) {
        checkNewUserProfile(user);
        if (unsubscribeSync) unsubscribeSync();
        unsubscribeSync = initCloudSync(user.uid, (records) => {
            displaySavedData(records);
        });
        hideAuthPage("data-page");
    } else {
        if (unsubscribeSync) unsubscribeSync();
        unsubscribeSync = null;
        showAuthPage(); // Data page requires auth
    }
});

// --- Records Display Logic ---

function displaySavedData(records = null) {
    const savedRecords = records || getLocalRecords();
    savedPlace.innerHTML = "";
    const hasRecords = savedRecords.length > 0;

    if (exportBtn) exportBtn.disabled = !hasRecords;
    if (clearAllBtn) clearAllBtn.disabled = !hasRecords;

    if (!hasRecords) {
        emptyState.style.display = "block";
        if (cumulativeSection) cumulativeSection.style.display = "none";
        if (chartSection) chartSection.style.display = "none";
        if (recordsSection) recordsSection.style.display = "none";
        return;
    }

    emptyState.style.display = "none";
    if (cumulativeSection) cumulativeSection.style.display = "block";
    if (chartSection) chartSection.style.display = "block";
    if (recordsSection) recordsSection.style.display = "block";

    savedRecords.sort((a, b) => {
        const yA = parseInt(a.year.match(/\d+/)[0]);
        const yB = parseInt(b.year.match(/\d+/)[0]);
        if (yA !== yB) return yA - yB;
        return parseInt(a.semester.match(/\d+/)[0]) - parseInt(b.semester.match(/\d+/)[0]);
    });

    let totalGpaSum = 0;
    savedRecords.forEach(record => {
        totalGpaSum += parseFloat(record.gpa);

        // Calculate stats
        const totalCredits = record.subjects.reduce((sum, s) => sum + parseFloat(s.credit || 0), 0);
        const avgScore = record.subjects.length > 0
            ? Math.round(record.subjects.reduce((sum, s) => sum + parseFloat(s.score || 0), 0) / record.subjects.length)
            : 0;

        const card = document.createElement("div");
        card.className = "record-card";
        card.innerHTML = `
            <div class="record-top">
                <h3>${record.year} • ${record.semester}</h3>
                <span class="gpa-pill">${record.gpa} GPA</span>
            </div>

            <p>Total Credits: ${totalCredits}</p>
            <p>Average Score: ${avgScore}%</p>

            <div class="record-details" style="display: none; margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--border);">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr><th style="font-size: 0.8rem; padding: 8px 4px;">Subject</th><th style="font-size: 0.8rem; padding: 8px 4px;">Credit</th><th style="font-size: 0.8rem; padding: 8px 4px;">Score</th><th style="font-size: 0.8rem; padding: 8px 4px;">Grade</th></tr>
                    </thead>
                    <tbody>
                        ${record.subjects.map(s => `
                            <tr>
                                <td style="padding: 6px 4px; font-size: 0.85rem;">${s.name}</td>
                                <td style="padding: 6px 4px; font-size: 0.85rem;">${s.credit}</td>
                                <td style="padding: 6px 4px; font-size: 0.85rem;">${s.score}</td>
                                <td style="padding: 6px 4px;"><output class="grade-${s.grade[0]}" style="font-size: 0.8rem; padding: 4px 8px;">${s.grade}</output></td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>

            <div class="record-actions">
                <button class="record-action-btn details-btn" title="Details">📋</button>
                <button class="record-action-btn edit-btn" title="Edit" onclick="window.editRecord(${record.id})">✏️</button>
                <button class="record-action-btn delete-btn" title="Delete" onclick="event.stopPropagation(); window.deleteRecord(${record.id})">🗑️</button>
            </div>
        `;

        // Toggle details on click
        const detailsBtn = card.querySelector(".details-btn");
        const detailsPanel = card.querySelector(".record-details");
        detailsBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const isHidden = detailsPanel.style.display === "none";
            detailsPanel.style.display = isHidden ? "block" : "none";
            detailsBtn.textContent = isHidden ? "🔽" : "📋";
        });

        savedPlace.appendChild(card);
    });

    cumulativeGpaDisplay.innerText = (totalGpaSum / savedRecords.length).toFixed(2);
    cumulativeCountDisplay.innerText = `Based on ${savedRecords.length} semester${savedRecords.length > 1 ? 's' : ''}`;
    updateAllCharts(savedRecords);
}

// --- Global Action Handlers ---

window.deleteRecord = async function(id) {
    if (confirm("Delete this record?")) {
        const records = getLocalRecords().filter(r => r.id !== id);
        saveLocalRecords(records);
        initAuth(async (user) => {
            if (user) await syncToCloud(user.uid, records);
        });
        displaySavedData(records);
    }
};

window.editRecord = function(id) {
    // For simplicity in MPA, we can store the ID to edit in sessionStorage
    sessionStorage.setItem("editRecordId", id);
    window.location.href = "index.html";
};

clearAllBtn.addEventListener("click", async () => {
    if (confirm("Clear all records?")) {
        saveLocalRecords([]);
        initAuth(async (user) => {
            if (user) await syncToCloud(user.uid, []);
        });
        displaySavedData([]);
    }
});

// --- Import/Export ---

exportBtn.addEventListener("click", () => {
    const records = getLocalRecords();
    if (records.length === 0) return;

    const data = JSON.stringify(records, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `GPA_Pro_Records_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

importBtn.addEventListener("click", () => importFile.click());

importFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const records = JSON.parse(event.target.result);
            
            // Basic validation: check if it's an array and has the right keys
            if (!Array.isArray(records)) throw new Error("Invalid format");
            
            if (records.length > 0 && (!records[0].year || !records[0].subjects)) {
                throw new Error("Missing required fields");
            }

            // Save locally
            saveLocalRecords(records);
            
            // Sync to cloud if logged in
            initAuth(async (user) => {
                if (user) {
                    await syncToCloud(user.uid, records);
                }
            });

            // Refresh UI
            displaySavedData(records);
            
            // Reset input
            importFile.value = "";
            
            // Show success
            const successMsg = document.createElement("div");
            successMsg.style.cssText = "position:fixed; top:20px; right:20px; background:var(--success); color:white; padding:15px 25px; border-radius:12px; z-index:9999; animation: slideIn 0.3s forwards;";
            successMsg.textContent = "✅ Records Imported Successfully!";
            document.body.appendChild(successMsg);
            setTimeout(() => {
                successMsg.style.animation = "slideOut 0.3s forwards";
                setTimeout(() => successMsg.remove(), 300);
            }, 3000);

        } catch (err) {
            console.error("Import Error:", err);
            alert("Failed to import: Please ensure the JSON file follows the correct GPA Pro format.");
            importFile.value = "";
        }
    };
    reader.readAsText(file);
});

// Add animations to CSS if needed, but for now this works.
loginBtn.addEventListener("click", showAuthPage);
googleLoginBtn.addEventListener("click", loginWithGoogle);