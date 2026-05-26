const quizForm = document.getElementById('quiz-form');
const questionList = document.getElementById('question-list');
const quizFeedback = document.getElementById('quiz-feedback');
const resetBtn = document.getElementById('reset-btn');
const gameSection = document.getElementById('game-section');
const quizSection = document.getElementById('quiz-section');
const registerSection = document.getElementById('register-section');
const registerForm = document.getElementById('register-form');
const signInForm = document.getElementById('signin-form');
const exportDataBtn = document.getElementById('export-data-btn');
const exportUsageBtn = document.getElementById('export-usage-btn');
const takeQuizBtn = document.getElementById('take-quiz-btn');
const authTabs = document.querySelector('.auth-tabs');
const registerFeedback = document.getElementById('register-feedback');
const signInFeedback = document.getElementById('signin-feedback');
const sessionBanner = document.getElementById('session-banner');
const studentNameDisplay = document.getElementById('student-name');
const studentGradeDisplay = document.getElementById('student-grade');
const sessionDurationDisplay = document.getElementById('session-duration');
const signOutBtn = document.getElementById('sign-out-btn');
const registerTab = document.getElementById('tab-register');
const signInTab = document.getElementById('tab-signin');
const timerDisplay = document.getElementById('game-timer');
const scoreDisplay = document.getElementById('game-score');
const restrictedExportRow = document.getElementById('restricted-export-row');
const restrictedSchedulerDesign = document.getElementById('restricted-scheduler-design');
const canvas = document.getElementById('pong-canvas');
const ctx = canvas.getContext('2d');

let activeStudent = null;
let sessionTimer = null;
let sessionStartTimestamp = null;

let questions = [];
let gameTimer = null;
let gameDuration = 120;
let remainingSeconds = gameDuration;
let animationFrameId = null;
let ball = null;
let playerPaddle = null;
let aiPaddle = null;
let pairs = [];
let currentScore = 0;
let gameActive = false;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createOneStepEquationWordProblem() {
  const variations = [];
  
  for (let i = 0; i < 5; i += 1) {
    const x = randomInt(5, 12);
    const b = randomInt(1, x - 1);
    
    const prompts = [
      `Jordan has x marbles. He gives ${b} marbles to a friend and has ${x - b} left. What was x?`,
      `A box contains x candy bars. After removing ${b}, there are ${x - b} left. What is x?`,
      `Sarah had x stickers. She used ${b} in a project and has ${x - b} remaining. What is x?`,
      `A store had x books. After selling ${b} books, ${x - b} remain on the shelf. What is x?`,
      `In a garden, x flowers were planted. ${b} flowers wilted, leaving ${x - b} healthy ones. What is x?`,
    ];
    
    variations.push({
      prompt: prompts[i],
      answer: x,
      validate: (value) => Number(value) === x,
    });
  }
  
  return variations[randomInt(0, 4)];
}

function createEvaluateExpression() {
  const variations = [];
  
  for (let i = 0; i < 5; i += 1) {
    const pointsPerGame = randomInt(2, 8);
    const bonus = randomInt(3, 10);
    const numGames = randomInt(3, 8);
    
    const scenarios = [
      { subject: 'Riley', activity: 'game', unit: 'points', action: 'earned a' },
      { subject: 'Marcus', activity: 'level', unit: 'coins', action: 'collected a' },
      { subject: 'Sofia', activity: 'race', unit: 'seconds', action: 'saved a' },
      { subject: 'Jordan', activity: 'task', unit: 'stars', action: 'got a' },
      { subject: 'Alex', activity: 'round', unit: 'tokens', action: 'won a' },
    ];
    
    const { subject, activity, unit, action } = scenarios[i];
    const result = pointsPerGame * numGames + bonus;
    
    variations.push({
      prompt: `${subject} scores ${pointsPerGame} ${unit} per ${activity} and ${action} ${bonus}-${unit} bonus this season. After ${numGames} ${activity}s, what is the total ${unit}?`,
      answer: result,
      validate: (value) => Number(value) === result,
    });
  }
  
  return variations[randomInt(0, 4)];
}

