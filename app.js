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
const statsContent = document.getElementById('statsContent');

const backBtns = document.querySelectorAll('.backBtn');

let exercises = [];
let currentExercise = null;

// --- Funktioner ---
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

function showSection(section) {
  // Dölj alla sektioner
  [mainMenu, addExerciseSection, exercisesSection, statisticsSection].forEach(s => {
    s.classList.add('hidden');
  });
  // Visa vald sektion
  section.classList.remove('hidden');
}

function updateExerciseList() {
  exerciseList.innerHTML = '';
  exercises.forEach(ex => {
    const li = document.createElement('li');
    li.textContent = ex.name;
    li.style.cursor = 'pointer';
    li.addEventListener('click', () => {
      openLogSet(ex);
    });
    exerciseList.appendChild(li);
  });
}

function openLogSet(exercise) {
  currentExercise = exercise;
  currentExerciseNameSpan.textContent = exercise.name;
  repsInput.value = '';
  weightInput.value = '';
  setsList.innerHTML = '';
  if (!exercise.sets) {
    exercise.sets = [];
  }
  exercise.sets.forEach(set => {
    const li = document.createElement('li');
    li.textContent = `Reps: ${set.reps}, Vikt: ${set.weight} kg, Datum: ${new Date(set.date).toLocaleDateString()}`;
    setsList.appendChild(li);
  });
  logSetSection.classList.remove('hidden');
  showSection(exercisesSection);
}

function addSet() {
  const reps = parseInt(repsInput.value);
  const weight = parseFloat(weightInput.value);
  if (isNaN(reps) || reps < 1) {
    alert('Ange giltiga reps (minst 1).');
    return;
  }
  if (isNaN(weight) || weight < 0) {
    alert('Ange giltig vikt (0 eller mer).');
    return;
  }
  const set = {
    reps,
    weight,
    date: new Date().toISOString(),
  };
  currentExercise.sets.push(set);
  saveExercises();
  openLogSet(currentExercise);
}

function saveExercise() {
  const name = newExerciseNameInput.value.trim();
  if (!name) {
    alert('Ange ett namn på övningen.');
    return;
  }
  if (exercises.some(e => e.name.toLowerCase() === name.toLowerCase())) {
    alert('Denna övning finns redan.');
    return;
  }
  const newEx = { name, sets: [] };
  exercises.push(newEx);
  saveExercises();
  newExerciseNameInput.value = '';
  updateExerciseList();
  updateStatSelect();
  showSection(mainMenu);
}

function updateStatSelect() {
  statExerciseSelect.innerHTML = '<option value="">Välj övning</option>';
  exercises.forEach(ex => {
    const opt = document.createElement('option');
    opt.value = ex.name;
    opt.textContent = ex.name;
    statExerciseSelect.appendChild(opt);
  });
}

function showStatistics() {
  const selectedName = statExerciseSelect.value;
  if (!selectedName) {
    statsContent.innerHTML = '<p>Välj en övning för att se statistik.</p>';
    return;
  }
  const exercise = exercises.find(e => e.name === selectedName);
  if (!exercise || !exercise.sets || exercise.sets.length === 0) {
    statsContent.innerHTML = '<p>Ingen data för denna övning än.</p>';
    return;
  }

  // Exempel på statistik: antal pass per vecka + max vikt och reps
  const sets = exercise.sets;

  // Räkna pass per vecka
  const weeks = {};
  sets.forEach(set => {
    const d = new Date(set.date);
    const year = d.getFullYear();
    const week = getWeekNumber(d);
    const key = year + '-W' + week;
    weeks[key] = (weeks[key] || 0) + 1;
  });

  let statsHtml = '<h3>Pass per vecka</h3><ul>';
  for (const wk in weeks) {
    statsHtml += `<li>${wk}: ${weeks[wk]} set</li>`;
  }
  statsHtml += '</ul>';

  // Max vikt och reps
  const maxWeight = Math.max(...sets.map(s => s.weight));
  const maxReps = Math.max(...sets.map(s => s.reps));

  statsHtml += `<p>Max vikt: ${maxWeight} kg</p>`;
  statsHtml += `<p>Max reps: ${maxReps}</p>`;

  statsContent.innerHTML = statsHtml;
}

function getWeekNumber(d) {
  // Källa: https://stackoverflow.com/a/6117889
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// --- Eventlisteners ---
addExerciseBtn.addEventListener('click', () => showSection(addExerciseSection));
exercisesBtn.addEventListener('click', () => {
  updateExerciseList();
  showSection(exercisesSection);
});
statisticsBtn.addEventListener('click', () => {
  updateStatSelect();
  showSection(statisticsSection);
});

saveExerciseBtn.addEventListener('click', saveExercise);
addSetBtn.addEventListener('click', addSet);
doneLoggingBtn.addEventListener('click', () => {
  logSetSection.classList.add('hidden');
});

backBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    logSetSection.classList.add('hidden');
    showSection(mainMenu);
  });
});

// --- Init ---
loadExercises();
showSection(mainMenu);
