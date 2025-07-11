// app.js
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
const labelSetSelect = document.getElementById('labelSetSelect');
const statsContent = document.getElementById('statsContent');
const chartCanvas = document.getElementById('chart');

const backBtns = document.querySelectorAll('.backBtn');

let exercises = [];
let currentExercise = null;
let currentChart = null;

// LocalStorage
function saveExercises() {
  localStorage.setItem('exercises', JSON.stringify(exercises));
}

function loadExercises() {
  const data = localStorage.getItem('exercises');
  exercises = data ? JSON.parse(data) : [];
}

// UI helpers
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

    li.addEventListener('click', () => openLogSet(ex));

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

    li.appendChild(btnEdit);
    li.appendChild(btnDelete);
    exerciseList.appendChild(li);
  });
}

function openLogSet(ex) {
  currentExercise = ex;
  currentExerciseNameSpan.textContent = ex.name;
  repsInput.value = '';
  weightInput.value = '';
  updateSetsList();
  showSection(exercisesSection);
  logSetSection.classList.remove('hidden');
}

function updateSetsList() {
  setsList.innerHTML = '';
  if (!currentExercise.sets) currentExercise.sets = [];

  currentExercise.sets.forEach((set, index) => {
    const li = document.createElement('li');
    li.classList.add('set-item');
    li.textContent = `Reps: ${set.reps}, Vikt: ${set.weight} kg`;

    const btnEdit = document.createElement('button');
    btnEdit.textContent = '✏️';
    btnEdit.classList.add('edit-btn');
    btnEdit.addEventListener('click', () => {
      const newReps = prompt('Reps:', set.reps);
      const newWeight = prompt('Vikt (kg):', set.weight);
      if (newReps && newWeight) {
        set.reps = Number(newReps);
        set.weight = Number(newWeight);
        saveExercises();
        updateSetsList();
        updateStatSelect();
      }
    });

    const btnDelete = document.createElement('button');
    btnDelete.textContent = '🗑️';
    btnDelete.addEventListener('click', () => {
      if (confirm('Ta bort detta set?')) {
        currentExercise.sets.splice(index, 1);
        saveExercises();
        updateSetsList();
        updateStatSelect();
      }
    });

    li.appendChild(btnEdit);
    li.appendChild(btnDelete);

    setsList.appendChild(li);
  });
}

function updateStatSelect() {
  // Uppdatera valbara övningar i statistik
  statExerciseSelect.innerHTML = '<option value="">Välj övning</option>';
  exercises.forEach((ex, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = ex.name;
    statExerciseSelect.appendChild(opt);
  });
  statSetSelect.classList.add('hidden');
  labelSetSelect.classList.add('hidden');
  clearStats();
}

function clearStats() {
  statsContent.innerHTML = '';
  if (currentChart) {
    currentChart.destroy();
    currentChart = null;
  }
  statSetSelect.innerHTML = '<option value="">Välj pass</option>';
  statSetSelect.classList.add('hidden');
  labelSetSelect.classList.add('hidden');
}

function showStatsForExercise(index) {
  clearStats();
  if (index === '') return;
  const ex = exercises[index];
  if (!ex.sets || ex.sets.length === 0) {
    statsContent.textContent = 'Inga set loggade för denna övning.';
    return;
  }

  // Visa alla pass som set (för enkelhet, vi räknar varje set som ett pass)
  statSetSelect.innerHTML = '<option value="">Välj pass</option>';
  ex.sets.forEach((set, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `Pass ${i + 1} - Reps: ${set.reps}, Vikt: ${set.weight}kg`;
    statSetSelect.appendChild(opt);
  });
  statSetSelect.classList.remove('hidden');
  labelSetSelect.classList.remove('hidden');

  // Visa graf för max vikt över pass (alla sets)
  const labels = ex.sets.map((_, i) => `Pass ${i + 1}`);
  const weights = ex.sets.map(set => set.weight);
  const reps = ex.sets.map(set => set.reps);

  const ctx = chartCanvas.getContext('2d');
  if (currentChart) currentChart.destroy();

  currentChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Vikt (kg)',
          data: weights,
          borderColor: '#4a90e2',
          backgroundColor: 'rgba(74, 144, 226, 0.2)',
          fill: true,
          tension: 0.3,
        },
        {
          label: 'Reps',
          data: reps,
          borderColor: '#50c878',
          backgroundColor: 'rgba(80, 200, 120, 0.2)',
          fill: true,
          tension: 0.3,
          yAxisID: 'reps-axis'
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      stacked: false,
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Vikt (kg)'
          }
        },
        'reps-axis': {
          type: 'linear',
          display: true,
          position: 'right',
          grid: {
            drawOnChartArea: false,
          },
          title: {
            display: true,
            text: 'Reps'
          }
        }
      }
    }
  });
}

function showStatsForSet(exIndex, setIndex) {
  if (exIndex === '' || setIndex === '') {
    statsContent.innerHTML = '';
    return;
  }
  const ex = exercises[exIndex];
  const set = ex.sets[setIndex];

  statsContent.innerHTML = `
    <p><strong>Övning:</strong> ${ex.name}</p>
    <p><strong>Pass:</strong> ${setIndex + 1}</p>
    <p><strong>Reps:</strong> ${set.reps}</p>
    <p><strong>Vikt:</strong> ${set.weight} kg</p>
  `;
}

addExerciseBtn.addEventListener('click', () => {
  showSection(addExerciseSection);
  newExerciseNameInput.value = '';
  newExerciseNameInput.focus();
});

saveExerciseBtn.addEventListener('click', () => {
  const name = newExerciseNameInput.value.trim();
  if (!name) {
    alert('Skriv in ett namn på övningen.');
    return;
  }
  if (exercises.find(e => e.name.toLowerCase() === name.toLowerCase())) {
    alert('Den övningen finns redan.');
    return;
  }
  exercises.push({ name, sets: [] });
  saveExercises();
  updateExerciseList();
  updateStatSelect();
  showSection(mainMenu);
});

exercisesBtn.addEventListener('click', () => {
  updateExerciseList();
  showSection(exercisesSection);
  logSetSection.classList.add('hidden');
});

statisticsBtn.addEventListener('click', () => {
  updateStatSelect();
  showSection(statisticsSection);
});

addSetBtn.addEventListener('click', () => {
  const reps = Number(repsInput.value);
  const weight = Number(weightInput.value);
  if (!reps || reps < 1) {
    alert('Ange ett giltigt antal reps.');
    return;
  }
  if (isNaN(weight) || weight < 0) {
    alert('Ange en giltig vikt.');
    return;
  }
  if (!currentExercise.sets) currentExercise.sets = [];
  currentExercise.sets.push({ reps, weight });
  saveExercises();
  updateSetsList();
  repsInput.value = '';
  weightInput.value = '';
  repsInput.focus();
});

doneLoggingBtn.addEventListener('click', () => {
  showSection(mainMenu);
});

statExerciseSelect.addEventListener('change', () => {
  const exIndex = statExerciseSelect.value;
  showStatsForExercise(exIndex);
});

statSetSelect.addEventListener('change', () => {
  const exIndex = statExerciseSelect.value;
  const setIndex = statSetSelect.value;
  showStatsForSet(exIndex, setIndex);
});

backBtns.forEach(btn => {
  btn.
