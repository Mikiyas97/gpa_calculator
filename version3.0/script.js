// Elements
const addBtn = document.getElementById("addBtn");
const calculateBtn = document.getElementById("calculateBtn");
const resetBtn = document.getElementById("resetBtn");
const saveBtn = document.getElementById("saveBtn");
const addPlace = document.getElementById("addPlace");
const resultDisplay = document.getElementById("result");

// Modal Elements
const saveModal = document.getElementById("saveModal");
const confirmSaveBtn = document.getElementById("confirmSaveBtn");
const cancelSaveBtn = document.getElementById("cancelSaveBtn");
const saveYearSelect = document.getElementById("save-year");
const saveSemesterSelect = document.getElementById("save-semester");
const saveWarning = document.getElementById("save-warning");
const modifyExistingBtn = document.getElementById("modifyExistingBtn");

// Nav Elements
const navHome = document.getElementById("nav-home");
const navData = document.getElementById("nav-data");
const homePage = document.getElementById("home-page");
const dataPage = document.getElementById("data-page");
const savedPlace = document.getElementById("savedPlace");
const clearAllBtn = document.getElementById("clearAllBtn");

// UI Enhancement Elements
const cumulativeSection = document.getElementById("cumulative-section");
const cumulativeGpaDisplay = document.getElementById("cumulative-gpa");
const cumulativeCountDisplay = document.getElementById("cumulative-count");
const emptyState = document.getElementById("empty-state");
const savedDataTable = document.getElementById("saved-data-table");
const chartSection = document.getElementById("chart-section");
const themeToggle = document.getElementById("theme-toggle");
const recordsSection = document.getElementById("records-section");

let totalSubject = 1;
let editingId = null;
let gradeChart = null;
let trendChart = null;
let creditChart = null;
let scoreChart = null;

// Theme Logic
function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme);
    
    // Refresh charts to update their colors for the new theme
    if (dataPage.style.display !== "none") {
        displaySavedData();
    }
}

function updateThemeIcon(theme) {
    const iconSpan = themeToggle.querySelector(".icon");
    iconSpan.innerText = theme === "dark" ? "☀️" : "🌙";
}

themeToggle.addEventListener("click", toggleTheme);

// Grade Logic
function getGradePoint(score) {
    if (score >= 90) return { letter: 'A+', point: 4.0, class: 'grade-A' };
    if (score >= 85) return { letter: 'A', point: 4.0, class: 'grade-A' };
    if (score >= 80) return { letter: 'A-', point: 3.75, class: 'grade-A' };
    if (score >= 75) return { letter: 'B+', point: 3.5, class: 'grade-B' };
    if (score >= 70) return { letter: 'B', point: 3.0, class: 'grade-B' };
    if (score >= 65) return { letter: 'B-', point: 2.75, class: 'grade-B' };
    if (score >= 60) return { letter: 'C+', point: 2.5, class: 'grade-C' };
    if (score >= 55) return { letter: 'C', point: 2.0, class: 'grade-C' };
    if (score >= 50) return { letter: 'C-', point: 1.75, class: 'grade-C' };
    if (score >= 45) return { letter: 'D', point: 1.0, class: 'grade-D' };
    return { letter: 'F', point: 0.0, class: 'grade-F' };
}

function updateAllCharts(records) {
    if (!records || records.length === 0) return;

    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const textColor = isDark ? "#ffffff" : "#333";
    const gridColor = isDark ? "#333" : "#eee";

    // Set global defaults for Chart.js
    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;

    // 1. Grade Distribution (Pie Chart)
    updateGradeDistributionChart(records, textColor);

    // 2. GPA Trend (Line Chart)
    updateGpaTrendChart(records, textColor, gridColor);

    // 3. Credit Load (Bar Chart)
    updateCreditLoadChart(records, textColor, gridColor);

    // 4. Average Score Trend (Line Chart)
    updateAvgScoreTrendChart(records, textColor, gridColor);
}

