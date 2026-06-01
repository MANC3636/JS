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
const quizDescription = document.getElementById('quiz-description');
const canvas = document.getElementById('pong-canvas');
const ctx = canvas.getContext('2d');

let activeStudent = null;
let sessionTimer = null;
let sessionStartTimestamp = null;
let currentTopic = null;

let questions = [];
let gameTimer = null;
let gameDuration = 120;
let remainingSeconds = gameDuration;
let animationFrameId = null;
let ball = null;
let playerPaddle = null;
let aiPaddle = null;
let pairs = [];
let ballVisible = true;
let ballInZone = false;
let gameMode = 'normal';

// ── Sound engine (Web Audio API, no external files) ──────────────────────────
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function beep(freq, duration, type = 'square', vol = 0.15, startOffset = 0) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset);
    gain.gain.setValueAtTime(vol, ctx.currentTime + startOffset);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration);
    osc.start(ctx.currentTime + startOffset);
    osc.stop(ctx.currentTime + startOffset + duration);
  } catch (_) { /* audio not available */ }
}

// Pong sounds
function sndWallHit()    { beep(250, 0.05, 'square', 0.12); }
function sndPlayerHit()  { beep(480, 0.07, 'square', 0.18); }
function sndAiHit()      { beep(320, 0.07, 'square', 0.12); }
function sndGameOver()   {
  beep(392, 0.25, 'sine', 0.18, 0.0);
  beep(330, 0.25, 'sine', 0.18, 0.25);
  beep(262, 0.45, 'sine', 0.18, 0.50);
}

// Quiz sounds
function sndCorrect(delayS = 0) {
  beep(523, 0.12, 'sine', 0.15, delayS);
  beep(659, 0.16, 'sine', 0.15, delayS + 0.12);
}
function sndWrong(delayS = 0) {
  beep(180, 0.22, 'sawtooth', 0.10, delayS);
}
function sndQuizPassed() {
  [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.18, 'sine', 0.20, i * 0.14));
}
function sndQuizFailed() {
  beep(349, 0.20, 'sawtooth', 0.10, 0.0);
  beep(294, 0.30, 'sawtooth', 0.10, 0.22);
}
// ─────────────────────────────────────────────────────────────────────────────
let currentScore = 0;
let gameActive = false;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createOneStepEquationWordProblem() {
  const variations = [];
  const khanLinks = [
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-one-step-add-sub-equations/e/one_step_equations',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-one-step-add-sub-equations/v/adding-and-subtracting-the-same-thing-from-both-sides',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-one-step-add-sub-equations/a/solving-one-step-addition-and-subtraction-equations',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-one-step-add-sub-equations/e/one_step_equations',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-one-step-add-sub-equations/v/adding-and-subtracting-the-same-thing-from-both-sides',
  ];

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
      khanLink: khanLinks[i],
    });
  }

  return { ...variations[randomInt(0, 4)], topicLabel: 'a one-step equation problem' };
}

function createEvaluateExpression() {
  const variations = [];
  const khanLinks = [
    'https://www.khanacademy.org/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/cc-6th-order-of-operations/v/more-complicated-order-of-operations-example',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/x0267d782:more-on-order-of-operations/a/order-of-operations-review',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/x0267d782:more-on-order-of-operations/e/order_of_operations_2',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/cc-6th-order-of-operations/v/more-complicated-order-of-operations-example',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/x0267d782:more-on-order-of-operations/a/order-of-operations-review',
  ];

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
      khanLink: khanLinks[i],
    });
  }

  return { ...variations[randomInt(0, 4)], topicLabel: 'an evaluating expressions problem' };
}

