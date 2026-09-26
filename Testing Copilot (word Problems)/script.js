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
const gameControls = document.getElementById('game-controls');
const snakeToggleBtn = document.getElementById('snake-toggle-btn');
const successSound = document.getElementById('success-sound');
const failureSound = document.getElementById('failure-sound');
const hitSound = document.getElementById('hit-sound');
const ctx = gameCanvas.getContext('2d');

let snakeControlState = 'ready';
let snakeCountdownRemaining = null;
let snakeStartTimeoutId = null;

// --- Admin & panel elements ---
const registerPanel = document.getElementById('register-panel');
const analyticsPanel = document.getElementById('analytics-panel');
const ADMIN_EMAIL = 'tyson571us@yahoo.com'; // change to your admin email

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
let lastProgressSave = 0;

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
  // Ensure each bank includes at least one division question for grades 3-5
  const divisionIndex = (grade >= 3) ? Math.floor(Math.random() * numQuestions) : -1;
  // For grades 1-2, ensure at least one human-themed example appears in the bank
  const humanIndex = (grade === 1 || grade === 2) ? Math.floor(Math.random() * numQuestions) : -1;
  // For grade 1, ensure at least one numeric-format question (numbers, not words)
  let numberIndex = -1;
  if (grade === 1) {
    do {
      numberIndex = Math.floor(Math.random() * numQuestions);
    } while (numberIndex === humanIndex && numQuestions > 1);
  }

  for (let i = 0; i < numQuestions; i += 1) {
    let op;
    if (i === divisionIndex) {
      op = '/';
    } else {
      op = availableOps[Math.floor(Math.random() * availableOps.length)];
    }
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

    function pluralize(noun, count) {
      if (count === 1) return noun;
      // nouns ending with consonant + 'y' -> replace 'y' with 'ies' (e.g., candy -> candies)
      if (noun.length > 1) {
        const penultimate = noun[noun.length - 2].toLowerCase();
        const vowels = 'aeiou';
        if (noun.endsWith('y') && !vowels.includes(penultimate)) {
          return noun.slice(0, -1) + 'ies';
        }
      }
      return noun + 's';
    }

    function phrase(count, noun) {
      return `${count} ${pluralize(noun, count)}`;
    }

    function existPresent(count) {
      return count === 1 ? 'is' : 'are';
    }

    function existPast(count) {
      return count === 1 ? 'was' : 'were';
    }

    function joinVerb(count) {
      return count === 1 ? 'joins' : 'join';
    }

    let questionText = '';
    // Use animal examples for 1st and 2nd grades (they only generate + and -)
    if (grade === 1 || grade === 2) {
      const animals = ['cat', 'dog', 'rabbit', 'bird', 'duck'];
      const animal = animals[Math.floor(Math.random() * animals.length)];
      const humans = ['Sam', 'Mia', 'Liam', 'Noah', 'Ava'];
      const human = humans[Math.floor(Math.random() * humans.length)];
      // If this index is chosen for a numeric-format question (grade 1), render numbers
      if (grade === 1 && i === numberIndex) {
        questionText = `${a} ${op} ${b} =`;
      } else if (i === humanIndex) {
        if (op === '+') {
          questionText = `${human} has ${phrase(a, 'pencil')} and gets ${phrase(b, 'pencil')} more. How many ${pluralize('pencil', a + b)} does ${human} have now?`;
        } else if (op === '-') {
          questionText = `${human} had ${phrase(a, 'sticker')}. ${phrase(b, 'sticker')} were given away. How many ${pluralize('sticker', a - b >= 0 ? a - b : 0)} are left?`;
        } else if (op === '/') {
          questionText = `${phrase(a, 'cookie')} are shared by ${phrase(b, 'friend')}. How many ${pluralize('cookie', Math.floor(a / b))} does each friend get?`;
        }
      } else {
        if (op === '+') {
          questionText = `There ${existPresent(a)} ${phrase(a, animal)}. ${phrase(b, animal)} ${joinVerb(b)} them. How many ${pluralize(animal, a + b)} are there now?`;
        } else if (op === '-') {
          questionText = `There ${existPast(a)} ${phrase(a, animal)}. ${phrase(b, animal)} walked away. How many ${pluralize(animal, a - b >= 0 ? a - b : 0)} are left?`;
        } else if (op === '/') {
          questionText = `${phrase(a, animal)} are put into ${phrase(b, 'group')}. How many ${pluralize(animal, Math.floor(a / b))} are in each group?`;
        }
      }
    } else {
      if (op === '+') {
        questionText = `Alex has ${phrase(a, 'apple')} and receives ${phrase(b, 'apple')} more. How many ${pluralize('apple', a + b)} does Alex have now?`;
      } else if (op === '-') {
        questionText = `There were ${phrase(a, 'balloon')} and ${phrase(b, 'balloon')} floated away. How many ${pluralize('balloon', a - b >= 0 ? a - b : 0)} are left?`;
      } else if (op === '*') {
        questionText = `${phrase(a, 'basket')} each contain ${phrase(b, 'orange')}. How many ${pluralize('orange', a * b)} are there in total?`;
      } else if (op === '/') {
        questionText = `${phrase(a, 'candy')} are shared equally among ${phrase(b, 'friend')}. How many ${pluralize('candy', Math.floor(a / b))} does each friend get?`;
      }
    }

    row.innerHTML = `
      <label for="q${i}">${questionText}</label>
      <input type="number" id="q${i}" name="q${i}" autocomplete="off" />
    `;
    questionsContainer.appendChild(row);
  }
}