function updateGradeDistributionChart(records, textColor) {
    const counts = {
        'A+': 0, 'A': 0, 'A-': 0,
        'B+': 0, 'B': 0, 'B-': 0,
        'C+': 0, 'C': 0, 'C-': 0,
        'D': 0, 'F': 0
    };
    
    records.forEach(record => {
        record.subjects.forEach(subject => {
            if (counts.hasOwnProperty(subject.grade)) {
                counts[subject.grade]++;
            }
        });
    });

    const labels = Object.keys(counts).filter(grade => counts[grade] > 0);
    const data = labels.map(grade => counts[grade]);
    const colorMap = {
        'A+': '#27ae60', 'A': '#2ecc71', 'A-': '#a2f0c1',
        'B+': '#2980b9', 'B': '#3498db', 'B-': '#85c1e9',
        'C+': '#f39c12', 'C': '#f1c40f', 'C-': '#f9e79f',
        'D': '#e67e22', 'F': '#e74c3c'
    };
    const backgroundColors = labels.map(grade => colorMap[grade]);

    const ctx = document.getElementById('gradeChart').getContext('2d');
    if (gradeChart) gradeChart.destroy();

    gradeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1,
                borderColor: 'transparent'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { 
                    position: 'bottom', 
                    labels: { 
                        boxWidth: 12, 
                        padding: 15, 
                        font: { size: 10 },
                        color: textColor
                    } 
                }
            }
        }
    });
}

