const quizScreen = document.getElementById('quiz-screen');
const gameChoiceScreen = document.getElementById('game-choice-screen');
const gameScreen = document.getElementById('game-screen');
const questionsContainer = document.getElementById('questions');
const submitBtn = document.getElementById('submit-btn');
const feedback = document.getElementById('quiz-feedback');
const gameButtons = document.querySelectorAll('.game-btn');
const gameCanvas = document.getElementById('game-canvas');
const gameTitle = document.getElementById('game-title');
const timerLabel = document.getElementById('timer');
const gameInstructions = document.getElementById('game-instructions');
const ctx = gameCanvas.getContext('2d');

let questions = [];
let gameTimer = null;
let countdownInterval = null;
let currentGame = null;
let lastTime = null;
let animationId = null;
let gameEndTime = null;

function randomNumber(max) {
  return Math.floor(Math.random() * max) + 1;
}

function generateQuestions() {
  questions = [];
  questionsContainer.innerHTML = '';
  for (let i = 0; i < 3; i += 1) {
    const a = randomNumber(12);
    const b = randomNumber(12);
    questions.push({ a, b, answer: a + b });
    const row = document.createElement('div');
    row.className = 'question-row';
    row.innerHTML = `
      <label for="q${i}">${a} + ${b} =</label>
      <input type="number" id="q${i}" name="q${i}" autocomplete="off" />
    `;
    questionsContainer.appendChild(row);
  }
}

function showScreen(screen) {
  quizScreen.classList.add('hidden');
  gameChoiceScreen.classList.add('hidden');
  gameScreen.classList.add('hidden');
  screen.classList.remove('hidden');
}

function checkAnswers() {
  const inputs = questionsContainer.querySelectorAll('input');
  let correctCount = 0;
  inputs.forEach((input, index) => {
    const value = Number(input.value);
    if (value === questions[index].answer) {
      correctCount += 1;
    }
  });
  return correctCount === questions.length;
}

function startGameSelection() {
  showScreen(gameChoiceScreen);
  feedback.textContent = '';
}

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function stopGame() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  currentGame = null;
  gameEndTime = null;
  showScreen(quizScreen);
  generateQuestions();
}

function startCountdown(durationMs) {
  gameEndTime = Date.now() + durationMs;
  timerLabel.textContent = formatTime(durationMs);
  countdownInterval = setInterval(() => {
    const remaining = gameEndTime - Date.now();
    timerLabel.textContent = formatTime(remaining);
    if (remaining <= 0) {
      stopGame();
    }
  }, 250);
}

function activateGame(gameName) {
  currentGame = gameName;
  lastTime = null;
  showScreen(gameScreen);
  startCountdown(120000);
  if (gameName === 'pong') {
    gameTitle.textContent = 'Pong';
    gameInstructions.textContent = 'Use W/S to move left paddle and Up/Down arrows to move right paddle.';
    initPong();
  } else if (gameName === 'snake') {
    gameTitle.textContent = 'Snake';
    gameInstructions.textContent = 'Use arrow keys to move the snake. Eat food and avoid walls.';
    initSnake();
  }
}

submitBtn.addEventListener('click', () => {
  if (checkAnswers()) {
    startGameSelection();
  } else {
    feedback.textContent = 'Try again: all three answers must be correct to play.';
  }
});

gameButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activateGame(button.dataset.game);
  });
});

// Pong game state
const pongState = {
  leftY: 170,
  rightY: 170,
  leftSpeed: 0,
  rightSpeed: 0,
  ballX: 300,
  ballY: 200,
  ballVelX: 4,
  ballVelY: 3,
  paddleHeight: 80,
  paddleWidth: 12,
  ballSize: 12,
  speed: 5,
};

function initPong() {
  Object.assign(pongState, {
    leftY: 170,
    rightY: 170,
    leftSpeed: 0,
    rightSpeed: 0,
    ballX: 300,
    ballY: 200,
    ballVelX: 4,
    ballVelY: 3,
  });
  window.addEventListener('keydown', pongKeyDown);
  window.addEventListener('keyup', pongKeyUp);
  animationId = requestAnimationFrame(runGameLoop);
}

function pongKeyDown(event) {
  if (currentGame !== 'pong') return;
  if (event.key === 'w' || event.key === 'W') {
    pongState.leftSpeed = -pongState.speed;
  }
  if (event.key === 's' || event.key === 'S') {
    pongState.leftSpeed = pongState.speed;
  }
  if (event.key === 'ArrowUp') {
    pongState.rightSpeed = -pongState.speed;
  }
  if (event.key === 'ArrowDown') {
    pongState.rightSpeed = pongState.speed;
  }
}

function pongKeyUp(event) {
  if (currentGame !== 'pong') return;
  if (event.key === 'w' || event.key === 'W' || event.key === 's' || event.key === 'S') {
    pongState.leftSpeed = 0;
  }
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    pongState.rightSpeed = 0;
  }
}

