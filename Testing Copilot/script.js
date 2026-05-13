const quizScreen = document.getElementById('quiz-screen');
const gameChoiceScreen = document.getElementById('game-choice-screen');
const gameScreen = document.getElementById('game-screen');
const gradeScreen = document.getElementById('grade-screen');
const questionsContainer = document.getElementById('questions');
const submitBtn = document.getElementById('submit-btn');
const feedback = document.getElementById('quiz-feedback');
const gameButtons = document.querySelectorAll('.game-btn');
const gradeButtons = document.querySelectorAll('.grade-btn');
const gameCanvas = document.getElementById('game-canvas');
const gameTitle = document.getElementById('game-title');
const timerLabel = document.getElementById('timer');
const gameInstructions = document.getElementById('game-instructions');
const successSound = document.getElementById('success-sound');
const failureSound = document.getElementById('failure-sound');
const hitSound = document.getElementById('hit-sound');
const ctx = gameCanvas.getContext('2d');

let questions = [];
let grade = null;
let userGender = 'none';
let userTheme = 'none';
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
  let availableOps;
  let numQuestions;
  if (grade === 1) {
    availableOps = ['+'];
    numQuestions = 3;
  } else if (grade === 2) {
    availableOps = ['+', '-'];
    numQuestions = 3;
  } else if (grade === 3) {
    availableOps = ['+', '-', '*'];
    numQuestions = 5;
  } else if (grade === 4) {
    availableOps = ['+', '-', '*'];
    numQuestions = 5;
  } else {
    availableOps = ['+', '-', '*', '/'];
    numQuestions = 5;
  }

  questions = [];
  questionsContainer.innerHTML = '';
  document.querySelector('#question-bank h2').textContent = `Answer all ${numQuestions} questions`;
  for (let i = 0; i < numQuestions; i += 1) {
    const op = availableOps[Math.floor(Math.random() * availableOps.length)];
    let a, b, answer;
    if (op === '+') {
      a = randomNumber(12);
      b = randomNumber(12);
      answer = a + b;
    } else if (op === '-') {
      a = randomNumber(12) + 12;
      b = randomNumber(12);
      answer = a - b;
    } else if (op === '*') {
      a = randomNumber(10);
      b = randomNumber(10);
      answer = a * b;
    } else if (op === '/') {
      b = randomNumber(10);
      answer = randomNumber(10);
      a = b * answer;
    }
    questions.push({ a, b, op, answer });
    const row = document.createElement('div');
    row.className = 'question-row';
    row.innerHTML = `
      <label for="q${i}">${a} ${op} ${b} =</label>
      <input type="number" id="q${i}" name="q${i}" autocomplete="off" />
    `;
    questionsContainer.appendChild(row);
  }
}

function showScreen(screen) {
  quizScreen.classList.add('hidden');
  gameChoiceScreen.classList.add('hidden');
  gameScreen.classList.add('hidden');
  gradeScreen.classList.add('hidden');
  screen.classList.remove('hidden');
}

function applyThemeToScreens() {
  const useGenderTheme = userTheme === 'gender';
  const isGirl = useGenderTheme && userGender === 'girl';
  const isBoy = useGenderTheme && userGender === 'boy';

  [gradeScreen, quizScreen, gameChoiceScreen, gameScreen].forEach((screen) => {
    screen.classList.toggle('girl-theme', isGirl);
    screen.classList.toggle('boy-theme', isBoy);
  });
}

function setupThemeControls() {
  const genderInputs = document.querySelectorAll('input[name="gender"]');
  const themeInputs = document.querySelectorAll('input[name="theme"]');

  genderInputs.forEach((input) => {
    input.addEventListener('change', () => {
      userGender = input.value;
      applyThemeToScreens();
    });
  });

  themeInputs.forEach((input) => {
    input.addEventListener('change', () => {
      userTheme = input.value;
      applyThemeToScreens();
    });
  });
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
  window.removeEventListener('keydown', pongKeyDown);
  window.removeEventListener('keyup', pongKeyUp);
  window.removeEventListener('keydown', snakeKeyDown);
  window.removeEventListener('keydown', spaceInvaderKeyDown);
  window.removeEventListener('keyup', spaceInvaderKeyUp);
  window.removeEventListener('keydown', flappyKeyDown);
  window.removeEventListener('keydown', pacmanKeyDown);
  currentGame = null;
  gameEndTime = null;
  gameScreen.classList.remove('flash-warning');
  showScreen(gradeScreen);
}