function updateGpaTrendChart(records, textColor, gridColor) {
    const labels = records.map(r => `${r.year} ${r.semester}`);
    const data = records.map(r => parseFloat(r.gpa));

    const ctx = document.getElementById('trendChart').getContext('2d');
    if (trendChart) trendChart.destroy();

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'GPA',
                data: data,
                borderColor: '#4a90e2',
                backgroundColor: 'rgba(74, 144, 226, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { 
                    min: 0, 
                    max: 4.0, 
                    ticks: { stepSize: 0.5, color: textColor },
                    grid: { color: gridColor }
                },
                x: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function updateCreditLoadChart(records, textColor, gridColor) {
    const labels = records.map(r => `${r.year} ${r.semester}`);
    const data = records.map(r => {
        return r.subjects.reduce((sum, s) => sum + parseFloat(s.credit), 0);
    });

    const ctx = document.getElementById('creditChart').getContext('2d');
    if (creditChart) creditChart.destroy();

    creditChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Credits',
                data: data,
                backgroundColor: '#3498db',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                },
                x: {
                    ticks: { color: textColor },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function updateAvgScoreTrendChart(records, textColor, gridColor) {
    const labels = records.map(r => `${r.year} ${r.semester}`);
    const data = records.map(r => {
        if (r.subjects.length === 0) return 0;
        const sum = r.subjects.reduce((s, sub) => s + parseFloat(sub.score), 0);
        return (sum / r.subjects.length).toFixed(1);
    });

    const ctx = document.getElementById('scoreChart').getContext('2d');
    if (scoreChart) scoreChart.destroy();

    scoreChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Avg Score',
                data: data,
                borderColor: '#e67e22',
                backgroundColor: 'rgba(230, 126, 34, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { 
                    min: 0, 
                    max: 100,
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                },
                x: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function updateGrade(id) {
    let scoreInput = document.getElementById(`score-${id}`);
    let gradeOutput = document.getElementById(`grade-${id}`);
    if (!scoreInput || !gradeOutput) return;

    let score = parseFloat(scoreInput.value);

    if (!isNaN(score)) {
        let gradeInfo = getGradePoint(score);
        gradeOutput.value = gradeInfo.letter;
        gradeOutput.className = gradeInfo.class;
    } else {
        gradeOutput.value = "";
        gradeOutput.className = "";
    }
}

function updateResultUI(gpa) {
    resultDisplay.innerText = `${gpa}/4.0`;
    resultDisplay.classList.remove("gpa-high", "gpa-mid", "gpa-low");
    
    let val = parseFloat(gpa);
    if (val >= 3.5) resultDisplay.classList.add("gpa-high");
    else if (val >= 2.5) resultDisplay.classList.add("gpa-mid");
    else if (val > 0) resultDisplay.classList.add("gpa-low");
}

function addSubject(data = null) {
    totalSubject++;
    let row = document.createElement("tr");
    row.innerHTML = `
        <td><input type="text" placeholder="Subject ${totalSubject}" id="subject-${totalSubject}" value="${data ? data.name : ''}"></td>
        <td><input type="number" placeholder="Credit" required id="credit-${totalSubject}" value="${data ? data.credit : ''}"></td>
        <td><input type="number" placeholder="Score" required id="score-${totalSubject}" value="${data ? data.score : ''}" oninput="updateGrade(${totalSubject})"></td>
        <td><output id="grade-${totalSubject}">${data ? data.grade : ''}</output></td>
    `;
    addPlace.appendChild(row);
    if (data) updateGrade(totalSubject);
}

// Navigation Logic
navHome.addEventListener("click", (e) => {
    e.preventDefault();
    homePage.style.display = "flex";
    dataPage.style.display = "none";
    navHome.classList.add("active");
    navData.classList.remove("active");
});

navData.addEventListener("click", (e) => {
    e.preventDefault();
    homePage.style.display = "none";
    dataPage.style.display = "flex";
    navData.classList.add("active");
    navHome.classList.remove("active");
    displaySavedData();
});

// Calculator Logic
addBtn.addEventListener("click", (e) => {
    e.preventDefault();
    addSubject();
});

calculateBtn.addEventListener("click", () => {
    let gpa = calculateGPA().gpa;
    updateResultUI(gpa);
    resultDisplay.style.display="flex";
});

function calculateGPA() {
    let totalPoints = 0;
    let totalCredits = 0;
    let subjects = [];

    for (let i = 1; i <= totalSubject; i++) {
        let nameInput = document.getElementById(`subject-${i}`);
        let creditInput = document.getElementById(`credit-${i}`);
        let scoreInput = document.getElementById(`score-${i}`);
        let gradeOutput = document.getElementById(`grade-${i}`);

        if (creditInput && scoreInput) {
            let name = nameInput.value.trim();
            let credit = parseFloat(creditInput.value);
            let score = parseFloat(scoreInput.value);
            let grade = gradeOutput.value;

            if (!isNaN(credit) && !isNaN(score)) {
                let gradeInfo = getGradePoint(score);
                totalPoints += gradeInfo.point * credit;
                totalCredits += credit;
                
                subjects.push({
                    name: name || `Subject ${i}`,
                    credit: credit,
                    score: score,
                    grade: grade
                });
            }
        }
    }

    let gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
    return { gpa, subjects };
}

resetBtn.addEventListener("click", () => {
    addPlace.innerHTML = `
        <tr>
            <td><input type="text" placeholder="Subject 1" id="subject-1"></td>
            <td><input type="number" placeholder="Credit" required id="credit-1"></td>
            <td><input type="number" placeholder="Score" required id="score-1" oninput="updateGrade(1)"></td>
            <td><output id="grade-1"></output></td>
        </tr>
    `;
    totalSubject = 1;
    editingId = null;
    updateResultUI("0.00");
    resultDisplay.innerText = "0.0/4.0";
});

// Save Logic
saveBtn.addEventListener("click", () => {
    let allNamed = true;
    let firstMissing = null;

    for (let i = 1; i <= totalSubject; i++) {
        let nameInput = document.getElementById(`subject-${i}`);
        let creditInput = document.getElementById(`credit-${i}`);
        let scoreInput = document.getElementById(`score-${i}`);
        
        if (creditInput.value || scoreInput.value) {
            if (!nameInput.value.trim()) {
                nameInput.classList.add("invalid");
                allNamed = false;
                if (!firstMissing) firstMissing = nameInput;
            } else {
                nameInput.classList.remove("invalid");
            }
        }
    }

    if (!allNamed) {
        if (firstMissing) firstMissing.focus();
        return;
    }

    saveWarning.style.display = "none";
    saveModal.style.display = "flex";
});

cancelSaveBtn.addEventListener("click", () => {
    saveModal.style.display = "none";
});

confirmSaveBtn.addEventListener("click", () => {
    let result = calculateGPA();
    let year = saveYearSelect.value;
    let semester = saveSemesterSelect.value;

    let savedRecords = JSON.parse(localStorage.getItem("gpaRecords") || "[]");
    
    const duplicate = savedRecords.find(r => r.year === year && r.semester === semester && r.id !== editingId);
    if (duplicate) {
        saveWarning.style.display = "block";
        return;
    }

    let record = {
        id: editingId || Date.now(),
        year: year,
        semester: semester,
        gpa: result.gpa,
        subjects: result.subjects
    };

    if (editingId) {
        savedRecords = savedRecords.map(r => r.id === editingId ? record : r);
    } else {
        savedRecords.push(record);
    }
    
    localStorage.setItem("gpaRecords", JSON.stringify(savedRecords));
    saveModal.style.display = "none";
    editingId = null;
    displaySavedData();
});

modifyExistingBtn.addEventListener("click", () => {
    let year = saveYearSelect.value;
    let semester = saveSemesterSelect.value;
    let savedRecords = JSON.parse(localStorage.getItem("gpaRecords") || "[]");
    const duplicate = savedRecords.find(r => r.year === year && r.semester === semester);
    
    if (duplicate) {
        saveModal.style.display = "none";
        editRecord(duplicate.id);
    }
});

// Data Page Logic
function displaySavedData() {
    let savedRecords = JSON.parse(localStorage.getItem("gpaRecords") || "[]");
    savedPlace.innerHTML = "";

    if (savedRecords.length === 0) {
        emptyState.style.display = "block";
        recordsSection.style.display = "none";
        cumulativeSection.style.display = "none";
        chartSection.style.display = "none";
        return;
    }

    // Sort records: Year first, then Semester
    savedRecords.sort((a, b) => {
        const yearA = parseInt(a.year.match(/\d+/)[0]);
        const yearB = parseInt(b.year.match(/\d+/)[0]);
        if (yearA !== yearB) return yearA - yearB;
        
        const semA = parseInt(a.semester.match(/\d+/)[0]);
        const semB = parseInt(b.semester.match(/\d+/)[0]);
        return semA - semB;
    });

    emptyState.style.display = "none";
    recordsSection.style.display = "block";
    cumulativeSection.style.display = "block";
    chartSection.style.display = "block";

    let totalGpaSum = 0;
    savedRecords.forEach(record => {
        totalGpaSum += parseFloat(record.gpa);
        
        let row = document.createElement("tr");
        row.className = "clickable-row";
        row.innerHTML = `
            <td><span class="expand-icon">▶</span>${record.year}</td>
            <td>${record.semester}</td>
            <td><strong>${record.gpa}</strong></td>
            <td>
                <div style="display: flex; gap: 5px; justify-content: flex-end;">
                    <button class="btn-primary" style="padding: 6px 12px; font-size: 14px;" onclick="event.stopPropagation(); editRecord(${record.id})">Edit</button>
                    <button class="btn-danger" onclick="event.stopPropagation(); deleteRecord(${record.id})">Delete</button>
                </div>
            </td>
        `;
        
        let detailRow = document.createElement("tr");
        detailRow.className = "detail-row";
        detailRow.style.display = "none";
        
        let subjectsHtml = record.subjects.map(s => `
            <tr>
                <td>${s.name}</td>
                <td>${s.credit}</td>
                <td>${s.score}</td>
                <td><output class="grade-${s.grade[0]}">${s.grade}</output></td>
            </tr>
        `).join("");

        detailRow.innerHTML = `
            <td colspan="4">
                <div class="detail-container">
                    <div class="table-responsive">
                        <table class="detail-table">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Credit</th>
                                    <th>Score</th>
                                    <th>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${subjectsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            </td>
        `;

        row.onclick = () => {
            const isHidden = detailRow.style.display === "none";
            detailRow.style.display = isHidden ? "table-row" : "none";
            row.querySelector(".expand-icon").innerText = isHidden ? "▼" : "▶";
        };

        savedPlace.appendChild(row);
        savedPlace.appendChild(detailRow);
    });

    // Update Cumulative GPA
    let cumulativeGpa = (totalGpaSum / savedRecords.length).toFixed(2);
    cumulativeGpaDisplay.innerText = cumulativeGpa;
    cumulativeCountDisplay.innerText = `Based on ${savedRecords.length} semester${savedRecords.length > 1 ? 's' : ''}`;

    // Update Charts
    updateAllCharts(savedRecords);
}

window.deleteRecord = function(id) {
    if (confirm("Delete this record?")) {
        let savedRecords = JSON.parse(localStorage.getItem("gpaRecords") || "[]");
        savedRecords = savedRecords.filter(r => r.id !== id);
        localStorage.setItem("gpaRecords", JSON.stringify(savedRecords));
        displaySavedData();
    }
};

window.editRecord = function(id) {
    let savedRecords = JSON.parse(localStorage.getItem("gpaRecords") || "[]");
    let record = savedRecords.find(r => r.id === id);
    if (!record) return;

    homePage.style.display = "flex";
    dataPage.style.display = "none";
    navHome.classList.add("active");
    navData.classList.remove("active");

    addPlace.innerHTML = "";
    totalSubject = 0;
    editingId = record.id;
    saveYearSelect.value = record.year;
    saveSemesterSelect.value = record.semester;

    record.subjects.forEach(s => {
        addSubject(s);
    });

    updateResultUI(record.gpa);
};

clearAllBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all records?")) {
        localStorage.removeItem("gpaRecords");
        displaySavedData();
    }
});

window.onclick = function(event) {
    if (event.target == saveModal) {
        saveModal.style.display = "none";
    }
}

// Initial display check
displaySavedData();
initTheme();