function drawPong() {
  ctx.fillStyle = '#0b1625';
  ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
  ctx.fillStyle = '#7be5ff';
  ctx.fillRect(20, pongState.leftY, pongState.paddleWidth, pongState.paddleHeight);
  ctx.fillRect(gameCanvas.width - 32, pongState.rightY, pongState.paddleWidth, pongState.paddleHeight);
  ctx.fillRect(pongState.ballX, pongState.ballY, pongState.ballSize, pongState.ballSize);
  ctx.strokeStyle = '#2f6d8c';
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(gameCanvas.width / 2, 0);
  ctx.lineTo(gameCanvas.width / 2, gameCanvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function updatePong() {
  pongState.leftY += pongState.leftSpeed;
  pongState.rightY += pongState.rightSpeed;
  pongState.leftY = Math.max(0, Math.min(gameCanvas.height - pongState.paddleHeight, pongState.leftY));
  pongState.rightY = Math.max(0, Math.min(gameCanvas.height - pongState.paddleHeight, pongState.rightY));
  pongState.ballX += pongState.ballVelX;
  pongState.ballY += pongState.ballVelY;

  if (pongState.ballY <= 0 || pongState.ballY + pongState.ballSize >= gameCanvas.height) {
    pongState.ballVelY *= -1;
  }

  const ballCenter = pongState.ballY + pongState.ballSize / 2;
  if (
    pongState.ballX <= 20 + pongState.paddleWidth &&
    ballCenter >= pongState.leftY &&
    ballCenter <= pongState.leftY + pongState.paddleHeight
  ) {
    pongState.ballVelX *= -1;
    pongState.ballX = 20 + pongState.paddleWidth;
  }
  if (
    pongState.ballX + pongState.ballSize >= gameCanvas.width - 32 &&
    ballCenter >= pongState.rightY &&
    ballCenter <= pongState.rightY + pongState.paddleHeight
  ) {
    pongState.ballVelX *= -1;
    pongState.ballX = gameCanvas.width - 32 - pongState.ballSize;
  }
  if (pongState.ballX < 0 || pongState.ballX > gameCanvas.width) {
    pongState.ballX = gameCanvas.width / 2;
    pongState.ballY = gameCanvas.height / 2;
    pongState.ballVelX *= -1;
  }
}

// Snake game state
const snakeState = {
  gridSize: 20,
  cellCountX: 30,
  cellCountY: 20,
  snake: [{ x: 14, y: 10 }],
  direction: { x: 1, y: 0 },
  nextDirection: { x: 1, y: 0 },
  food: { x: 8, y: 10 },
  speed: 8,
  frameCounter: 0,
  alive: true,
};

function initSnake() {
  snakeState.snake = [{ x: 14, y: 10 }];
  snakeState.direction = { x: 1, y: 0 };
  snakeState.nextDirection = { x: 1, y: 0 };
  snakeState.food = { x: randomNumber(snakeState.cellCountX) - 1, y: randomNumber(snakeState.cellCountY) - 1 };
  snakeState.frameCounter = 0;
  snakeState.alive = true;
  window.addEventListener('keydown', snakeKeyDown);
  animationId = requestAnimationFrame(runGameLoop);
}

function snakeKeyDown(event) {
  if (currentGame !== 'snake') return;
  const dir = snakeState.direction;
  if (event.key === 'ArrowUp' && dir.y === 0) {
    snakeState.nextDirection = { x: 0, y: -1 };
  }
  if (event.key === 'ArrowDown' && dir.y === 0) {
    snakeState.nextDirection = { x: 0, y: 1 };
  }
  if (event.key === 'ArrowLeft' && dir.x === 0) {
    snakeState.nextDirection = { x: -1, y: 0 };
  }
  if (event.key === 'ArrowRight' && dir.x === 0) {
    snakeState.nextDirection = { x: 1, y: 0 };
  }
}

function updateSnake() {
  snakeState.frameCounter += 1;
  if (snakeState.frameCounter < 60 / snakeState.speed) return;
  snakeState.frameCounter = 0;
  snakeState.direction = snakeState.nextDirection;
  const head = { x: snakeState.snake[0].x + snakeState.direction.x, y: snakeState.snake[0].y + snakeState.direction.y };

  if (
    head.x < 0 || head.x >= snakeState.cellCountX ||
    head.y < 0 || head.y >= snakeState.cellCountY ||
    snakeState.snake.some((segment) => segment.x === head.x && segment.y === head.y)
  ) {
    snakeState.alive = false;
    return;
  }

  snakeState.snake.unshift(head);
  if (head.x === snakeState.food.x && head.y === snakeState.food.y) {
    snakeState.food = {
      x: Math.floor(Math.random() * snakeState.cellCountX),
      y: Math.floor(Math.random() * snakeState.cellCountY),
    };
  } else {
    snakeState.snake.pop();
  }
}

function drawSnake() {
  ctx.fillStyle = '#0b1625';
  ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
  ctx.fillStyle = '#47ffa6';
  snakeState.snake.forEach((segment) => {
    ctx.fillRect(segment.x * snakeState.gridSize, segment.y * snakeState.gridSize, snakeState.gridSize - 2, snakeState.gridSize - 2);
  });
  ctx.fillStyle = '#ff6f61';
  ctx.fillRect(snakeState.food.x * snakeState.gridSize, snakeState.food.y * snakeState.gridSize, snakeState.gridSize - 2, snakeState.gridSize - 2);
}

function runGameLoop(timestamp) {
  if (!lastTime) {
    lastTime = timestamp;
  }
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  if (!currentGame) return;
  if (currentGame === 'pong') {
    updatePong();
    drawPong();
  } else if (currentGame === 'snake') {
    updateSnake();
    drawSnake();
    if (!snakeState.alive) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over! Back to the quiz.', gameCanvas.width / 2, gameCanvas.height / 2);
      setTimeout(stopGame, 1500);
      return;
    }
  }

  animationId = requestAnimationFrame(runGameLoop);
}

function initApp() {
  generateQuestions();
  showScreen(quizScreen);
}

initApp();