function createWriteExpressionWordProblem() {
  const variations = [];
  
  for (let i = 0; i < 5; i += 1) {
    const num = randomInt(2, 8);
    const value = randomInt(2, 10);
    
    const prompts = [
      `Write an expression: ${num} candies cost $${value} each. How much for all ${num}?`,
      `Write an expression: ${num} books cost $${value} each. Total cost?`,
      `Write an expression: Each of ${num} students gets $${value}. Total amount distributed?`,
      `Write an expression: ${num} pizzas cost $${value} each. What's the total?`,
      `Write an expression: ${num} tickets at $${value} each. Total expense?`,
    ];
    
    variations.push({
      prompt: prompts[i],
      answer: `${num}*${value}`,
      validate: (value) => {
        const cleaned = value.replace(/\s+/g, '');
        return cleaned === `${num}*${value}` || cleaned === `${value}*${num}`;
      },
    });
  }
  
  return variations[randomInt(0, 4)];
}

function createRatioProblemWordProblem() {
  const variations = [];
  
  for (let i = 0; i < 5; i += 1) {
    const a = randomInt(2, 5);
    const b = randomInt(2, 7);
    const scale = randomInt(2, 5);
    
    const prompts = [
      `The ratio of apples to oranges is ${a}:${b}. If there are ${b * scale} oranges, how many apples are there?`,
      `A recipe calls for ${a} cups of flour to ${b} cups of sugar. If you use ${b * scale} cups of sugar, how much flour?`,
      `In a class, the ratio of boys to girls is ${a}:${b}. If there are ${b * scale} girls, how many boys?`,
      `A map has a scale of ${a}:${b}. If a real distance is ${b * scale} miles, what is the map distance?`,
      `The ratio of cats to dogs in a shelter is ${a}:${b}. With ${b * scale} dogs, how many cats are there?`,
    ];
    
    variations.push({
      prompt: prompts[i],
      answer: a * scale,
      validate: (value) => Number(value) === a * scale,
    });
  }
  
  return variations[randomInt(0, 4)];
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function getStoredStudents() {
  const raw = localStorage.getItem('sisyphusStudents');
  return raw ? JSON.parse(raw) : [];
}

function saveStoredStudents(students) {
  localStorage.setItem('sisyphusStudents', JSON.stringify(students));
}

function getUsageLog() {
  const raw = localStorage.getItem('sisyphusUsageLog');
  return raw ? JSON.parse(raw) : [];
}

function saveUsageLog(logs) {
  localStorage.setItem('sisyphusUsageLog', JSON.stringify(logs));
}

function getWeekLabel(date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString().slice(0, 10);
}

function logStudentUsage(student, action) {
  if (!student) return;
  const logs = getUsageLog();
  const usageMinutes = sessionStartTimestamp
    ? Math.max(0, Math.round((Date.now() - sessionStartTimestamp) / 60000))
    : 0;

  logs.push({
    email: normalizeEmail(student.email),
    firstName: student.firstName,
    lastName: student.lastName,
    grade: student.grade,
    action,
    usageMinutes,
    weekOf: getWeekLabel(new Date()),
  });
  saveUsageLog(logs);
}

function buildCsvRow(row) {
  return row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',');
}

function shouldRememberUser() {
  const registerRemember = document.getElementById('remember-me-register');
  const signInRemember = document.getElementById('remember-me-signin');
  return (registerRemember && registerRemember.checked) || (signInRemember && signInRemember.checked);
}

function clearRememberedLogin() {
  localStorage.removeItem('sisyphusRememberedEmail');
}

function storeRememberedLogin(email) {
  localStorage.setItem('sisyphusRememberedEmail', normalizeEmail(email));
}