function showScreen(screen) {
  // hide all panels with class 'card' then show the requested panel
  document.querySelectorAll('.card').forEach(c => c.classList.add('hidden'));
  if (screen && screen.classList) screen.classList.remove('hidden');
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
  saveCurrentGameProgress();
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  clearSnakeStartDelay();
  window.removeEventListener('keydown', pongKeyDown);
  window.removeEventListener('keyup', pongKeyUp);
  window.removeEventListener('keydown', snakeKeyDown);
  window.removeEventListener('keydown', spaceInvaderKeyDown);
  window.removeEventListener('keyup', spaceInvaderKeyUp);
  window.removeEventListener('keydown', flappyKeyDown);
  window.removeEventListener('keydown', pacmanKeyDown);
  currentGame = null;
  gameEndTime = null;
  snakeControlState = 'ready';
  snakeCountdownRemaining = null;
  if (snakeToggleBtn) {
    snakeToggleBtn.textContent = 'Start';
    snakeToggleBtn.classList.add('hidden');
    snakeToggleBtn.disabled = false;
  }
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

function pauseSnakeCountdown() {
  if (!countdownInterval || !gameEndTime) return;
  snakeCountdownRemaining = Math.max(0, gameEndTime - Date.now());
  clearInterval(countdownInterval);
  countdownInterval = null;
  gameEndTime = null;
}

function clearSnakeStartDelay() {
  if (snakeStartTimeoutId !== null) {
    clearTimeout(snakeStartTimeoutId);
    snakeStartTimeoutId = null;
  }
}

function startSnakeGame() {
  if (snakeControlState !== 'ready') return;
  snakeControlState = 'starting';
  snakeToggleBtn.textContent = 'Starting...';
  snakeToggleBtn.disabled = true;
  clearSnakeStartDelay();
  snakeStartTimeoutId = setTimeout(() => {
    snakeStartTimeoutId = null;
    snakeControlState = 'running';
    snakeToggleBtn.disabled = false;
    snakeToggleBtn.textContent = 'Pause';
    if (!countdownInterval) {
      if (snakeCountdownRemaining == null) {
        startCountdown(120000);
      } else {
        startCountdown(snakeCountdownRemaining);
        snakeCountdownRemaining = null;
      }
    }
    if (!animationId) {
      lastTime = null;
      animationId = requestAnimationFrame(runGameLoop);
    }
  }, 2000);
}

function pauseSnakeGame() {
  if (snakeControlState !== 'running') return;
  snakeControlState = 'paused';
  snakeToggleBtn.textContent = 'Stop';
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  pauseSnakeCountdown();
}

function stopSnakeGame() {
  snakeControlState = 'ready';
  snakeCountdownRemaining = null;
  snakeToggleBtn.disabled = false;
  snakeToggleBtn.textContent = 'Start';
  clearSnakeStartDelay();
  stopGame();
}

function activateGame(gameName) {
  currentGame = gameName;
  lastTime = null;
  showScreen(gameScreen);
  configureGameControls(gameName);
  if (gameName === 'pong') {
    gameTitle.textContent = 'Pong';
    gameInstructions.textContent = 'Use W/S to move left paddle and Up/Down arrows to move right paddle.';
    snakeToggleBtn.classList.add('hidden');
    startCountdown(120000);
    initPong();
  } else if (gameName === 'snake') {
    gameTitle.textContent = 'Snake';
    gameInstructions.textContent = 'Use arrow keys to move the snake. Eat food and avoid walls.';
    snakeControlState = 'ready';
    snakeCountdownRemaining = null;
    timerLabel.textContent = formatTime(120000);
    gameEndTime = null;
    countdownInterval = null;
    snakeToggleBtn.textContent = 'Start';
    snakeToggleBtn.classList.remove('hidden');
    initSnake();
  } else if (gameName === 'space-invader') {
    gameTitle.textContent = 'Space Invader';
    gameInstructions.textContent = 'Use Left/Right to move and Space to shoot the invader.';
    snakeToggleBtn.classList.add('hidden');
    startCountdown(120000);
    initSpaceInvader();
  } else if (gameName === 'flappy-bird') {
    gameTitle.textContent = 'Flappy Bird';
    gameInstructions.textContent = 'Press Space or ArrowUp to flap and avoid the pipes.';
    snakeToggleBtn.classList.add('hidden');
    startCountdown(120000);
    initFlappyBird();
  } else if (gameName === 'pacman') {
    gameTitle.textContent = 'Pacman';
    gameInstructions.textContent = 'Use arrow keys to move Pacman, eat all dots, and avoid the chasing enemies.';
    snakeToggleBtn.classList.add('hidden');
    startCountdown(120000);
    initPacman();
  }
  restoreGameProgress(gameName);
  drawCurrentGame();
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

snakeToggleBtn && snakeToggleBtn.addEventListener('click', () => {
  if (snakeControlState === 'ready') {
    startSnakeGame();
  } else if (snakeControlState === 'running') {
    pauseSnakeGame();
  } else if (snakeControlState === 'paused') {
    stopSnakeGame();
  }
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

function gameProgressKey() {
  const userId = localStorage.getItem('wc_current_user') || 'guest';
  return `wc_game_progress_${userId}`;
}

function getSavedGameProgress() {
  try {
    return JSON.parse(sessionStorage.getItem(gameProgressKey()) || '{}');
  } catch (error) {
    return {};
  }
}

function saveCurrentGameProgress() {
  if (!currentGame) return;
  const progress = getSavedGameProgress();
  const states = {
    pong: pongState,
    snake: snakeState,
    'space-invader': invaderState,
    'flappy-bird': flappyState,
    pacman: pacmanState,
  };
  try {
    progress[currentGame] = JSON.parse(JSON.stringify(states[currentGame]));
    sessionStorage.setItem(gameProgressKey(), JSON.stringify(progress));
  } catch (error) {
    // Storage may be unavailable or full; the game still works without saving.
  }
}

function restoreGameProgress(gameName) {
  const savedState = getSavedGameProgress()[gameName];
  if (!savedState || savedState.alive === false) return;
  const states = {
    pong: pongState,
    snake: snakeState,
    'space-invader': invaderState,
    'flappy-bird': flappyState,
    pacman: pacmanState,
  };
  Object.assign(states[gameName], savedState);
  if (gameName === 'pong') {
    pongState.leftSpeed = 0;
    pongState.rightSpeed = 0;
  }
  if (gameName === 'snake') {
    snakeState.alive = true;
    snakeState.frameCounter = 0;
  }
}

function drawCurrentGame() {
  if (currentGame === 'pong') drawPong();
  if (currentGame === 'snake') drawSnake();
  if (currentGame === 'space-invader') drawSpaceInvader();
  if (currentGame === 'flappy-bird') drawFlappyBird();
  if (currentGame === 'pacman') drawPacman();
}

function configureGameControls(gameName) {
  const controlsByGame = {
    pong: ['ArrowUp', 'ArrowDown', 'w', 's'],
    snake: ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'],
    'space-invader': ['ArrowLeft', 'ArrowRight', 'Space'],
    'flappy-bird': ['ArrowUp'],
    pacman: ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'],
  };
  const controls = controlsByGame[gameName] || [];

  gameControls.querySelectorAll('.control-button').forEach((button) => {
    const control = button.dataset.control;
    button.classList.toggle('hidden', !controls.includes(control));
    if (control === 'ArrowUp' && gameName === 'flappy-bird') {
      button.setAttribute('aria-label', 'Flap');
    } else if (control === 'ArrowUp' || control === 'ArrowDown') {
      button.setAttribute('aria-label', gameName === 'pong'
        ? `Move right paddle ${control === 'ArrowUp' ? 'up' : 'down'}`
        : `Move ${control === 'ArrowUp' ? 'up' : 'down'}`);
    }
  });
}

function handleMobileControl(control) {
  const event = { key: control, code: control };
  if (currentGame === 'pong') pongKeyDown(event);
  if (currentGame === 'snake') snakeKeyDown(event);
  if (currentGame === 'space-invader') spaceInvaderKeyDown(event);
  if (currentGame === 'flappy-bird') flappyKeyDown(event);
  if (currentGame === 'pacman') pacmanKeyDown(event);
}

function releaseMobileControl(control) {
  if (currentGame === 'pong') pongKeyUp({ key: control });
  if (currentGame === 'space-invader') spaceInvaderKeyUp({ key: control });
}

gameControls.querySelectorAll('.control-button').forEach((button) => {
  const control = button.dataset.control;
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    handleMobileControl(control);
  });
  button.addEventListener('pointerup', () => releaseMobileControl(control));
  button.addEventListener('pointercancel', () => releaseMobileControl(control));
  button.addEventListener('pointerleave', () => releaseMobileControl(control));
});

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
  animationId = null;
  drawSnake();
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

// -------------------------
// Usage tracking & analytics
// -------------------------

// Simple localStorage-backed data model for demo purposes
function getUsers() {
  return JSON.parse(localStorage.getItem('wc_users') || '[]');
}
function saveUsers(users) {
  localStorage.setItem('wc_users', JSON.stringify(users));
}
function getSessions() {
  return JSON.parse(localStorage.getItem('wc_sessions') || '[]');
}
function saveSessions(sessions) {
  localStorage.setItem('wc_sessions', JSON.stringify(sessions));
}

function uid() {
  return 'u' + Date.now() + Math.floor(Math.random() * 1000);
}

const registerForm = document.getElementById('register-form');
const currentUserEl = document.getElementById('current-user');
const sessionStatusEl = document.getElementById('session-status');
const logoutBtn = document.getElementById('logout-btn');
const analyticsUserSel = document.getElementById('analytics-user');
const timeRangeSel = document.getElementById('time-range');
const getAnalyticsBtn = document.getElementById('get-analytics');
const downloadCsvBtn = document.getElementById('download-csv');
const analyticsResults = document.getElementById('analytics-results');

let trackingStart = null;
let backendAvailable = false;
let backendSessionId = null;
let heartbeatInterval = null;
const HEARTBEAT_MS = 60 * 1000; // 1 minute
const MERGE_GAP_MS = 2 * 60 * 1000; // if resumed within 2 minutes, merge

function getCurrentUserId() {
  return localStorage.getItem('wc_current_user') || null;
}
function setCurrentUserId(id) {
  if (id) localStorage.setItem('wc_current_user', id); else localStorage.removeItem('wc_current_user');
}

function renderCurrentUser() {
  const id = getCurrentUserId();
  const users = getUsers();
  const u = users.find(x => x.id === id);
  if (u) {
    currentUserEl.textContent = `Logged in: ${u.username} (${u.email}, grade ${u.grade})`;
    logoutBtn.classList.remove('hidden');
    startTracking();
    // show grade selection (behind registration)
    showScreen(gradeScreen);
    // show analytics only for admin
    if (u.email && u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      analyticsPanel.classList.remove('hidden');
    } else {
      analyticsPanel.classList.add('hidden');
    }
  } else {
    currentUserEl.textContent = '';
    logoutBtn.classList.add('hidden');
    stopTracking();
    // show registration panel when not logged in
    showScreen(registerPanel);
    analyticsPanel.classList.add('hidden');
  }
}

registerForm && registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const grade = document.getElementById('grade').value;
  const username = document.getElementById('username').value.trim();
  if (!email || !username) return alert('Please provide email and username');
  const users = getUsers();
  let user = users.find(x => x.email === email || x.username === username);
  if (!user) {
    user = { id: uid(), email, grade, username, createdAt: Date.now() };
    users.push(user);
    saveUsers(users);
  }
  setCurrentUserId(user.id);
  populateAnalyticsUsers();
  renderCurrentUser();
});

