// Hämta element
const btnAddExercise = document.getElementById("btnAddExercise");
const btnExercises = document.getElementById("btnExercises");
const btnStats = document.getElementById("btnStats");

const addExerciseSection = document.getElementById("addExerciseSection");
const exercisesSection = document.getElementById("exercisesSection");
const statsSection = document.getElementById("statsSection");

const newExerciseName = document.getElementById("newExerciseName");
const saveExerciseBtn = document.getElementById("saveExerciseBtn");

const exerciseList = document.getElementById("exerciseList");
const logSetSection = document.getElementById("logSetSection");
const currentExerciseName = document.getElementById("currentExerciseName");
const inputReps = document.getElementById("inputReps");
const inputWeight = document.getElementById("inputWeight");
const addSetBtn = document.getElementById("addSetBtn");
const setsList = document.getElementById("setsList");

const statsExerciseSelect = document.getElementById("statsExerciseSelect");
const statsOutput = document.getElementById("statsOutput");

const addExerciseBtn = document.getElementById('addExerciseBtn');
const addExerciseSection = document.getElementById('addExerciseSection');
const mainMenu = document.getElementById('mainMenu');

addExerciseBtn.addEventListener('click', () => {
  mainMenu.style.display = 'none';
  addExerciseSection.style.display = 'block';
});

let exercises = JSON.parse(localStorage.getItem("exercises")) || [];
let currentExercise = null;

// Visa rätt sektion
function showSection(section) {
  addExerciseSection.classList.add("hidden");
  exercisesSection.classList.add("hidden");
  statsSection.classList.add("hidden");
  section.classList.remove("hidden");
}

function saveExercises() {
  localStorage.setItem("exercises", JSON.stringify(exercises));
}

function renderExerciseList() {
  exerciseList.innerHTML = "";
  exercises.forEach((ex, index) => {
    const li = document.createElement("li");
    li.textContent = ex.name;
    li.style.cursor = "pointer";
    li.addEventListener("click", () => {
      currentExercise = ex;
      currentExerciseName.textContent = ex.name;
      renderSets();
      logSetSection.classList.remove("hidden");
    });
    exerciseList.appendChild(li);
  });
}

function renderSets() {
  setsList.innerHTML = "";
  if (!currentExercise.sets) currentExercise.sets = [];
  currentExercise.sets.forEach((set, idx) => {
    const li = document.createElement("li");
    li.textContent = `Set ${idx + 1}: ${set.reps} reps, ${set.weight} kg`;
    setsList.appendChild(li);
  });
}

function updateStatsSelect() {
  statsExerciseSelect.innerHTML = "";
  exercises.forEach((ex, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = ex.name;
    statsExerciseSelect.appendChild(option);
  });
}

function calculateStats(exercise) {
  if (!exercise.sets || exercise.sets.length === 0) return "Ingen data att visa.";

  // Beräkna total vikt, reps och antal pass (dagar)
  const totalSets = exercise.sets.length;
  let totalReps = 0;
  let maxWeight = 0;
  exercise.sets.forEach(set => {
    totalReps += set.reps;
    if (set.weight > maxWeight) maxWeight = set.weight;
  });

  // Antal träningspass (unik dag) – här förenklat som sets-count
  const sessions = new Set(exercise.sets.map(s => s.date)).size || totalSets;

  return `
    <p>Antal set: ${totalSets}</p>
    <p>Total reps: ${totalReps}</p>
    <p>Maxvikt: ${maxWeight} kg</p>
    <p>Antal träningspass: ${sessions}</p>
  `;
}

function showStats() {
  const idx = statsExerciseSelect.value;
  const ex = exercises[idx];
  statsOutput.innerHTML = calculateStats(ex);
}

// Event listeners
btnAddExercise.addEventListener("click", () => {
  showSection(addExerciseSection);
});

btnExercises.addEventListener("click", () => {
  showSection(exercisesSection);
  renderExerciseList();
  logSetSection.classList.add("hidden");
  currentExercise = null;
});

btnStats.addEventListener("click", () => {
  showSection(statsSection);
  updateStatsSelect();
  showStats();
});

saveExerciseBtn.addEventListener("click", () => {
  const name = newExerciseName.value.trim();
  if (!name) {
    alert("Ange ett namn på övningen!");
    return;
  }
  exercises.push({ name, sets: [] });
  saveExercises();
  newExerciseName.value = "";
  alert("Övning sparad!");
});

addSetBtn.addEventListener("click", () => {
  const reps = parseInt(inputReps.value);
  const weight = parseFloat(inputWeight.value);
  if (isNaN(reps) || reps <= 0) {
    alert("Ange giltigt antal reps!");
    return;
  }
  if (isNaN(weight) || weight < 0) {
    alert("Ange giltig vikt (0 eller högre)!");
    return;
  }
  currentExercise.sets.push({
    reps,
    weight,
    date: new Date().toISOString().slice(0, 10), // Spara datum YYYY-MM-DD
  });
  saveExercises();
  renderSets();
  inputReps.value = "";
  inputWeight.value = "";
});

statsExerciseSelect.addEventListener("change", showStats);

// Visa startsektion
showSection(addExerciseSection);
