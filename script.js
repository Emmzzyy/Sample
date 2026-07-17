// State variables
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let markedDays = JSON.parse(localStorage.getItem('markedDays')) || []; // dates containing marked crossmarks
let currentFilter = 'all';
let editingTaskId = null; // Track kon kinsa nga task ang gi-edit

let currentDate = new Date();
let today = new Date();

// Motivation Quotes Database
const quotes = [
  "You are stronger than you think.",
  "Believing in yourself is the first secret to success.",
  "Don't stop when you're tired. Stop when you are done.",
  "Great things never come from comfort zones.",
  "Action is the foundational key to all success.",
  "Your struggle today is developing your strength for tomorrow.",
  "Focus on progress, not perfection.", 
  "Layo pa pero Layo na.",
  "Kaon para Gamiton.",
  "Hapit na , padayon lang.",
  "Be Mature, I know you can.",
  "You are capable of amazing things.",
  "Stress ka? tara ice cream.",
  "Keep going."
];

// Load App Features on start
window.onload = function() {
  setRandomQuote();
  renderCalendar();
  renderTasks();
  updateProgress();
  initTheme();
  displayChristmasCountdown(); // Calculates and updates the countdown
};

/* --- Christmas Countdown --- */
function displayChristmasCountdown() {
  const currentYear = today.getFullYear();
  let christmas = new Date(currentYear, 11, 25); // December 25th

  // If Christmas this year has passed, countdown to next year's Christmas
  if (today > christmas) {
    christmas.setFullYear(currentYear + 1);
  }

  // Calculate difference in time elements
  let months = christmas.getMonth() - today.getMonth();
  let days = christmas.getDate() - today.getDate();

  // Adjust months and days if days calculation falls negative
  if (days < 0) {
    months -= 1;
    // Get total days in the current month to borrow
    const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    days += daysInCurrentMonth;
  }
  
  if (months < 0) {
    months += 12;
  }

  // Create message text
  let countdownMessage = "";
  if (months === 0 && days === 0) {
    countdownMessage = "🎄 Merry Christmas! Malipayong Pasko! 🎁";
  } else {
    const monthText = months === 1 ? "month" : "months";
    const dayText = days === 1 ? "day" : "days";
    
    if (months > 0 && days > 0) {
      countdownMessage = `${months} ${monthText} and ${days} ${dayText} to go before Christmas! 🎄`;
    } else if (months > 0) {
      countdownMessage = `${months} ${monthText} to go before Christmas! 🎄`;
    } else {
      countdownMessage = `${days} ${dayText} to go before Christmas! 🎄`;
    }
  }

  // Dynamically attach the countdown text under the dashboard title
  const headerLeft = document.querySelector('.header-left p');
  if (headerLeft) {
    headerLeft.innerHTML = `Stay organized, stay motivated, achieve greatness <br><strong style="color: #fef08a; display:inline-block; margin-top:5px; font-size:13px;">${countdownMessage}</strong>`;
  }
}

/* --- Motivation Quotes --- */
function setRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  document.getElementById('motivationQuote').textContent = quotes[randomIndex];
}

/* --- App Theme Control --- */
function initTheme() {
  const isDark = localStorage.getItem('darkTheme') === 'true';
  if (isDark) {
    document.body.classList.add('dark-theme');
    document.querySelector('.theme-toggle i').className = 'fa-solid fa-sun';
  }
}

function toggleTheme() {
  const body = document.body;
  body.classList.toggle('dark-theme');
  const isDark = body.classList.contains('dark-theme');
  localStorage.setItem('darkTheme', isDark);
  document.querySelector('.theme-toggle i').className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

/* --- Calendar Features --- */
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  document.getElementById('calendarMonthYear').textContent = `${months[month]} ${year}`;

  const daysContainer = document.getElementById('calendarDays');
  daysContainer.innerHTML = '';

  // Render previous month spaces
  for (let x = firstDayIndex; x > 0; x--) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day empty';
    daysContainer.appendChild(dayDiv);
  }

  // Render current month days
  for (let i = 1; i <= lastDay; i++) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    dayDiv.textContent = i;

    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

    // Highlight today
    if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      dayDiv.classList.add('today');
    }

    // Apply Red X Cross-mark if marked done
    if (markedDays.includes(dateKey)) {
      dayDiv.classList.add('marked-done');
    }

    daysContainer.appendChild(dayDiv);
  }
}

function prevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}

function markDayAsDone() {
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  if (!markedDays.includes(dateKey)) {
    markedDays.push(dateKey);
    localStorage.setItem('markedDays', JSON.stringify(markedDays));
    renderCalendar();
    updateProgress();
  }
}

/* --- Task CRUD Logic (with EDIT) --- */
function openModal(taskId = null) {
  const modal = document.getElementById('taskModal');
  const modalTitle = document.getElementById('modalTitle');
  const submitBtn = document.getElementById('submitTaskBtn');
  const input = document.getElementById('taskInput');

  if (taskId) {
    // EDIT MODE
    editingTaskId = taskId;
    const taskToEdit = tasks.find(t => t.id === taskId);
    if (taskToEdit) {
      input.value = taskToEdit.text;
      modalTitle.textContent = "Edit Task";
      submitBtn.textContent = "Save Changes";
    }
  } else {
    // ADD MODE
    editingTaskId = null;
    input.value = '';
    modalTitle.textContent = "Create New Task";
    submitBtn.textContent = "Add Task";
  }

  modal.classList.add('open');
  input.focus();
}

