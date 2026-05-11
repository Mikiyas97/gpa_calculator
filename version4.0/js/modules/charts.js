// Data Visualization Logic

let charts = {
    grade: null,
    trend: null,
    credit: null,
    score: null
};

export function updateAllCharts(records) {
    if (!records || records.length === 0) return;
    
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    Chart.defaults.color = isDark ? "#ffffff" : "#333";
    Chart.defaults.borderColor = isDark ? "#333" : "#eee";

    updateGradeDistributionChart(records);
    updateGpaTrendChart(records);
    updateCreditLoadChart(records);
    updateAvgScoreTrendChart(records);
}

function updateGradeDistributionChart(records) {
    const counts = {};
    records.forEach(r => r.subjects.forEach(s => counts[s.grade] = (counts[s.grade] || 0) + 1));
    const labels = Object.keys(counts);
    const colors = {'A+':'#27ae60','A':'#2ecc71','A-':'#a2f0c1','B+':'#2980b9','B':'#3498db','B-':'#85c1e9','C+':'#f39c12','C':'#f1c40f','C-':'#f9e79f','D':'#e67e22','F':'#e74c3c'};
    const backgroundColors = labels.map(g => colors[g]);
    
    const ctx = document.getElementById('gradeChart').getContext('2d');
    if (charts.grade) charts.grade.destroy();
    charts.grade = new Chart(ctx, { 
        type: 'pie', 
        data: { labels, datasets: [{ data: Object.values(counts), backgroundColor: backgroundColors }] } 
    });
}

function updateGpaTrendChart(records) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    if (charts.trend) charts.trend.destroy();
    charts.trend = new Chart(ctx, { 
        type: 'line', 
        data: { 
            labels: records.map(r => `${r.year} ${r.semester}`), 
            datasets: [{ label: 'GPA', data: records.map(r => r.gpa), borderColor: '#4a90e2', fill: true, tension: 0.3 }] 
        } 
    });
}

function updateCreditLoadChart(records) {
    const ctx = document.getElementById('creditChart').getContext('2d');
    if (charts.credit) charts.credit.destroy();
    charts.credit = new Chart(ctx, { 
        type: 'bar', 
        data: { 
            labels: records.map(r => `${r.year} ${r.semester}`), 
            datasets: [{ label: 'Credits', data: records.map(r => r.subjects.reduce((sum, s) => sum + s.credit, 0)), backgroundColor: '#3498db' }] 
        } 
    });
}

function updateAvgScoreTrendChart(records) {
    const ctx = document.getElementById('scoreChart').getContext('2d');
    if (charts.score) charts.score.destroy();
    charts.score = new Chart(ctx, { 
        type: 'line', 
        data: { 
            labels: records.map(r => `${r.year} ${r.semester}`), 
            datasets: [{ label: 'Avg Score', data: records.map(r => (r.subjects.reduce((sum, s) => sum + s.score, 0) / r.subjects.length).toFixed(1)), borderColor: '#e67e22', fill: true, tension: 0.3 }] 
        } 
    });
}