function startCountdown(durationMs) {
  gameEndTime = Date.now() + durationMs;
  timerLabel.textContent = formatTime(durationMs);
  gameScreen.classList.remove('flash-warning');
  countdownInterval = setInterval(() => {
    const remaining = gameEndTime - Date.now();
    timerLabel.textContent = formatTime(remaining);
    if (remaining <= 15000 && remaining > 0) {
      gameScreen.classList.add('flash-warning');
    } else {
      gameScreen.classList.remove('flash-warning');
    }
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
  } else if (gameName === 'space-invader') {
    gameTitle.textContent = 'Space Invader';
    gameInstructions.textContent = 'Use Left/Right to move and Space to shoot the invader.';
    initSpaceInvader();
  } else if (gameName === 'flappy-bird') {
    gameTitle.textContent = 'Flappy Bird';
    gameInstructions.textContent = 'Press Space or ArrowUp to flap and avoid the pipes.';
    initFlappyBird();
  } else if (gameName === 'pacman') {
    gameTitle.textContent = 'Pacman';
    gameInstructions.textContent = 'Use arrow keys to move Pacman, eat all dots, and avoid the chasing enemies.';
    initPacman();
  }
}

submitBtn.addEventListener('click', () => {
  if (checkAnswers()) {
    successSound.currentTime = 0;
    successSound.play();
    startGameSelection();
  } else {
    failureSound.currentTime = 0;
    failureSound.play();
    feedback.textContent = `Try again: all ${questions.length} answers must be correct to play.`;
  }
});

gameButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activateGame(button.dataset.game);
  });
});

gradeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    grade = Number(button.dataset.grade);
    showScreen(quizScreen);
    generateQuestions();
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

const invaderState = {
  shipX: 280,
  shipWidth: 40,
  shipHeight: 16,
  shipSpeed: 6,
  invaderX: 200,
  invaderY: 60,
  invaderWidth: 60,
  invaderHeight: 24,
  invaderDir: 1,
  invaderSpeed: 2,
  bulletX: 0,
  bulletY: 0,
  bulletSpeed: 8,
  bulletActive: false,
  alive: true,
};

const flappyState = {
  x: 150,
  y: 200,
  velY: 0,
  gravity: 0.6,
  flapStrength: -10,
  width: 32,
  height: 24,
  pipes: [],
  pipeGap: 140,
  pipeWidth: 50,
  frameCount: 0,
  alive: true,
};