logoutBtn && logoutBtn.addEventListener('click', () => {
  const id = getCurrentUserId();
  if (id) {
    // close any open session
    endSessionForUser(id);
  }
  setCurrentUserId(null);
  renderCurrentUser();
});

function startTracking() {
  if (trackingStart) return; // already tracking
  const id = getCurrentUserId();
  if (!id) return;
  trackingStart = Date.now();
  sessionStatusEl.textContent = 'Tracking active';
  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('beforeunload', handleBeforeUnload);
  // try to use backend
  ensureBackend().then(() => {
    if (!backendAvailable) return;
    // start session on backend
    fetch('/.netlify/functions/session', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ action: 'start', userId: id }) })
      .then(r => r.json()).then(j => { backendSessionId = j.sessionId; })
      .catch(()=>{});
    // start heartbeat
    heartbeatInterval = setInterval(() => sendHeartbeat(id), HEARTBEAT_MS);
  });
}

function stopTracking() {
  if (!trackingStart) return;
  const id = getCurrentUserId();
  const now = Date.now();
  const sessions = getSessions();
  sessions.push({ id: uid(), userId: id, start: trackingStart, end: now });
  saveSessions(sessions);
  trackingStart = null;
  sessionStatusEl.textContent = 'Not tracking';
  document.removeEventListener('visibilitychange', handleVisibility);
  window.removeEventListener('beforeunload', handleBeforeUnload);
  // stop backend session
  if (backendAvailable && backendSessionId && id) {
    fetch('/.netlify/functions/session', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ action: 'stop', userId: id, sessionId: backendSessionId }) })
      .catch(()=>{});
    backendSessionId = null;
  }
  if (heartbeatInterval) { clearInterval(heartbeatInterval); heartbeatInterval = null; }
}

