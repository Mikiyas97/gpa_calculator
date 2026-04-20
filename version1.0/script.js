// GPA Calculator script (ES6)
// - Validates scores (0-100)
// - Maps score -> letter grade and grade point (matching given C++ mapping)
// - Calculates weighted GPA and displays a report

// List of inputs and their corresponding labels
const subjects = [
  {id: 'discrete', name: 'Discrete Math'},
  {id: 'database', name: 'Database'},
  {id: 'software', name: 'Software Engineering'},
  {id: 'economics', name: 'Economics'},
  {id: 'programming', name: 'Programming (Python)'},
  {id: 'inclusiveness', name: 'Inclusiveness'},
  {id: 'global', name: 'Global Trend'}
];

// DOM refs will be set during init to ensure DOM is ready
let scoreInputs = [];
let calculateBtn;
let resetBtn;
let reportOutput;
let gpaDisplay;
let errorBox;

function init(){
  // DOM references
  scoreInputs = Array.from(document.querySelectorAll('.score-input'));
  calculateBtn = document.getElementById('calculate');
  resetBtn = document.getElementById('reset');
  reportOutput = document.getElementById('report-output');
  gpaDisplay = document.getElementById('gpa-display');
  errorBox = document.getElementById('error');

  // Attach live update listeners
  scoreInputs.forEach(inp => {
    inp.addEventListener('input', () => updateLetterForInput(inp));
  });

  // Event wiring
  calculateBtn.addEventListener('click', calculateGpa);
  resetBtn.addEventListener('click', resetAll);

  // Initialize letter cells based on any pre-filled values
  scoreInputs.forEach(inp => updateLetterForInput(inp));
}

// Initialize now or on DOMContentLoaded
if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Map numeric score to letter and grade point (exact ranges provided)
function gradeFromScore(score){
  // Ensure score is numeric
  const s = Number(score);
  if (Number.isNaN(s)) return {letter: '-', point: 0.0};

  if (s >= 90 && s <= 100) return {letter: 'A+', point: 4.0};
  if (s >= 85 && s <= 89)  return {letter: 'A',  point: 4.0};
  if (s >= 80 && s <= 84)  return {letter: 'A−', point: 3.75};
  if (s >= 75 && s <= 79)  return {letter: 'B+', point: 3.5};
  if (s >= 70 && s <= 74)  return {letter: 'B',  point: 3.0};
  if (s >= 65 && s <= 69)  return {letter: 'B−', point: 2.75};
  if (s >= 60 && s <= 64)  return {letter: 'C+', point: 2.5};
  if (s >= 55 && s <= 59)  return {letter: 'C',  point: 2.0};
  if (s >= 50 && s <= 54)  return {letter: 'C−', point: 1.75};
  if (s >= 45 && s <= 49)  return {letter: 'D',  point: 1.0};
  if (s < 45)                return {letter: 'F',  point: 0.0};
  // Fallback
  return {letter: '-', point: 0.0};
}

// Utility: clear letter classes and set new color class based on letter
function applyGradeColor(element, letter){
  element.classList.remove('grade-A','grade-B','grade-C','grade-D','grade-F');
  if (!letter || letter === '-') return;
  if (letter === 'A+' || letter === 'A' || letter === 'A−') element.classList.add('grade-A');
  else if (letter.startsWith('B')) element.classList.add('grade-B');
  else if (letter.startsWith('C')) element.classList.add('grade-C');
  else if (letter === 'D') element.classList.add('grade-D');
  else if (letter === 'F') element.classList.add('grade-F');
}

// Update letter cell when an input changes
function updateLetterForInput(input){
  const key = input.id.replace('score-','');
  const letterCell = document.getElementById(`letter-${key}`);
  const val = input.value.trim();
  if (val === ''){
    letterCell.textContent = '-';
    applyGradeColor(letterCell, null);
    return;
  }
  const {letter} = gradeFromScore(val);
  letterCell.textContent = letter;
  applyGradeColor(letterCell, letter);
}


// Validate all inputs: not empty, numeric, between 0 and 100
function validateAll(){
  errorBox.textContent = '';
  const values = [];
  for (const input of scoreInputs){
    const v = input.value.trim();
    if (v === ''){
      return {ok:false, message: 'Please fill all score fields.'};
    }
    const n = Number(v);
    if (Number.isNaN(n) || n < 0 || n > 100){
      return {ok:false, message: 'Scores must be numbers between 0 and 100.'};
    }
    values.push(n);
  }
  return {ok:true, values};
}

// Animate numeric counter from 0 to target (simple easing)
function animateGpa(target){
  const duration = 800; // ms
  const start = performance.now();
  function step(now){
    const t = Math.min(1, (now - start) / duration);
    const eased = t < 0.5 ? 2*t*t : -1 + (4-2*t)*t; // ease
    const current = (eased * target);
    gpaDisplay.textContent = `${current.toFixed(2)} / 4.0`;
    if (t < 1) requestAnimationFrame(step);
    else gpaDisplay.textContent = `${target.toFixed(2)} / 4.0`;
  }
  requestAnimationFrame(step);
}

// Build grade report and compute weighted GPA
function calculateGpa(){
  const v = validateAll();
  if (!v.ok){ errorBox.textContent = v.message; return; }

  let totalCredits = 0;
  let weightedSum = 0;
  for (const input of scoreInputs){
    const score = Number(input.value);
    const credit = Number(input.dataset.credit || 0);
    const {letter, point} = gradeFromScore(score);
    totalCredits += credit;
    weightedSum += point * credit;
    const key = input.id.replace('score-','');
    // ensure displayed letter is up-to-date and color-coded
    const letterCell = document.getElementById(`letter-${key}`);
    letterCell.textContent = letter;
    applyGradeColor(letterCell, letter);
  }

  const gpa = weightedSum / totalCredits;
  // Do not show detailed per-subject lines in the Grade Report
  reportOutput.textContent = '';
  animateGpa(gpa);
}

// Reset all inputs and outputs
function resetAll(){
  for (const input of scoreInputs){ input.value = ''; updateLetterForInput(input); }
  reportOutput.textContent = 'No calculation yet.';
  gpaDisplay.textContent = '- / 4.0';
  errorBox.textContent = '';
}

// (Initialization handled in init())
