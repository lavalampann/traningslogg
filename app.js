// --- Element ---
const mainMenu = document.getElementById('mainMenu');
const addExerciseSection = document.getElementById('addExerciseSection');
const exercisesSection = document.getElementById('exercisesSection');
const statisticsSection = document.getElementById('statisticsSection');

const addExerciseBtn = document.getElementById('addExerciseBtn');
const exercisesBtn = document.getElementById('exercisesBtn');
const statisticsBtn = document.getElementById('statisticsBtn');

const saveExerciseBtn = document.getElementById('saveExerciseBtn');
const newExerciseNameInput = document.getElementById('newExerciseName');

const exerciseList = document.getElementById('exerciseList');
const logSetSection = document.getElementById('logSetSection');
const currentExerciseNameSpan = document.getElementById('currentExerciseName');
const repsInput = document.getElementById('repsInput');
const weightInput = document.getElementById('weightInput');
const addSetBtn = document.getElementById('addSetBtn');
const doneLoggingBtn = document.getElementById('doneLoggingBtn');
const setsList = document.getElementById('setsList');

const statExerciseSelect = document.getElementById('statExerciseSelect');
const statSetSelect = document.getElementById('statSetSelect');
const statsContent = document.getElementById('statsContent');

const backBtns = document.querySelectorAll('.backBtn');

let exercises = [];
let currentExercise = null;

// --- LocalStorage ---
function saveExercises() {
  localStorage.setItem('exercises', JSON.stringify(exercises));
}

function loadExercises() {
  const data = localStorage.getItem('exercises');
  if (data) {
    exercises = JSON.parse(data);
  } else {
    exercises = [];
  }
}

// --- UI Helpers ---
function showSection(section) {
  [mainMenu, addExerciseSection, exercisesSection, statisticsSection].forEach(s => {
    s.classList.add('hidden');
  });
  section.classList.remove('hidden');
}

function updateExerciseList() {
  exerciseList.innerHTML = '';
  exercises.forEach((ex, i) => {
    const li = document.createElement('li');
    li.textContent = ex.name;
    li.style.cursor = 'pointer';

    // Klick för att öppna loggset
    li.addEventListener('click', () => openLogSet(ex));

    // Lägg till redigera och ta bort knappar
    const btnEdit = document.createElement('button');
    btnEdit.textContent = '✏️';
    btnEdit.classList.add('edit-btn');
    btnEdit.addEventListener('click', (e) => {
      e.stopPropagation();
      const newName = prompt('Redigera övningsnamn:', ex.name);
      if (newName && newName.trim()) {
        ex.name = newName.trim();
        saveExercises();
        updateExerciseList();
        updateStatSelect();
      }
    });

    const btnDelete = document.createElement('button');
    btnDelete.textContent = '🗑️';
    btnDelete.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Ta bort övningen "${ex.name}" och all dess data?`)) {
        exercises.splice(i, 1);
        saveExercises();
        updateExerciseList();
        updateStatSelect();
      }
    });

    li.append