function createWriteExpressionWordProblem() {
  const variations = [];
  const khanLinks = [
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-alg-expression-word-problems/v/writing-basic-expressions-from-word-problems-examples',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-alg-expression-word-problems/e/writing-expressions-with-variables-word-problems',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-alg-expression-word-problems/a/writing-algebraic-expressions-in-word-problems',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-alg-expression-word-problems/v/writing-basic-expressions-from-word-problems-examples',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-alg-expression-word-problems/e/writing-expressions-with-variables-word-problems',
  ];

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
      validate: (input) => {
        const cleaned = input.replace(/\s+/g, '');
        return cleaned === `${num}*${value}` || cleaned === `${value}*${num}`;
      },
      khanLink: khanLinks[i],
    });
  }

  return { ...variations[randomInt(0, 4)], topicLabel: 'a writing expressions problem' };
}

function createRatioProblemWordProblem() {
  const variations = [];
  const khanLinks = [
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-equivalent-ratios/e/ratio_word_problems',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-ratio-word-problems/v/ratio-word-problem-exercise-example-1',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-ratio-word-problems/e/part-part-whole-ratios',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-ratio-word-problems/v/ratio-word-problem-exercise-example-1',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-equivalent-ratios/e/ratio_word_problems',
  ];

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
      khanLink: khanLinks[i],
    });
  }

  return { ...variations[randomInt(0, 4)], topicLabel: 'a ratio word problem' };
}

function createDecimalAdditionProblem() {
  const variations = [];
  const khanLinks = [
    'https://www.khanacademy.org/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/imp-adding-decimals/v/introduction-to-adding-decimals-tenths',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/imp-adding-decimals/v/adding-decimals-with-ones-and-tenths-parts',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/imp-adding-decimals/e/adding-decimals-without-the-standard-algorithm-3',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/imp-adding-decimals/v/introduction-to-adding-decimals-tenths',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/imp-adding-decimals/e/adding-decimals-without-the-standard-algorithm-3',
  ];

  for (let i = 0; i < 5; i += 1) {
    const a = randomInt(11, 89) / 10;
    const b = randomInt(11, 89) / 10;
    const answer = parseFloat((a + b).toFixed(1));

    const prompts = [
      `Maya jogged ${a} miles in the morning and ${b} miles after school. How many miles did she jog in all?`,
      `A bag weighs ${a} kg and another weighs ${b} kg. What is their combined weight?`,
      `One piece of wood is ${a} meters long and another is ${b} meters. What is the total length?`,
      `Carlos spent $${a} on lunch and $${b} on a snack. How much did he spend altogether?`,
      `A fish tank holds ${a} liters and a pitcher holds ${b} liters. How many liters of water is that in total?`,
    ];

    variations.push({
      prompt: prompts[i],
      answer,
      validate: (value) => Math.abs(Number(value) - answer) < 0.001,
      khanLink: khanLinks[i],
    });
  }

  return { ...variations[randomInt(0, 4)], topicLabel: 'a decimal addition problem' };
}

function createDecimalSubtractionProblem() {
  const variations = [];
  const khanLinks = [
    'https://www.khanacademy.org/math/cc-fifth-grade-math/subtract-decimals/imp-subtracting-decimals/v/strategies-for-subtracting-basic-decimals',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/subtract-decimals/imp-subtracting-decimals/v/strategies-for-subtracting-more-complex-decimals-with-tenths',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/subtract-decimals/imp-subtracting-decimals/e/subtracting-decimals-without-the-standard-algorithm-2',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/subtract-decimals/imp-subtracting-decimals/v/strategies-for-subtracting-basic-decimals',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/subtract-decimals/imp-subtracting-decimals/e/subtracting-decimals-without-the-standard-algorithm-2',
  ];

  for (let i = 0; i < 5; i += 1) {
    const b = randomInt(11, 59) / 10;
    const a = parseFloat((b + randomInt(11, 39) / 10).toFixed(1));
    const answer = parseFloat((a - b).toFixed(1));

    const prompts = [
      `Mia had $${a} and spent $${b}. How much money does she have left?`,
      `A rope was ${a} meters long. After cutting off ${b} meters, how much rope remains?`,
      `The temperature dropped from ${a}°F to ${b}°F. By how many degrees did it fall?`,
      `A bottle had ${a} liters of juice. After pouring out ${b} liters, how much is left?`,
      `A bag of rice weighed ${a} kg. After using ${b} kg in a recipe, what is the remaining weight?`,
    ];

    variations.push({
      prompt: prompts[i],
      answer,
      validate: (value) => Math.abs(Number(value) - answer) < 0.001,
      khanLink: khanLinks[i],
    });
  }

  return { ...variations[randomInt(0, 4)], topicLabel: 'a decimal subtraction problem' };
}