function handleVisibility() {
  if (document.hidden) {
    // pause session
    const id = getCurrentUserId();
    if (!id || !trackingStart) return;
    const now = Date.now();
    const sessions = getSessions();
    sessions.push({ id: uid(), userId: id, start: trackingStart, end: now });
    saveSessions(sessions);
    trackingStart = null;
    sessionStatusEl.textContent = 'Paused (tab hidden)';
    // stop backend session
    if (backendAvailable && backendSessionId && id) {
      fetch('/.netlify/functions/session', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ action: 'stop', userId: id, sessionId: backendSessionId }) }).catch(()=>{});
      backendSessionId = null;
    }
  } else {
    // resume
    if (!getCurrentUserId()) return;
    const now = Date.now();
    // if resumed quickly after pause, merge locally by subtracting small gap
    const last = getSessions().slice(-1)[0];
    if (last && last.userId === getCurrentUserId() && Math.abs(now - last.end) <= MERGE_GAP_MS) {
      // extend last session by setting trackingStart to last.start
      trackingStart = last.start;
      // remove last as it will be re-recorded on stop
      const s = getSessions(); s.pop(); saveSessions(s);
    } else {
      trackingStart = now;
    }
    sessionStatusEl.textContent = 'Tracking active';
    // start backend session and heartbeat
    ensureBackend().then(() => {
      if (!backendAvailable) return;
      const id = getCurrentUserId();
      fetch('/.netlify/functions/session', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ action: 'start', userId: id }) })
        .then(r => r.json()).then(j => { backendSessionId = j.sessionId; }).catch(()=>{});
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      heartbeatInterval = setInterval(() => sendHeartbeat(getCurrentUserId()), HEARTBEAT_MS);
    });
  }
}

