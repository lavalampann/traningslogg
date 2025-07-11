// --- Globala variabler och referenser ---
const mainMenu = document.getElementById('mainMenu');
const addExerciseSection = document.getElementById('addExerciseSection');
const exercisesSection = document.getElementById('exercisesSection');
const statisticsSection = document.getElementById('statisticsSection');

const addExerciseBtn = document.getElementById('addExerciseBtn');
const exercisesBtn = document.getElementById('exercisesBtn');
const statisticsBtn = document.getElementById('statisticsBtn');

const saveExerciseBtn = document.getElementById('saveExerciseBtn');
const backBtns = document.querySelectorAll('.backBtn');

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

let exercises = []; // Array med {name: string, sets: [{reps, weight, date}]}
let currentExercise = null;

// --- Funktioner för att visa/dölja sektioner ---
function showSection(section) {
  [mainMenu, addExerciseSection, exercisesSection, statisticsSection].forEach(s => {
    s.classList.add('hidden');
  });
  section.classList.remove('hidden');
}

// --- Ladda och spara data i localStorage ---
function saveExercises() {
  localStorage.setItem('exercises', JSON.stringify(exercises));
}

function loadExercises() {
  const saved = localStorage.getItem('exercises');
  if (saved) {
    exercises = JSON.parse(saved);
  }
}

// --- Uppdatera listan med övningar i "Övningar" sektionen ---
function updateExerciseList() {
  exerciseList.innerHTML = '';
  exercises.forEach((ex, index) => {
    const li = document.createElement('li');
    li.textContent = ex.name;
    li.style.cursor = 'pointer';
    li.addEventListener('click', () => {
      openLogSet(ex);
    });
    exerciseList.appendChild(li);
  });
}

// --- Öppna loggning av set för en övning ---
function openLogSet(exercise) {
  currentExercise = exercise;
  currentExerciseNameSpan.textContent = exercise.name;
  repsInput.value = '';
  weightInput.value = '';
  setsList.innerHTML = '';

  if (exercise.sets) {
    exercise.sets.forEach(set => {
      const li = document.createElement('li');
      li.textContent = `${set.reps} reps @ ${set.weight} kg (${new Date(set.date).toLocaleDateString()})`;
      setsList.appendChild(li);
    });
  }

  logSetSection.classList.remove('hidden');
  exerciseList.style.display = 'none';
}

// --- Lägg till set ---
addSetBtn.addEventListener('click', () => {
  const reps = parseInt(repsInput.value);
  const weight = parseFloat(weightInput.value);

  if (!reps || reps <= 0) {
    alert('Ange ett giltigt antal reps');
    return;
  }
  if (isNaN(weight) || weight < 0) {
    alert('Ange en giltig vikt (0 eller högre)');
    return;
  }

  const set = {
    reps,
    weight,
    date: new Date().toISOString(),
  };

  if (!currentExercise.sets) currentExercise.sets = [];
  currentExercise.sets.push(set);
  saveExercises();

  const li = document.createElement('li');
  li.textContent = `${set.reps} reps @ ${set.weight} kg (${new Date(set.date).toLocaleDateString()})`;
  setsList.appendChild(li);

  repsInput.value = '';
  weightInput.value = '';
});

// --- Klar med att logga set ---
doneLoggingBtn.addEventListener('click', () => {
  logSetSection.classList.add('hidden');
  exerciseList.style.display = 'block';
});

// --- Spara ny övning ---
saveExerciseBtn.addEventListener('click', () => {
  const name = newExerciseNameInput.value.trim();
  if (!name) {
    alert('Skriv in ett namn för övningen');
    return;
  }

  // Kolla om övning finns redan
  if (exercises.find(e => e.name.toLowerCase() === name.toLowerCase())) {
    alert('Den här övningen finns redan');
    return;
  }

  exercises.push({ name, sets: [] });
  saveExercises();
  newExerciseNameInput.value = '';
  alert(`Övningen "${name}" sparad!`);
  updateExerciseList();
  updateStatSelect();
  showSection(mainMenu);
});

// --- Uppdatera statistik-val dropdown ---
function updateStatSelect() {
  statExerciseSelect.innerHTML = '<option value="">Välj övning</option>';
  exercises.forEach((ex, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = ex.name;
    statExerciseSelect.appendChild(opt);
  });
  statsContent.innerHTML = '';
}

// --- Visa statistik för vald övning ---
statExerciseSelect.addEventListener('change', () => {
  const idx = statExerciseSelect.value;
  if (idx === '') {
    statsContent.innerHTML = '';
    return;
  }
  const ex = exercises[idx];
  showStatsForExercise(ex);
});

// --- Visa grundläggande statistik ---
function showStatsForExercise(exercise) {
  if (!exercise.sets || exercise.sets.length === 0) {
    statsContent.innerHTML = '<p>Inga sets loggade för den här övningen än.</p>';
    return;
  }

  // Statistik: antal träningspass (unika datum), maxvikt, genomsnitt reps och vikt
  const uniqueDates = new Set(exercise.sets.map(s => s.date.substring(0, 10)));
  const maxWeight = Math.max(...exercise.sets.map(s => s.weight));
  const avgReps =
    exercise.sets.reduce((acc, s) => acc + s.reps, 0) / exercise.sets.length;
  const avgWeight =
    exercise.sets.reduce((acc, s) => acc + s.weight, 0) / exercise.sets.length;

  statsContent.innerHTML = `
    <p>Antal träningspass: ${uniqueDates.size}</p>
    <p>Maxvikt: ${maxWeight.toFixed(1)} kg</p>
    <p>Genomsnittliga reps: ${avgReps.toFixed(1)}</p>
    <p>Genomsnittlig vikt: ${avgWeight.toFixed(1)} kg</p>
  `;
}

// --- Backknappar ---
backBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Göm allt och visa main menu
    logSetSection.classList.add('hidden');
    exerciseList.style.display = 'block';
    showSection(mainMenu);
  });
});

// --- Knapp för att gå till "Lägg till övning" ---
addExerciseBtn.addEventListener('click', () => {
  newExerciseNameInput.value = '';
  showSection(addExerciseSection);
});

// --- Knapp för att gå till "Övningar" ---
exercisesBtn.addEventListener('click', () => {
  updateExerciseList();
  logSetSection.classList.add('hidden');
  exerciseList.style.display = 'block';
  showSection(exercisesSection);
});

// --- Knapp för att gå till "Statistik" ---
statisticsBtn.addEventListener('click', () => {
  updateStatSelect();
  showSection(statisticsSection);
});

// --- Init ---
loadExercises();
showSection(mainMenu);
