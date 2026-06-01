import * as sound from './sound.js';
import * as ex from './export.js';
import * as auth from './auth.js';
import quiz from './quiz.js';
import { createGameController } from './game.js';

// DOM refs
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
const gameModePicker = document.getElementById('game-mode-picker');
const normalPongBtn = document.getElementById('normal-pong-btn');
const ghostPongBtn = document.getElementById('ghost-pong-btn');
const gameTitle = document.getElementById('game-title');
const gameDesc = document.getElementById('game-desc');
const topicPicker = document.getElementById('topic-picker');
const topicAlgebraBtn = document.getElementById('topic-algebra-btn');
const topicDecimalsBtn = document.getElementById('topic-decimals-btn');
const topicFractionsBtn = document.getElementById('topic-fractions-btn');
const quizDescription = document.getElementById('quiz-description');
const canvas = document.getElementById('pong-canvas');

// State
let activeStudent = null;
let sessionTimer = null;
let sessionStartTimestamp = null;
let currentTopic = null;
let questions = [];

// Game controller
const gameCtrl = createGameController({ canvas, scoreDisplay, timerDisplay, onEnd: () => {
  // show quiz UI when game ends
  quizSection.classList.remove('hidden');
  gameSection.classList.add('hidden');
  quizSection.scrollIntoView({ behavior: 'smooth' });
  showFeedback('Time is up! A new quiz is ready. Try the next round.', false);
  questions = generateQuestions();
  renderQuestions(questions);
} });

function showAuthFeedback(element, message, isSuccess = false) {
  element.textContent = message;
  element.classList.remove('hidden');
  element.style.background = isSuccess ? 'rgba(61, 211, 193, 0.16)' : 'rgba(255, 111, 97, 0.16)';
  element.style.borderColor = isSuccess ? 'rgba(61, 211, 193, 0.26)' : 'rgba(255, 111, 97, 0.26)';
}

function showFeedback(message, isSuccess = false) {
  quizFeedback.textContent = message;
  quizFeedback.style.background = isSuccess ? 'rgba(61, 211, 193, 0.16)' : 'rgba(255, 111, 97, 0.16)';
  quizFeedback.style.borderColor = isSuccess ? 'rgba(61, 211, 193, 0.26)' : 'rgba(255, 111, 97, 0.26)';
}

function formatSessionTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${secs}`;
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
  return student && student.lastName.trim().toLowerCase() === 'tyson' && auth.normalizeEmail(student.email) === 'tyson571us@yahoo.com';
}

function updateRestrictedAccess(student) {
  const allowed = isAuthorizedStudent(student);
  restrictedExportRow.classList.toggle('hidden', !allowed);
  restrictedSchedulerDesign.classList.toggle('hidden', !allowed);
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

  sessionStorage.setItem('sisyphusActiveEmail', auth.normalizeEmail(student.email));

  if (rememberMe) {
    localStorage.setItem('sisyphusRememberedEmail', auth.normalizeEmail(student.email));
  } else {
    localStorage.removeItem('sisyphusRememberedEmail');
  }

  topicPicker.classList.remove('hidden');
  auth.logStudentUsage(student, 'sign-in', sessionStartTimestamp);
  updateRestrictedAccess(student);

  if (sessionTimer) clearInterval(sessionTimer);
  updateSessionTimer();
  sessionTimer = setInterval(updateSessionTimer, 1000);
}

function clearActiveStudent() {
  activeStudent = null;
  currentTopic = null;
  sessionStartTimestamp = null;
  sessionBanner.classList.add('hidden');
  signOutBtn.classList.add('hidden');
  topicPicker.classList.add('hidden');
  gameModePicker.classList.add('hidden');
  topicAlgebraBtn.classList.remove('selected');
  topicDecimalsBtn.classList.remove('selected');
  topicFractionsBtn.classList.remove('selected');
  quizSection.classList.add('hidden');
  gameSection.classList.add('hidden');
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
  localStorage.removeItem('sisyphusRememberedEmail');
  if (sessionTimer) { clearInterval(sessionTimer); sessionTimer = null; }
}

function tryAutoSignIn() {
  const activeEmail = sessionStorage.getItem('sisyphusActiveEmail');
  const rememberedEmail = localStorage.getItem('sisyphusRememberedEmail');
  const storedStart = sessionStorage.getItem('sisyphusSessionStart');
  const emailToUse = activeEmail || rememberedEmail;
  if (!emailToUse) return;

  const students = ex.getStoredStudents();
  const student = students.find((item) => auth.normalizeEmail(item.email) === emailToUse);
  if (!student) return;

  const restoreTimestamp = Boolean(storedStart);
  setActiveStudent(student, { restoreTimestamp, rememberMe: Boolean(rememberedEmail) });
}

// Quiz rendering and generation
function renderQuestions(questionsToRender) {
  questionList.innerHTML = '';
  questionsToRender.forEach((question, index) => {
    const item = document.createElement('div');
    item.className = 'question-item';
    item.innerHTML = `\n      <label for="answer-${index}">Question ${index + 1}</label>\n      <div class="prompt">${question.prompt}</div>\n      <input id="answer-${index}" name="answer-${index}" autocomplete="off" required />\n      <div class="answer-hint hidden" id="hint-${index}"></div>\n    `;
    questionList.appendChild(item);
  });
}

function generateQuestions() {
  questions = quiz.generateQuestions(currentTopic);
  return questions;
}

function startTopic(topic) {
  currentTopic = topic;
  topicAlgebraBtn.classList.toggle('selected', topic === 'algebra');
  topicDecimalsBtn.classList.toggle('selected', topic === 'decimals');
  topicFractionsBtn.classList.toggle('selected', topic === 'fractions');
  quizDescription.textContent = topic === 'decimals'
    ? 'Adding, subtracting, multiplying, and dividing decimals.'
    : topic === 'fractions'
      ? 'Multiply and divide proper fractions with word problems.'
      : 'One-step equations, expressions, word problems, and ratios.';
  auth.logStudentUsage(activeStudent, `quiz-start-${topic}`, sessionStartTimestamp);
  questions = generateQuestions();
  renderQuestions(questions);
  quizSection.classList.remove('hidden');
  quizSection.scrollIntoView({ behavior: 'smooth' });
}

quizForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const answers = questions.map((_, index) => document.getElementById(`answer-${index}`).value.trim());
  let correctCount = 0;
  answers.forEach((value, index) => {
    const hintElement = document.getElementById(`hint-${index}`);
    const isCorrect = questions[index].validate(value);
    const soundDelay = index * 0.18;
    if (isCorrect) {
      correctCount += 1;
      sound.sndCorrect(soundDelay);
      hintElement.classList.add('hidden');
      hintElement.textContent = '';
    } else {
      sound.sndWrong(soundDelay);
      hintElement.classList.remove('hidden');
      const { answer, khanLink, topicLabel } = questions[index];
      const topicSentence = topicLabel ? `This was ${topicLabel}. ` : '';
      const khanSentence = khanLink ? ` You can get a refresher on it at <a class="khan-link" href="${khanLink}" target="_blank" rel="noopener noreferrer">Khan Academy ↗</a>.` : '';
      hintElement.innerHTML = `${topicSentence}Correct answer: <strong>${String(answer)}</strong>.${khanSentence}`;
    }
  });
  const percent = Math.round((correctCount / questions.length) * 100);
  const summaryDelay = questions.length * 0.18 + 0.25;
  if (percent >= 75) {
    setTimeout(sound.sndQuizPassed, summaryDelay * 1000);
    showFeedback(`Great job! You got ${correctCount}/4 correct. Choose your pong mode below!`, true);
    gameModePicker.classList.remove('hidden');
    gameModePicker.scrollIntoView({ behavior: 'smooth' });
  } else {
    setTimeout(sound.sndQuizFailed, summaryDelay * 1000);
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
  const email = auth.normalizeEmail(document.getElementById('register-email').value);

  if (!firstName || !lastName || !grade || !email) {
    showAuthFeedback(registerFeedback, 'All fields are required to register.', false);
    return;
  }

  const students = ex.getStoredStudents();
  if (students.some((item) => auth.normalizeEmail(item.email) === email)) {
    showAuthFeedback(registerFeedback, 'This email is already registered. Please sign in instead.', false);
    return;
  }

  const newStudent = { firstName, lastName, grade, email };
  students.push(newStudent);
  ex.saveStoredStudents(students);
  showAuthFeedback(registerFeedback, 'Registration complete. You are now signed in.', true);
  setActiveStudent(newStudent, { rememberMe: document.getElementById('remember-me-register').checked });
});

signInForm.addEventListener('submit', (event) => {
  event.preventDefault();
  signInFeedback.classList.add('hidden');
  registerFeedback.classList.add('hidden');

  const email = auth.normalizeEmail(document.getElementById('signin-email').value);
  const lastName = document.getElementById('signin-last-name').value.trim();

  if (!email || !lastName) {
    showAuthFeedback(signInFeedback, 'Please provide both email and last name to sign in.', false);
    return;
  }

  const students = ex.getStoredStudents();
  const student = students.find((item) => auth.normalizeEmail(item.email) === email);
  if (!student) {
    showAuthFeedback(signInFeedback, 'No registered student found for that email.', false);
    return;
  }

  if (student.lastName.toLowerCase() !== lastName.toLowerCase()) {
    showAuthFeedback(signInFeedback, 'Student verification failed. Please check your last name.', false);
    return;
  }

  showAuthFeedback(signInFeedback, 'Sign in successful. Welcome back!', true);
  setActiveStudent(student, { restoreTimestamp: true, rememberMe: document.getElementById('remember-me-signin').checked });
});

topicAlgebraBtn.addEventListener('click', () => startTopic('algebra'));
topicDecimalsBtn.addEventListener('click', () => startTopic('decimals'));
topicFractionsBtn.addEventListener('click', () => startTopic('fractions'));

normalPongBtn.addEventListener('click', () => {
  gameCtrl.startGame('normal');
  gameSection.classList.remove('hidden');
  quizSection.classList.add('hidden');
});
ghostPongBtn.addEventListener('click', () => {
  gameCtrl.startGame('ghost');
  gameSection.classList.remove('hidden');
  quizSection.classList.add('hidden');
});

registerTab.addEventListener('click', () => { registerTab.classList.add('active'); signInTab.classList.remove('active'); registerForm.classList.remove('hidden'); signInForm.classList.add('hidden'); });
signInTab.addEventListener('click', () => { registerTab.classList.remove('active'); signInTab.classList.add('active'); registerForm.classList.add('hidden'); signInForm.classList.remove('hidden'); });

exportDataBtn.addEventListener('click', () => {
  const students = ex.getStoredStudents();
  if (students.length === 0) { showAuthFeedback(registerFeedback, 'No registered students are available to export.', false); return; }
  const blob = ex.createStudentsCsvBlob(students);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = 'student_registry.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  showAuthFeedback(registerFeedback, 'Student registry exported as CSV. You can send it to ttyson@blackstudentfund.org from your email client.', true);
});

exportUsageBtn.addEventListener('click', () => {
  const logs = ex.getUsageLog();
  if (logs.length === 0) { showAuthFeedback(registerFeedback, 'No usage history is available to export yet.', false); return; }
  const blob = ex.createUsageCsvBlob(logs);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = 'usage_history.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  showAuthFeedback(registerFeedback, 'Usage history exported as CSV. You can open it in Excel.', true);
});

takeQuizBtn.addEventListener('click', () => { auth.logStudentUsage(activeStudent, 'quiz-start', sessionStartTimestamp); quizSection.classList.remove('hidden'); quizSection.scrollIntoView({ behavior: 'smooth' }); });

signOutBtn.addEventListener('click', () => { clearActiveStudent(); showFeedback('You have been signed out. Register or sign in to continue.', false); });

resetBtn.addEventListener('click', () => { questions = generateQuestions(); renderQuestions(questions); showFeedback('A fresh set of questions is ready. Give it your best!', false); });

// paddle input -> forward to game controller
canvas.addEventListener('mousemove', (e) => { gameCtrl.setPaddlePosition(e.clientY); });
canvas.addEventListener('touchmove', (e) => { gameCtrl.setPaddlePosition(e.touches[0].clientY); e.preventDefault(); }, { passive: false });

// Theme toggle (session button already in DOM)
(() => {
  const THEME_KEY = 'sisyphusTheme';
  const FEM_CLASS = 'theme-feminine';
  const toggle = document.getElementById('theme-toggle');
  function applyTheme(name) {
    if (name === 'feminine') {
      document.documentElement.classList.add(FEM_CLASS);
      if (toggle) { toggle.textContent = 'Default Theme'; toggle.setAttribute('aria-pressed', 'true'); }
    } else {
      document.documentElement.classList.remove(FEM_CLASS);
      if (toggle) { toggle.textContent = 'Purple Theme'; toggle.setAttribute('aria-pressed', 'false'); }
    }
  }
  if (toggle) toggle.addEventListener('click', () => { const active = document.documentElement.classList.contains(FEM_CLASS); const next = active ? 'default' : 'feminine'; localStorage.setItem(THEME_KEY, next); applyTheme(next); });
  const saved = localStorage.getItem('sisyphusTheme'); applyTheme(saved === 'feminine' ? 'feminine' : 'default');
})();

window.addEventListener('load', () => {
  tryAutoSignIn();
  if (!activeStudent) showFeedback('Register or sign in to begin.', false);
  else showFeedback('Pick a topic above to start your quiz!', false);
});

export { generateQuestions, renderQuestions };