function handleBeforeUnload() {
  stopTracking();
}

function endSessionForUser(userId) {
  // if trackingStart exists for current user, close it
  if (getCurrentUserId() === userId && trackingStart) {
    stopTracking();
    return;
  }
}

async function ensureBackend() {
  if (backendAvailable) return true;
  try {
    const resp = await fetch('/.netlify/functions/analytics?ping=1');
    if (resp.ok) backendAvailable = true;
  } catch (e) { backendAvailable = false; }
  return backendAvailable;
}

function sendHeartbeat(userId) {
  if (!userId) return;
  if (backendAvailable) {
    fetch('/.netlify/functions/session', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ action: 'heartbeat', userId }) }).catch(()=>{});
  }
}

// Analytics helpers
function populateAnalyticsUsers() {
  const users = getUsers();
  analyticsUserSel.innerHTML = '<option value="all">All users</option>' + users.map(u => `<option value="${u.id}">${u.username} (${u.email})</option>`).join('');
}

function startOfDay(ts) { const d = new Date(ts); d.setHours(0,0,0,0); return d.getTime(); }
function startOfWeek(ts) { const d = new Date(ts); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); d.setDate(diff); d.setHours(0,0,0,0); return d.getTime(); }
function startOfMonth(ts) { const d = new Date(ts); d.setDate(1); d.setHours(0,0,0,0); return d.getTime(); }