function createDecimalMultiplicationProblem() {
  const variations = [];
  const khanLinks = [
    'https://www.khanacademy.org/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-and-whole-numbers/v/strategies-for-multiplying-decimals-and-whole-numbers',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-and-whole-numbers/e/multiply-whole-numbers-and-decimals',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-and-whole-numbers/v/multiplying-decimals-and-whole-numbers-with-visuals',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-and-whole-numbers/e/multiply-whole-numbers-and-decimals',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-and-whole-numbers/v/strategies-for-multiplying-decimals-and-whole-numbers',
  ];

  for (let i = 0; i < 5; i += 1) {
    const factor = randomInt(12, 45) / 10;
    const multiplier = randomInt(2, 8);
    const answer = parseFloat((factor * multiplier).toFixed(1));

    const prompts = [
      `Each book costs $${factor}. What is the total cost of ${multiplier} books?`,
      `A car travels ${factor} miles per hour. How far does it travel in ${multiplier} hours?`,
      `Jordan earns $${factor} per hour. How much does he earn working ${multiplier} hours?`,
      `Each bag of apples weighs ${factor} pounds. What is the total weight of ${multiplier} bags?`,
      `A single tile is ${factor} meters wide. How wide are ${multiplier} tiles placed side by side?`,
    ];

    variations.push({
      prompt: prompts[i],
      answer,
      validate: (value) => Math.abs(Number(value) - answer) < 0.01,
      khanLink: khanLinks[i],
    });
  }

  return { ...variations[randomInt(0, 4)], topicLabel: 'a decimal multiplication problem' };
}

function createDecimalDivisionProblem() {
  const variations = [];
  const khanLinks = [
    'https://www.khanacademy.org/math/cc-fifth-grade-math/divide-decimals/divide-whole-numbers-to-get-a-decimal-quotient/v/divide-whole-numbers-with-decimal-quotients',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/divide-decimals/imp-dividing-decimals/v/visually-dividing-decimal-by-whole-number',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/divide-decimals/imp-dividing-decimals/e/dividing-decimals-without-the-standard-algorithm-3',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/divide-decimals/divide-whole-numbers-to-get-a-decimal-quotient/v/divide-whole-numbers-with-decimal-quotients',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/divide-decimals/imp-dividing-decimals/v/visually-dividing-decimal-by-whole-number',
  ];

  for (let i = 0; i < 5; i += 1) {
    const answer = randomInt(11, 39) / 10;
    const divisor = randomInt(2, 6);
    const dividend = parseFloat((answer * divisor).toFixed(1));

    const prompts = [
      `${divisor} friends share $${dividend} equally. How much does each person get?`,
      `A ribbon ${dividend} meters long is cut into ${divisor} equal pieces. How long is each piece?`,
      `A car used ${dividend} liters of gas over ${divisor} days. What was the average daily usage in liters?`,
      `${dividend} pounds of trail mix is divided equally into ${divisor} bags. How many pounds per bag?`,
      `A pipe ${dividend} meters long is cut into ${divisor} equal sections. How long is each section?`,
    ];

    variations.push({
      prompt: prompts[i],
      answer,
      validate: (value) => Math.abs(Number(value) - answer) < 0.01,
      khanLink: khanLinks[i],
    });
  }

  return { ...variations[randomInt(0, 4)], topicLabel: 'a decimal division problem' };
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

  topicPicker.classList.remove('hidden');
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
  currentTopic = null;
  sessionStartTimestamp = null;
  sessionBanner.classList.add('hidden');
  signOutBtn.classList.add('hidden');
  topicPicker.classList.add('hidden');
  gameModePicker.classList.add('hidden');
  topicAlgebraBtn.classList.remove('selected');
  topicDecimalsBtn.classList.remove('selected');
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
  if (currentTopic === 'decimals') {
    questions = [
      createDecimalAdditionProblem(),
      createDecimalSubtractionProblem(),
      createDecimalMultiplicationProblem(),
      createDecimalDivisionProblem(),
    ];
  } else {
    questions = [
      createOneStepEquationWordProblem(),
      createEvaluateExpression(),
      createWriteExpressionWordProblem(),
      createRatioProblemWordProblem(),
    ];
  }
  shuffleArray(questions);
  renderQuestions();
}