function closeModal() {
  document.getElementById('taskModal').classList.remove('open');
  document.getElementById('taskInput').value = '';
  editingTaskId = null;
}

// Mo-handle mapa "Add" o mapa "Edit" nga submit
function handleTaskSubmit() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();

  if (!text) return;

  if (editingTaskId) {
    // I-update ang existing task
    tasks = tasks.map(task => {
      if (task.id === editingTaskId) {
        return { ...task, text: text };
      }
      return task;
    });
  } else {
    // Mag-add og bag-o nga task
    const newTask = {
      id: Date.now(),
      text: text,
      completed: false,
      dateCreated: new Date().toDateString()
    };
    tasks.push(newTask);
  }

  saveToLocalStorage();
  renderTasks();
  updateProgress();
  closeModal();
}

function toggleTaskComplete(id) {
  tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
  saveToLocalStorage();
  renderTasks();
  updateProgress();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveToLocalStorage();
  renderTasks();
  updateProgress();
}

function saveToLocalStorage() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function filterTasks(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  if(event) event.target.classList.add('active');
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');
  list.innerHTML = '';

  const todayStr = new Date().toDateString();
  let filteredList = tasks.filter(task => task.dateCreated === todayStr);

  // Update Filters Sub-count numbers
  document.getElementById('allCount').textContent = filteredList.length;
  document.getElementById('pendingCount').textContent = filteredList.filter(t => !t.completed).length;
  document.getElementById('completedCount').textContent = filteredList.filter(t => t.completed).length;

  if (currentFilter === 'pending') {
    filteredList = filteredList.filter(task => !task.completed);
  } else if (currentFilter === 'completed') {
    filteredList = filteredList.filter(task => task.completed);
  }

  if (filteredList.length === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
  }

  filteredList.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;

    li.innerHTML = `
      <div class="task-item-left">
        <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskComplete(${task.id})">
        <span class="task-text">${task.text}</span>
      </div>
      <div class="action-btn-group">
        <!-- EDIT BUTTON -->
        <button class="delete-btn" style="color: var(--accent-purple);" onclick="openModal(${task.id})">
          <i class="fa-regular fa-pen-to-square"></i>
        </button>
        <!-- DELETE BUTTON -->
        <button class="delete-btn" onclick="deleteTask(${task.id})">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    `;
    list.appendChild(li);
  });
}

/* --- Progress & Streak Calculations --- */
function calculateCurrentStreak() {
  if (markedDays.length === 0) return 0;

  const sortedDates = [...markedDays].map(d => new Date(d)).sort((a, b) => b - a);
  const checkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const formattedToday = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
  
  let streak = 0;
  
  if (!markedDays.includes(formattedToday)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  while (true) {
    const formattedCheck = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (markedDays.includes(formattedCheck)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function updateProgress() {
  const todayStr = new Date().toDateString();
  const todaysTasks = tasks.filter(task => task.dateCreated === todayStr);
  const completedToday = todaysTasks.filter(task => task.completed).length;
  const totalCount = todaysTasks.length;

  // Percentage Circle Math
  const percentage = totalCount > 0 ? Math.round((completedToday / totalCount) * 100) : 0;
  document.getElementById('progressPercentage').textContent = `${percentage}%`;
  document.getElementById('progressTaskText').textContent = `${completedToday} of ${totalCount} tasks`;

  // Animate SVG stroke circle
  const circleOffset = 440 - (440 * percentage) / 100;
  document.getElementById('progressBarCircle').style.strokeDashoffset = circleOffset;

  // Header quick-stats
  document.getElementById('todayTasksCount').textContent = `${completedToday}/${totalCount}`;
  
  const allCompletedTotal = tasks.filter(t => t.completed).length;
  document.getElementById('totalCompletedCount').textContent = allCompletedTotal;

  // Dynamic consecutive streak engine
  const consecutiveStreak = calculateCurrentStreak();
  document.getElementById('streakCount').textContent = `${consecutiveStreak} ${consecutiveStreak === 1 ? 'day' : 'days'}`;

  // Overall success rates based on logged complete tasks vs total tasks ever made
  const successRatePercentage = tasks.length > 0 ? Math.round((allCompletedTotal / tasks.length) * 100) : 0;
  document.getElementById('successRate').textContent = `${successRatePercentage}%`;

  // Dynamically change micro copy badge based on complete counts
  const badge = document.getElementById('progressMessage');
  if (totalCount === 0) {
    badge.textContent = "Plan your day!";
  } else if (percentage === 100) {
    badge.textContent = "Fantastic job! All done.";
  } else if (percentage >= 50) {
    badge.textContent = "More than halfway there!";
  } else {
    badge.textContent = "Keep crushing it!";
  }
}