function computeRange(range) {
  const now = Date.now();
  if (range === 'day') return { start: startOfDay(now), end: now };
  if (range === 'week') return { start: startOfWeek(now), end: now };
  if (range === 'month') return { start: startOfMonth(now), end: now };
  if (range === 'last7') return { start: startOfDay(now - 6 * 24 * 60 * 60 * 1000), end: now };
  return { start: 0, end: now };
}

function overlapDuration(sStart, sEnd, rangeStart, rangeEnd) {
  const a = Math.max(sStart, rangeStart);
  const b = Math.min(sEnd || Date.now(), rangeEnd);
  return Math.max(0, b - a);
}

function formatMinutes(ms) {
  return Math.round(ms / 60000 * 100) / 100; // 2 decimal minutes
}

function getReport(range) {
  const users = getUsers();
  const sessions = getSessions();
  const { start, end } = computeRange(range);
  const res = [];
  users.forEach((u) => {
    const userSessions = sessions.filter(s => s.userId === u.id);
    let totalMs = 0;
    if (range === 'last7') {
      // per-day columns for last 7 days
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const dayStart = startOfDay(Date.now() - i * 24 * 60 * 60 * 1000);
        const dayEnd = dayStart + 24 * 60 * 60 * 1000 - 1;
        const ms = userSessions.reduce((acc, s) => acc + overlapDuration(s.start, s.end, dayStart, dayEnd), 0);
        days.push(ms);
        totalMs += ms;
      }
      res.push({ user: u, days, totalMs });
    } else {
      totalMs = userSessions.reduce((acc, s) => acc + overlapDuration(s.start, s.end, start, end), 0);
      res.push({ user: u, totalMs });
    }
  });
  return res;
}