const pacmanState = {
  x: 300,
  y: 200,
  size: 20,
  speed: 3,
  dirX: 0,
  dirY: 0,
  nextDirX: 0,
  nextDirY: 0,
  dots: [],
  score: 0,
  alive: true,
  gridSize: 20,
  gridWidth: 30,
  gridHeight: 20,
  enemies: [],
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
    hitSound.currentTime = 0;
    hitSound.play();
  }
  if (
    pongState.ballX + pongState.ballSize >= gameCanvas.width - 32 &&
    ballCenter >= pongState.rightY &&
    ballCenter <= pongState.rightY + pongState.paddleHeight
  ) {
    pongState.ballVelX *= -1;
    pongState.ballX = gameCanvas.width - 32 - pongState.ballSize;
    hitSound.currentTime = 0;
    hitSound.play();
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

function initSpaceInvader() {
  Object.assign(invaderState, {
    shipX: gameCanvas.width / 2 - 20,
    bulletActive: false,
    bulletX: 0,
    bulletY: 0,
    invaderX: 200,
    invaderY: 60,
    invaderDir: 1,
    alive: true,
  });
  window.addEventListener('keydown', spaceInvaderKeyDown);
  window.addEventListener('keyup', spaceInvaderKeyUp);
  animationId = requestAnimationFrame(runGameLoop);
}

function spaceInvaderKeyDown(event) {
  if (currentGame !== 'space-invader') return;
  if (event.key === 'ArrowLeft') {
    invaderState.shipX -= invaderState.shipSpeed;
  }
  if (event.key === 'ArrowRight') {
    invaderState.shipX += invaderState.shipSpeed;
  }
  if ((event.key === ' ' || event.code === 'Space') && !invaderState.bulletActive) {
    invaderState.bulletActive = true;
    invaderState.bulletX = invaderState.shipX + invaderState.shipWidth / 2 - 2;
    invaderState.bulletY = gameCanvas.height - invaderState.shipHeight - 10;
  }
}

function spaceInvaderKeyUp(event) {
  if (currentGame !== 'space-invader') return;
}

function updateSpaceInvader() {
  if (!invaderState.alive) return;
  invaderState.shipX = Math.max(0, Math.min(gameCanvas.width - invaderState.shipWidth, invaderState.shipX));
  invaderState.invaderX += invaderState.invaderDir * invaderState.invaderSpeed;
  if (invaderState.invaderX <= 0 || invaderState.invaderX + invaderState.invaderWidth >= gameCanvas.width) {
    invaderState.invaderDir *= -1;
    invaderState.invaderY += 20;
  }

  if (invaderState.bulletActive) {
    invaderState.bulletY -= invaderState.bulletSpeed;
    if (invaderState.bulletY < -10) {
      invaderState.bulletActive = false;
    }
  }

  if (
    invaderState.bulletActive &&
    invaderState.bulletX >= invaderState.invaderX &&
    invaderState.bulletX <= invaderState.invaderX + invaderState.invaderWidth &&
    invaderState.bulletY <= invaderState.invaderY + invaderState.invaderHeight
  ) {
    invaderState.alive = false;
    invaderState.bulletActive = false;
    hitSound.currentTime = 0;
    hitSound.play();
    setTimeout(() => {
      if (currentGame === 'space-invader') stopGame();
    }, 1200);
  }
}

function drawSpaceInvader() {
  ctx.fillStyle = '#01081b';
  ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
  ctx.fillStyle = '#33e0ff';
  ctx.fillRect(invaderState.shipX, gameCanvas.height - invaderState.shipHeight - 10, invaderState.shipWidth, invaderState.shipHeight);
  if (invaderState.alive) {
    ctx.fillStyle = '#ff644d';
    ctx.fillRect(invaderState.invaderX, invaderState.invaderY, invaderState.invaderWidth, invaderState.invaderHeight);
  } else {
    ctx.fillStyle = '#fff';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Invader defeated!', gameCanvas.width / 2, gameCanvas.height / 2);
  }

  if (invaderState.bulletActive) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(invaderState.bulletX, invaderState.bulletY, 4, 12);
  }
}

function initFlappyBird() {
  flappyState.y = gameCanvas.height / 2;
  flappyState.velY = 0;
  flappyState.pipes = [{ x: gameCanvas.width + 50, top: 90, bottom: 90 + flappyState.pipeGap, width: flappyState.pipeWidth }];
  flappyState.frameCount = 0;
  flappyState.alive = true;
  window.addEventListener('keydown', flappyKeyDown);
  animationId = requestAnimationFrame(runGameLoop);
}

