const quizForm = document.getElementById('quiz-form');
const questionList = document.getElementById('question-list');
const quizFeedback = document.getElementById('quiz-feedback');
const resetBtn = document.getElementById('reset-btn');
const gameSection = document.getElementById('game-section');
const quizSection = document.getElementById('quiz-section');
const timerDisplay = document.getElementById('game-timer');
const scoreDisplay = document.getElementById('game-score');
const canvas = document.getElementById('pong-canvas');
const ctx = canvas.getContext('2d');

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

function createOneStepEquation() {
  const x = randomInt(1, 12);
  const b = randomInt(1, 12);
  const op = Math.random() < 0.5 ? '+' : '-';
  if (op === '+') {
    return {
      prompt: `Solve: x + ${b} = ${x + b}`,
      answer: x,
      validate: (value) => Number(value) === x,
    };
  }
  return {
    prompt: `Solve: x - ${b} = ${x - b}`,
    answer: x,
    validate: (value) => Number(value) === x,
  };
}

function createEvaluateExpression() {
  const a = randomInt(2, 8);
  const b = randomInt(1, 10);
  const c = randomInt(1, 6);
  const expression = `${a}(${b} + ${c})`;
  const result = a * (b + c);
  return {
    prompt: `Evaluate: ${expression}`,
    answer: result,
    validate: (value) => Number(value) === result,
  };
}

function createWriteExpression() {
  const num = randomInt(2, 8);
  const item = ['candies', 'books', 'stickers', 'marbles'][randomInt(0, 3)];
  const value = randomInt(2, 10);
  return {
    prompt: `Write an expression: ${num} ${item} cost $${value} each. How much for all ${num}?`,
    answer: `${num}*${value}`,
    validate: (value) => {
      const cleaned = value.replace(/\s+/g, '');
      return cleaned === `${num}*${value}` || cleaned === `${value}*${num}`;
    },
  };
}

function createRatioProblem() {
  const a = randomInt(2, 5);
  const b = randomInt(2, 7);
  const scale = randomInt(2, 5);
  return {
    prompt: `If ${a}:${b} = x:${b * scale}, what is x?`,
    answer: a * scale,
    validate: (value) => Number(value) === a * scale,
  };
}

function generateQuestions() {
  questions = [
    createOneStepEquation(),
    createEvaluateExpression(),
    createWriteExpression(),
    createRatioProblem(),
  ];
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

resetBtn.addEventListener('click', () => {
  generateQuestions();
  showFeedback('A fresh set of questions is ready. Give it your best!', false);
});

window.addEventListener('load', () => {
  generateQuestions();
  showFeedback('Answer all 4 questions correctly and get 2 minutes of pong time!', false);
});