function renderReport(range, userFilter) {
  const report = getReport(range);
  let rows = '';
  if (range === 'last7') {
    // header
    const headers = ['Username','Email','Grade'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      headers.push(d.toISOString().slice(0,10));
    }
    headers.push('Total (min)');
    rows += `<table class="report"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>`;
    report.forEach(r => {
      if (userFilter && userFilter !== 'all' && r.user.id !== userFilter) return;
      const dayCols = r.days.map(ms => `<td>${formatMinutes(ms)}</td>`).join('');
      rows += `<tr><td>${r.user.username}</td><td>${r.user.email}</td><td>${r.user.grade}</td>${dayCols}<td>${formatMinutes(r.totalMs)}</td></tr>`;
    });
    rows += '</tbody></table>';
  } else {
    rows += `<table class="report"><thead><tr><th>Username</th><th>Email</th><th>Grade</th><th>Minutes</th></tr></thead><tbody>`;
    report.forEach(r => {
      if (userFilter && userFilter !== 'all' && r.user.id !== userFilter) return;
      rows += `<tr><td>${r.user.username}</td><td>${r.user.email}</td><td>${r.user.grade}</td><td>${formatMinutes(r.totalMs)}</td></tr>`;
    });
    rows += '</tbody></table>';
  }
  analyticsResults.innerHTML = rows + `<div class="meta">Users: ${getUsers().length}</div>`;
  downloadCsvBtn.classList.remove('hidden');
}

getAnalyticsBtn && getAnalyticsBtn.addEventListener('click', () => {
  const range = timeRangeSel.value;
  const userFilter = analyticsUserSel.value;
  // prefer backend-generated report
  ensureBackend().then((ok) => {
    if (ok) {
      // request CSV from backend and open
      const params = new URLSearchParams({ range, userId: userFilter === 'all' ? '' : userFilter, format: 'csv' });
      fetch('/.netlify/functions/analytics?' + params.toString()).then(r => r.text()).then(text => {
        analyticsResults.innerHTML = '<pre class="meta">Backend CSV received. Use download to save.</pre>';
        downloadCsvBtn.classList.remove('hidden');
        // store last CSV in memory for download via front-end if necessary
        window._lastCSV = { text, range };
      }).catch(() => renderReport(range, userFilter));
    } else {
      renderReport(range, userFilter);
    }
  });
});

downloadCsvBtn && downloadCsvBtn.addEventListener('click', () => {
  const range = timeRangeSel.value;
  const userFilter = analyticsUserSel.value;
  // if backend available, request xlsx, else fall back to client CSV
  ensureBackend().then(ok => {
    if (ok) {
      const params = new URLSearchParams({ range, userId: userFilter === 'all' ? '' : userFilter, format: 'xlsx' });
      const url = '/.netlify/functions/analytics?' + params.toString();
      window.open(url, '_blank');
    } else {
      const report = getReport(range).filter(r => userFilter === 'all' ? true : r.user.id === userFilter);
      const lines = [];
      if (range === 'last7') {
        const header = ['Username','Email','Grade'];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i);
          header.push(d.toISOString().slice(0,10));
        }
        header.push('Total (min)');
        lines.push(header.join(','));
        report.forEach(r => {
          const row = [r.user.username, r.user.email, r.user.grade].concat(r.days.map(ms => formatMinutes(ms)), formatMinutes(r.totalMs));
          lines.push(row.join(','));
        });
      } else {
        lines.push(['Username','Email','Grade','Minutes'].join(','));
        report.forEach(r => {
          lines.push([r.user.username, r.user.email, r.user.grade, formatMinutes(r.totalMs)].join(','));
        });
      }
      const csv = lines.join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = u;
      a.download = `analytics_${timeRangeSel.value}_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(u);
    }
  });
});

// Initialize
populateAnalyticsUsers();
renderCurrentUser();


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
  if (timestamp - lastProgressSave >= 500) {
    saveCurrentGameProgress();
    lastProgressSave = timestamp;
  }
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
  showScreen(registerPanel);
}

initApp();