function initPacman() {
  Object.assign(pacmanState, {
    x: 300,
    y: 200,
    dirX: 0,
    dirY: 0,
    nextDirX: 0,
    nextDirY: 0,
    dots: [],
    score: 0,
    alive: true,
    enemies: [],
  });
  // Generate dots on grid
  for (let i = 1; i < pacmanState.gridWidth - 1; i++) {
    for (let j = 1; j < pacmanState.gridHeight - 1; j++) {
      if (Math.random() > 0.7) { // 30% chance for dot
        pacmanState.dots.push({
          x: i * pacmanState.gridSize + pacmanState.gridSize / 2,
          y: j * pacmanState.gridSize + pacmanState.gridSize / 2,
        });
      }
    }
  }
  // Initialize enemies
  pacmanState.enemies = [
    { x: 100, y: 100, color: '#ff0000', speed: .5 },
    { x: 500, y: 100, color: '#ff8800', speed: .5 },
    { x: 300, y: 300, color: '#ff0088', speed: .5 },
  ];
  window.addEventListener('keydown', pacmanKeyDown);
  animationId = requestAnimationFrame(runGameLoop);
}

function flappyKeyDown(event) {
  if (currentGame !== 'flappy-bird') return;
  if (event.key === ' ' || event.code === 'Space' || event.key === 'ArrowUp') {
    flappyState.velY = flappyState.flapStrength;
  }
}

function pacmanKeyDown(event) {
  if (currentGame !== 'pacman') return;
  if (event.key === 'ArrowUp') {
    pacmanState.nextDirX = 0;
    pacmanState.nextDirY = -1;
  } else if (event.key === 'ArrowDown') {
    pacmanState.nextDirX = 0;
    pacmanState.nextDirY = 1;
  } else if (event.key === 'ArrowLeft') {
    pacmanState.nextDirX = -1;
    pacmanState.nextDirY = 0;
  } else if (event.key === 'ArrowRight') {
    pacmanState.nextDirX = 1;
    pacmanState.nextDirY = 0;
  }
}

function updateFlappyBird() {
  if (!flappyState.alive) return;
  flappyState.velY += flappyState.gravity;
  flappyState.y += flappyState.velY;
  flappyState.frameCount += 1;

  if (flappyState.frameCount % 90 === 0) {
    const top = 50 + Math.random() * 150;
    flappyState.pipes.push({
      x: gameCanvas.width,
      top,
      bottom: top + flappyState.pipeGap,
      width: flappyState.pipeWidth,
    });
  }

  flappyState.pipes.forEach((pipe) => {
    pipe.x -= 2.5;
  });
  flappyState.pipes = flappyState.pipes.filter((pipe) => pipe.x + pipe.width > 0);

  if (flappyState.y <= 0 || flappyState.y + flappyState.height >= gameCanvas.height) {
    flappyState.alive = false;
  }

  flappyState.pipes.forEach((pipe) => {
    if (
      flappyState.x + flappyState.width > pipe.x &&
      flappyState.x < pipe.x + pipe.width &&
      (flappyState.y < pipe.top || flappyState.y + flappyState.height > pipe.bottom)
    ) {
      flappyState.alive = false;
    }
  });

  if (!flappyState.alive) {
    setTimeout(() => {
      if (currentGame === 'flappy-bird') stopGame();
    }, 1200);
  }
}

function drawFlappyBird() {
  ctx.fillStyle = '#7ec0ee';
  ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
  ctx.fillStyle = '#006400';
  ctx.fillRect(0, gameCanvas.height - 40, gameCanvas.width, 40);

  ctx.fillStyle = '#ffdd57';
  flappyState.pipes.forEach((pipe) => {
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, pipe.width, gameCanvas.height - pipe.bottom);
  });

  ctx.fillStyle = '#ff5252';
  ctx.fillRect(flappyState.x, flappyState.y, flappyState.width, flappyState.height);

  if (!flappyState.alive) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over! Back to the quiz.', gameCanvas.width / 2, gameCanvas.height / 2);
  }
}