function exportStudentsToCsv() {
  const students = getStoredStudents();
  if (students.length === 0) {
    showAuthFeedback(registerFeedback, 'No registered students are available to export.', false);
    return;
  }

  const header = ['First Name', 'Last Name', 'Grade', 'Email'];
  const rows = [header, ...students.map((student) => [student.firstName, student.lastName, student.grade, student.email])];
  const csvContent = rows.map(buildCsvRow).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'student_registry.csv');
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showAuthFeedback(registerFeedback, 'Student registry exported as CSV. You can send it to ttyson@blackstudentfund.org from your email client.', true);
}

function exportUsageHistoryToCsv() {
  const logs = getUsageLog();
  if (logs.length === 0) {
    showAuthFeedback(registerFeedback, 'No usage history is available to export yet.', false);
    return;
  }

  const header = ['Week Of', 'Usage Minutes', 'First Name', 'Last Name', 'Grade', 'Email', 'Action'];
  const rows = [
    header,
    ...logs.map((entry) => [entry.weekOf, entry.usageMinutes, entry.firstName, entry.lastName, entry.grade, entry.email, entry.action]),
  ];

  const csvContent = rows.map(buildCsvRow).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'usage_history.csv');
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showAuthFeedback(registerFeedback, 'Usage history exported as CSV. You can open it in Excel.', true);
}

function getWeeklyReportSchedulerDesign() {
  return {
    name: 'Weekly Student Registry Report',
    schedule: {
      frequency: 'weekly',
      dayOfWeek: 'Monday',
      time: '09:00',
      timezone: 'local',
    },
    export: {
      format: 'csv',
      filename: 'student_registry.csv',
      fields: ['First Name', 'Last Name', 'Grade', 'Email'],
    },
    delivery: {
      method: 'email',
      recipient: 'ttyson@blackstudentfund.org',
      subject: 'Weekly Student Registry Report',
    },
    notes: [
      'Requires a backend or server-side scheduler.',
      'The scheduler should read the stored student registry, generate the CSV, and email it weekly.',
      'If email delivery is not available, the scheduler can upload the report to secure cloud storage and notify the recipient.',
    ],
  };
}

function formatSessionTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${secs}`;
}

function showAuthFeedback(element, message, isSuccess = false) {
  element.textContent = message;
  element.classList.remove('hidden');
  element.style.background = isSuccess
    ? 'rgba(61, 211, 193, 0.16)'
    : 'rgba(255, 111, 97, 0.16)';
  element.style.borderColor = isSuccess
    ? 'rgba(61, 211, 193, 0.26)'
    : 'rgba(255, 111, 97, 0.26)';
}

function toggleAuthTab(selected) {
  if (selected === 'register') {
    registerTab.classList.add('active');
    signInTab.classList.remove('active');
    registerForm.classList.remove('hidden');
    signInForm.classList.add('hidden');
  } else {
    registerTab.classList.remove('active');
    signInTab.classList.add('active');
    registerForm.classList.add('hidden');
    signInForm.classList.remove('hidden');
  }
}

function updateSessionTimer() {
  if (!sessionStartTimestamp) {
    sessionDurationDisplay.textContent = 'Session time: 0:00';
    return;
  }
  const elapsed = Math.max(0, Math.floor((Date.now() - sessionStartTimestamp) / 1000));
  sessionDurationDisplay.textContent = `Session time: ${formatSessionTime(elapsed)}`;
}

function isAuthorizedStudent(student) {
  return student && student.lastName.trim().toLowerCase() === 'tyson' && normalizeEmail(student.email) === 'tyson571us@yahoo.com';
}

function updateRestrictedAccess(student) {
  const allowed = isAuthorizedStudent(student);
  restrictedExportRow.classList.toggle('hidden', !allowed);
  restrictedSchedulerDesign.classList.toggle('hidden', !allowed);
  takeQuizBtn.classList.toggle('hidden', !allowed);
  if (!allowed) {
    quizSection.classList.add('hidden');
    gameSection.classList.add('hidden');
  }
}

function setActiveStudent(student, { restoreTimestamp = false, rememberMe = false } = {}) {
  activeStudent = student;
  studentNameDisplay.textContent = `${student.firstName} ${student.lastName}`;
  studentGradeDisplay.textContent = `| Grade ${student.grade}`;
  sessionBanner.classList.remove('hidden');
  signOutBtn.classList.remove('hidden');
  authTabs.classList.add('hidden');
  registerSection.classList.remove('hidden');
  registerForm.classList.add('hidden');
  signInForm.classList.add('hidden');

  if (restoreTimestamp) {
    sessionStartTimestamp = Number(sessionStorage.getItem('sisyphusSessionStart')) || Date.now();
  } else {
    sessionStartTimestamp = Date.now();
    sessionStorage.setItem('sisyphusSessionStart', sessionStartTimestamp);
  }

  sessionStorage.setItem('sisyphusActiveEmail', normalizeEmail(student.email));

  if (rememberMe) {
    storeRememberedLogin(student.email);
  } else {
    clearRememberedLogin();
  }

  logStudentUsage(student, 'sign-in');
  updateRestrictedAccess(student);

  if (sessionTimer) {
    clearInterval(sessionTimer);
  }
  updateSessionTimer();
  sessionTimer = setInterval(updateSessionTimer, 1000);
}

function clearActiveStudent() {
  activeStudent = null;
  sessionStartTimestamp = null;
  sessionBanner.classList.add('hidden');
  signOutBtn.classList.add('hidden');
  quizSection.classList.add('hidden');
  registerSection.classList.remove('hidden');
  authTabs.classList.remove('hidden');
  registerForm.classList.remove('hidden');
  signInForm.classList.add('hidden');
  restrictedExportRow.classList.add('hidden');
  restrictedSchedulerDesign.classList.add('hidden');
  takeQuizBtn.classList.add('hidden');
  sessionDurationDisplay.textContent = 'Session time: 0:00';
  studentNameDisplay.textContent = '';
  studentGradeDisplay.textContent = '';
  sessionStorage.removeItem('sisyphusActiveEmail');
  sessionStorage.removeItem('sisyphusSessionStart');
  clearRememberedLogin();
  if (sessionTimer) {
    clearInterval(sessionTimer);
    sessionTimer = null;
  }
}

function tryAutoSignIn() {
  const activeEmail = sessionStorage.getItem('sisyphusActiveEmail');
  const rememberedEmail = localStorage.getItem('sisyphusRememberedEmail');
  const storedStart = sessionStorage.getItem('sisyphusSessionStart');
  const emailToUse = activeEmail || rememberedEmail;
  if (!emailToUse) {
    return;
  }

  const students = getStoredStudents();
  const student = students.find((item) => normalizeEmail(item.email) === emailToUse);
  if (!student) {
    return;
  }

  const restoreTimestamp = Boolean(storedStart);
  setActiveStudent(student, { restoreTimestamp, rememberMe: Boolean(rememberedEmail) });
}

function generateQuestions() {
  questions = [
    createOneStepEquationWordProblem(),
    createEvaluateExpression(),
    createWriteExpressionWordProblem(),
    createRatioProblemWordProblem(),
  ];
  shuffleArray(questions);
  renderQuestions();
}

function renderQuestions() {
  questionList.innerHTML = '';
  questions.forEach((question, index) => {
    const item = document.createElement('div');
    item.className = 'question-item';
    item.innerHTML = `
      <label for="answer-${index}">Question ${index + 1}</label>
      <div class="prompt">${question.prompt}</div>
      <input id="answer-${index}" name="answer-${index}" autocomplete="off" required />
      <div class="answer-hint hidden" id="hint-${index}"></div>
    `;
    questionList.appendChild(item);
  });
}

function showFeedback(message, isSuccess = false) {
  quizFeedback.textContent = message;
  quizFeedback.style.background = isSuccess
    ? 'rgba(61, 211, 193, 0.16)'
    : 'rgba(255, 111, 97, 0.16)';
  quizFeedback.style.borderColor = isSuccess
    ? 'rgba(61, 211, 193, 0.26)'
    : 'rgba(255, 111, 97, 0.26)';
}

function endGame() {
  gameActive = false;
  cancelAnimationFrame(animationFrameId);
  clearInterval(gameTimer);
  showFeedback('Time is up! A new quiz is ready. Try the next round.', false);
  quizSection.scrollIntoView({ behavior: 'smooth' });
  gameSection.classList.add('hidden');
  quizSection.classList.remove('hidden');
  remainingSeconds = gameDuration;
  timerDisplay.textContent = formatTimer(remainingSeconds);
  scoreDisplay.textContent = `Score: ${currentScore}`;
  generateQuestions();
}

function formatTimer(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function startGame() {
  gameSection.classList.remove('hidden');
  quizSection.classList.add('hidden');
  gameActive = true;
  currentScore = 0;
  scoreDisplay.textContent = `Score: ${currentScore}`;
  remainingSeconds = gameDuration;
  timerDisplay.textContent = formatTimer(remainingSeconds);
  initGameObjects();
  gameTimer = setInterval(() => {
    remainingSeconds -= 1;
    timerDisplay.textContent = formatTimer(remainingSeconds);
    if (remainingSeconds <= 0) {
      endGame();
    }
  }, 1000);
  animationFrameId = requestAnimationFrame(drawGame);
}

function initGameObjects() {
  const width = canvas.width;
  const height = canvas.height;
  playerPaddle = {
    x: 20,
    y: height / 2 - 50,
    width: 16,
    height: 100,
    speed: 8,
  };
  aiPaddle = {
    x: width - 36,
    y: height / 2 - 50,
    width: 16,
    height: 100,
    speed: 4,
  };
  ball = {
    x: width / 2,
    y: height / 2,
    radius: 10,
    speedX: 5,
    speedY: 3,
  };
}

function drawRoundedRect(x, y, w, h, radius, fill) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // court lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 24);
  ctx.lineTo(canvas.width / 2, canvas.height - 24);
  ctx.stroke();
  ctx.setLineDash([]);

  drawRoundedRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height, 12, '#3dd3c1');
  drawRoundedRect(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height, 12, '#ff6f61');

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ball.x += ball.speedX;
  ball.y += ball.speedY;

  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
    ball.speedY = -ball.speedY;
  }

  if (
    ball.x - ball.radius <= playerPaddle.x + playerPaddle.width &&
    ball.y >= playerPaddle.y &&
    ball.y <= playerPaddle.y + playerPaddle.height
  ) {
    ball.speedX = Math.abs(ball.speedX);
    currentScore += 1;
    scoreDisplay.textContent = `Score: ${currentScore}`;
  }

  if (
    ball.x + ball.radius >= aiPaddle.x &&
    ball.y >= aiPaddle.y &&
    ball.y <= aiPaddle.y + aiPaddle.height
  ) {
    ball.speedX = -Math.abs(ball.speedX);
  }

  if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = ball.speedX > 0 ? 5 : -5;
    ball.speedY = 3;
  }

  const paddleCenter = aiPaddle.y + aiPaddle.height / 2;
  if (paddleCenter < ball.y - 10) {
    aiPaddle.y += aiPaddle.speed;
  } else if (paddleCenter > ball.y + 10) {
    aiPaddle.y -= aiPaddle.speed;
  }

  aiPaddle.y = Math.max(0, Math.min(canvas.height - aiPaddle.height, aiPaddle.y));

  if (gameActive) {
    animationFrameId = requestAnimationFrame(drawGame);
  }
}

function setPaddlePosition(clientY) {
  const rect = canvas.getBoundingClientRect();
  const relativeY = clientY - rect.top;
  playerPaddle.y = Math.max(0, Math.min(canvas.height - playerPaddle.height, (relativeY / rect.height) * canvas.height - playerPaddle.height / 2));
}

canvas.addEventListener('mousemove', (event) => {
  if (!gameActive) return;
  setPaddlePosition(event.clientY);
});

canvas.addEventListener('touchmove', (event) => {
  if (!gameActive) return;
  setPaddlePosition(event.touches[0].clientY);
  event.preventDefault();
}, { passive: false });

quizForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const answers = questions.map((_, index) => document.getElementById(`answer-${index}`).value.trim());
  let correctCount = 0;
  answers.forEach((value, index) => {
    const hintElement = document.getElementById(`hint-${index}`);
    const isCorrect = questions[index].validate(value);
    if (isCorrect) {
      correctCount += 1;
      hintElement.classList.add('hidden');
      hintElement.textContent = '';
    } else {
      hintElement.classList.remove('hidden');
      hintElement.textContent = `Correct answer: ${questions[index].answer}`;
    }
  });
  const percent = Math.round((correctCount / questions.length) * 100);
  if (percent >= 75) {
    showFeedback(`Great job! You got ${correctCount}/4 correct. Pong time starts now!`, true);
    startGame();
  } else {
    showFeedback(`You got ${correctCount}/4 correct (${percent}%). Try again to earn your pong break.`, false);
  }
});

registerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  registerFeedback.classList.add('hidden');
  signInFeedback.classList.add('hidden');

  const firstName = document.getElementById('first-name').value.trim();
  const lastName = document.getElementById('last-name').value.trim();
  const grade = document.getElementById('grade').value.trim();
  const email = normalizeEmail(document.getElementById('register-email').value);

  if (!firstName || !lastName || !grade || !email) {
    showAuthFeedback(registerFeedback, 'All fields are required to register.', false);
    return;
  }

  const students = getStoredStudents();
  if (students.some((item) => normalizeEmail(item.email) === email)) {
    showAuthFeedback(registerFeedback, 'This email is already registered. Please sign in instead.', false);
    return;
  }

  const newStudent = { firstName, lastName, grade, email };
  students.push(newStudent);
  saveStoredStudents(students);
  showAuthFeedback(registerFeedback, 'Registration complete. You are now signed in.', true);
  setActiveStudent(newStudent, { rememberMe: shouldRememberUser() });
});

signInForm.addEventListener('submit', (event) => {
  event.preventDefault();
  signInFeedback.classList.add('hidden');
  registerFeedback.classList.add('hidden');

  const email = normalizeEmail(document.getElementById('signin-email').value);
  const lastName = document.getElementById('signin-last-name').value.trim();

  if (!email || !lastName) {
    showAuthFeedback(signInFeedback, 'Please provide both email and last name to sign in.', false);
    return;
  }

  const students = getStoredStudents();
  const student = students.find((item) => normalizeEmail(item.email) === email);
  if (!student) {
    showAuthFeedback(signInFeedback, 'No registered student found for that email.', false);
    return;
  }

  if (student.lastName.toLowerCase() !== lastName.toLowerCase()) {
    showAuthFeedback(signInFeedback, 'Student verification failed. Please check your last name.', false);
    return;
  }

  showAuthFeedback(signInFeedback, 'Sign in successful. Welcome back!', true);
  setActiveStudent(student, { restoreTimestamp: true, rememberMe: shouldRememberUser() });
});

registerTab.addEventListener('click', () => toggleAuthTab('register'));
signInTab.addEventListener('click', () => toggleAuthTab('signin'));
exportDataBtn.addEventListener('click', exportStudentsToCsv);
exportUsageBtn.addEventListener('click', exportUsageHistoryToCsv);
takeQuizBtn.addEventListener('click', () => {
  logStudentUsage(activeStudent, 'quiz-start');
  quizSection.classList.remove('hidden');
  quizSection.scrollIntoView({ behavior: 'smooth' });
});

signOutBtn.addEventListener('click', () => {
  clearActiveStudent();
  showFeedback('You have been signed out. Register or sign in to continue.', false);
});

resetBtn.addEventListener('click', () => {
  generateQuestions();
  showFeedback('A fresh set of questions is ready. Give it your best!', false);
});

window.addEventListener('load', () => {
  tryAutoSignIn();
  generateQuestions();
  if (!activeStudent) {
    showFeedback('Register or sign in first, then answer 4 questions to earn your pong break.', false);
  } else {
    showFeedback('You are signed in. Answer 4 questions correctly to earn your pong break!', false);
  }
});
