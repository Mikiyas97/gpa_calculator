// GPA Logic and Table Management

function toTitleCase(str) {
    return str.toLowerCase().split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

export function getGradePoint(score) {
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

export function updateGradeInRow(id) {
    const scoreInput = document.getElementById(`score-${id}`);
    const gradeOutput = document.getElementById(`grade-${id}`);
    if (!scoreInput || !gradeOutput) return;

    const score = parseFloat(scoreInput.value);
    if (!isNaN(score)) {
        const gradeInfo = getGradePoint(score);
        gradeOutput.value = gradeInfo.letter;
        gradeOutput.className = gradeInfo.class;
    } else {
        gradeOutput.value = "";
        gradeOutput.className = "";
    }
}

export function createSubjectRow(totalSubject, data = null) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td><input type="text" placeholder="Subject ${totalSubject}" id="subject-${totalSubject}" value="${data ? data.name : ''}"></td>
        <td><input type="number" placeholder="Credit" required id="credit-${totalSubject}" value="${data ? data.credit : ''}"></td>
        <td><input type="number" placeholder="Score" required id="score-${totalSubject}" value="${data ? data.score : ''}"></td>
        <td><output id="grade-${totalSubject}">${data ? data.grade : ''}</output></td>
    `;
    
    // Add event listener to score input
    const scoreInput = row.querySelector(`#score-${totalSubject}`);
    scoreInput.addEventListener('input', () => updateGradeInRow(totalSubject));
    
    return row;
}

export function calculateCurrentGPA(totalSubject) {
    let totalPoints = 0;
    let totalCredits = 0;
    let subjects = [];
    
    for (let i = 1; i <= totalSubject; i++) {
        const nameInput = document.getElementById(`subject-${i}`);
        const creditInput = document.getElementById(`credit-${i}`);
        const scoreInput = document.getElementById(`score-${i}`);
        const gradeOutput = document.getElementById(`grade-${i}`);
        
        if (creditInput && scoreInput && creditInput.value && scoreInput.value) {
            const credit = parseFloat(creditInput.value);
            const score = parseFloat(scoreInput.value);
            const gradeInfo = getGradePoint(score);
            totalPoints += gradeInfo.point * credit;
            totalCredits += credit;
            subjects.push({ 
                name: toTitleCase(nameInput.value.trim()) || `Subject ${i}`, 
                credit, 
                score, 
                grade: gradeOutput.value 
            });
        }
    }
    
    return { 
        gpa: totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00", 
        subjects 
    };
}