function updatePacman() {
  if (!pacmanState.alive) return;

  // Try to change direction
  if (pacmanState.nextDirX !== 0 || pacmanState.nextDirY !== 0) {
    const nextX = pacmanState.x + pacmanState.nextDirX * pacmanState.speed;
    const nextY = pacmanState.y + pacmanState.nextDirY * pacmanState.speed;
    if (nextX >= 0 && nextX + pacmanState.size <= gameCanvas.width &&
        nextY >= 0 && nextY + pacmanState.size <= gameCanvas.height) {
      pacmanState.dirX = pacmanState.nextDirX;
      pacmanState.dirY = pacmanState.nextDirY;
      pacmanState.nextDirX = 0;
      pacmanState.nextDirY = 0;
    }
  }

  // Move Pacman
  pacmanState.x += pacmanState.dirX * pacmanState.speed;
  pacmanState.y += pacmanState.dirY * pacmanState.speed;

  // Keep within bounds
  pacmanState.x = Math.max(0, Math.min(gameCanvas.width - pacmanState.size, pacmanState.x));
  pacmanState.y = Math.max(0, Math.min(gameCanvas.height - pacmanState.size, pacmanState.y));

  // Move enemies towards Pacman
  pacmanState.enemies.forEach((enemy) => {
    const dx = pacmanState.x - enemy.x;
    const dy = pacmanState.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0) {
      enemy.x += (dx / distance) * enemy.speed;
      enemy.y += (dy / distance) * enemy.speed;
    }
  });

  // Check enemy collisions
  pacmanState.enemies.forEach((enemy) => {
    const dx = pacmanState.x + pacmanState.size / 2 - enemy.x;
    const dy = pacmanState.y + pacmanState.size / 2 - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < pacmanState.size / 2 + 10) {
      pacmanState.alive = false;
      setTimeout(() => {
        if (currentGame === 'pacman') stopGame();
      }, 1200);
    }
  });

  // Check dot collisions
  pacmanState.dots = pacmanState.dots.filter((dot) => {
    const dx = pacmanState.x + pacmanState.size / 2 - dot.x;
    const dy = pacmanState.y + pacmanState.size / 2 - dot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < pacmanState.size / 2 + 5) {
      pacmanState.score += 10;
      return false;
    }
    return true;
  });

  // Check if all dots eaten
  if (pacmanState.dots.length === 0) {
    pacmanState.alive = false;
    setTimeout(() => {
      if (currentGame === 'pacman') stopGame();
    }, 1200);
  }
}

function drawPacman() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Draw grid
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  for (let i = 0; i <= pacmanState.gridWidth; i++) {
    ctx.beginPath();
    ctx.moveTo(i * pacmanState.gridSize, 0);
    ctx.lineTo(i * pacmanState.gridSize, gameCanvas.height);
    ctx.stroke();
  }
  for (let j = 0; j <= pacmanState.gridHeight; j++) {
    ctx.beginPath();
    ctx.moveTo(0, j * pacmanState.gridSize);
    ctx.lineTo(gameCanvas.width, j * pacmanState.gridSize);
    ctx.stroke();
  }

  // Draw dots
  ctx.fillStyle = '#fff';
  pacmanState.dots.forEach((dot) => {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw enemies
  pacmanState.enemies.forEach((enemy) => {
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, 10, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw Pacman
  ctx.fillStyle = '#ffff00';
  ctx.beginPath();
  ctx.arc(pacmanState.x + pacmanState.size / 2, pacmanState.y + pacmanState.size / 2, pacmanState.size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Draw score
  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${pacmanState.score}`, 10, 30);

  if (pacmanState.dots.length === 0) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('All dots eaten! Back to the quiz.', gameCanvas.width / 2, gameCanvas.height / 2);
  } else if (!pacmanState.alive) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Caught by enemy! Back to the quiz.', gameCanvas.width / 2, gameCanvas.height / 2);
  }
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
  } else if (currentGame === 'space-invader') {
    updateSpaceInvader();
    drawSpaceInvader();
  } else if (currentGame === 'flappy-bird') {
    updateFlappyBird();
    drawFlappyBird();
  } else if (currentGame === 'pacman') {
    updatePacman();
    drawPacman();
  }

  animationId = requestAnimationFrame(runGameLoop);
}

function initApp() {
  setupThemeControls();
  applyThemeToScreens();
  showScreen(gradeScreen);
}

initApp();