function startTopic(topic) {
  currentTopic = topic;
  topicAlgebraBtn.classList.toggle('selected', topic === 'algebra');
  topicDecimalsBtn.classList.toggle('selected', topic === 'decimals');
  quizDescription.textContent = topic === 'decimals'
    ? 'Adding, subtracting, multiplying, and dividing decimals.'
    : 'One-step equations, expressions, word problems, and ratios.';
  logStudentUsage(activeStudent, `quiz-start-${topic}`);
  generateQuestions();
  quizSection.classList.remove('hidden');
  quizSection.scrollIntoView({ behavior: 'smooth' });
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

function clearTimerWarning() {
  timerDisplay.classList.remove('timer-warning', 'timer-danger');
}

function endGame() {
  gameActive = false;
  cancelAnimationFrame(animationFrameId);
  clearInterval(gameTimer);
  clearTimerWarning();
  gameModePicker.classList.add('hidden');
  sndGameOver();
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

function startGame(mode) {
  gameMode = mode;
  gameModePicker.classList.add('hidden');
  gameTitle.textContent = mode === 'ghost' ? 'Ghost Pong' : 'Pong Break';
  gameDesc.textContent = mode === 'ghost'
    ? 'The ball vanishes past midcourt — track it if you can!'
    : 'Use your finger or mouse to move the paddle up and down.';
  gameSection.classList.remove('hidden');
  quizSection.classList.add('hidden');
  gameActive = true;
  currentScore = 0;
  scoreDisplay.textContent = `Score: ${currentScore}`;
  remainingSeconds = gameDuration;
  clearTimerWarning();
  timerDisplay.textContent = formatTimer(remainingSeconds);
  initGameObjects();
  gameTimer = setInterval(() => {
    remainingSeconds -= 1;
    timerDisplay.textContent = formatTimer(remainingSeconds);
    if (remainingSeconds <= 15) {
      timerDisplay.classList.remove('timer-warning');
      timerDisplay.classList.add('timer-danger');
    } else if (remainingSeconds <= 30) {
      timerDisplay.classList.add('timer-warning');
    }
    if (remainingSeconds <= 0) {
      endGame();
    }
  }, 1000);
  animationFrameId = requestAnimationFrame(drawGame);
}

function initGameObjects() {
  ballVisible = true;
  ballInZone = false;
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

  if (remainingSeconds <= 15) {
    if (Math.floor(Date.now() / 250) % 2 === 0) {
      ctx.strokeStyle = 'rgba(255, 68, 68, 0.85)';
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
    }
  } else if (remainingSeconds <= 30) {
    if (Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.75)';
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
    }
  }

  drawRoundedRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height, 12, '#3dd3c1');
  drawRoundedRect(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height, 12, '#ff6f61');

  if (ballVisible) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  ball.x += ball.speedX;
  ball.y += ball.speedY;

  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
    ball.speedY = -ball.speedY;
    sndWallHit();
  }

  if (
    ball.x - ball.radius <= playerPaddle.x + playerPaddle.width &&
    ball.y >= playerPaddle.y &&
    ball.y <= playerPaddle.y + playerPaddle.height
  ) {
    ball.speedX = Math.abs(ball.speedX);
    ballInZone = false;
    ballVisible = true;
    sndPlayerHit();
    currentScore += 1;
    scoreDisplay.textContent = `Score: ${currentScore}`;
  }

  if (
    ball.x + ball.radius >= aiPaddle.x &&
    ball.y >= aiPaddle.y &&
    ball.y <= aiPaddle.y + aiPaddle.height
  ) {
    ball.speedX = -Math.abs(ball.speedX);
    sndAiHit();
  }

  if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = ball.speedX > 0 ? 5 : -5;
    ball.speedY = 3;
    ballVisible = true;
    ballInZone = false;
  }

  if (gameMode === 'ghost') {
    if (ball.x < 300 && !ballInZone) {
      ballInZone = true;
      ballVisible = Math.random() > 0.5;
    } else if (ball.x >= 300 && ballInZone) {
      ballInZone = false;
      ballVisible = true;
    }
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
    const soundDelay = index * 0.18;
    if (isCorrect) {
      correctCount += 1;
      sndCorrect(soundDelay);
      hintElement.classList.add('hidden');
      hintElement.textContent = '';
    } else {
      sndWrong(soundDelay);
      hintElement.classList.remove('hidden');
      const { answer, khanLink, topicLabel } = questions[index];
      const topicSentence = topicLabel ? `This was ${topicLabel}. ` : '';
      const khanSentence = khanLink
        ? ` You can get a refresher on it at <a class="khan-link" href="${khanLink}" target="_blank" rel="noopener noreferrer">Khan Academy ↗</a>.`
        : '';
      hintElement.innerHTML = `${topicSentence}Correct answer: <strong>${String(answer)}</strong>.${khanSentence}`;
    }
  });
  const percent = Math.round((correctCount / questions.length) * 100);
  const summaryDelay = questions.length * 0.18 + 0.25;
  if (percent >= 75) {
    setTimeout(sndQuizPassed, summaryDelay * 1000);
    showFeedback(`Great job! You got ${correctCount}/4 correct. Choose your pong mode below!`, true);
    gameModePicker.classList.remove('hidden');
    gameModePicker.scrollIntoView({ behavior: 'smooth' });
  } else {
    setTimeout(sndQuizFailed, summaryDelay * 1000);
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

topicAlgebraBtn.addEventListener('click', () => startTopic('algebra'));
topicDecimalsBtn.addEventListener('click', () => startTopic('decimals'));
normalPongBtn.addEventListener('click', () => startGame('normal'));
ghostPongBtn.addEventListener('click', () => startGame('ghost'));

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
  if (!activeStudent) {
    showFeedback('Register or sign in to begin.', false);
  } else {
    showFeedback('Pick a topic above to start your quiz!', false);
  }
});

// Theme toggle: persist choice in localStorage and apply on load
(function () {
  const THEME_KEY = 'sisyphusTheme';
  const FEM_CLASS = 'theme-feminine';
  const toggle = document.getElementById('theme-toggle');

  function applyTheme(name) {
    if (name === 'feminine') {
      document.documentElement.classList.add(FEM_CLASS);
      if (toggle) {
        toggle.textContent = 'Default Theme';
        toggle.setAttribute('aria-pressed', 'true');
      }
    } else {
      document.documentElement.classList.remove(FEM_CLASS);
      if (toggle) {
        toggle.textContent = 'Purple Theme';
        toggle.setAttribute('aria-pressed', 'false');
      }
    }
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      const active = document.documentElement.classList.contains(FEM_CLASS);
      const next = active ? 'default' : 'feminine';
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }

  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved === 'feminine' ? 'feminine' : 'default');
})();
