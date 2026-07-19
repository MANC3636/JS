// game.js — Pong game controller. Inject DOM elements and sound functions.
import { sndWallHit, sndPlayerHit, sndAiHit, sndGameOver } from './sound.js';
import { getFlashMode } from './csv_utils.js';

// Pure helper so the bonus-duration math is unit-testable without a <canvas>/DOM.
export function computeSessionDuration(baseSeconds, bonusMinutes) {
  return baseSeconds + (Number(bonusMinutes) || 0) * 60;
}

export function createGameController({
  canvas, scoreDisplay, timerDisplay, onEnd, getFlashPreference = null,
  getBonusMinutes = null, onBonusConsumed = null,
} = {}) {
  const ctx = canvas.getContext('2d');
  let gameActive = false;
  let currentScore = 0;
  let gameDuration = 120;
  let remainingSeconds = gameDuration;
  let animationFrameId = null;
  let gameTimer = null;
  let consumedBonusMinutes = 0;

  let ball = null;
  let playerPaddle = null;
  let aiPaddle = null;
  let ballVisible = true;
  let ballInZone = false;
  let gameMode = 'normal';
  let ghostLevel = Number(sessionStorage.getItem('sisyphusGhostLevel')) || 1;

  function formatTimer(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  }

  function initGameObjects() {
    ballVisible = true;
    ballInZone = false;
    const width = canvas.width;
    const height = canvas.height;
    // base paddle sizes
    const baseHeight = 100;
    playerPaddle = { x: 20, y: height / 2 - baseHeight / 2, width: 16, height: baseHeight, speed: 8 };
    aiPaddle = { x: width - 36, y: height / 2 - baseHeight / 2, width: 16, height: baseHeight, speed: 4 };
    ball = { x: width / 2, y: height / 2, radius: 10, speedX: 5, speedY: 3 };
    applyPaddleScaling();
  }

  function applyPaddleScaling() {
    // default full-size
    let scale = 1;
    if (gameMode === 'ghost') {
      if (ghostLevel >= 2) scale = 0.5;
      if (currentScore > 15) scale = 0.25;
    }
    const height = canvas.height;
    const baseHeight = 100;
    const newHeight = Math.max(16, Math.floor(baseHeight * scale));
    // keep paddle center positions stable
    if (playerPaddle) {
      const center = playerPaddle.y + playerPaddle.height / 2;
      playerPaddle.height = newHeight;
      playerPaddle.y = Math.max(0, Math.min(height - playerPaddle.height, center - playerPaddle.height / 2));
    }
    if (aiPaddle) {
      const center = aiPaddle.y + aiPaddle.height / 2;
      aiPaddle.height = newHeight;
      aiPaddle.y = Math.max(0, Math.min(height - aiPaddle.height, center - aiPaddle.height / 2));
    }
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

  function resolveFlashMode() {
    if (typeof getFlashPreference === 'function') {
      const pref = getFlashPreference();
      if (pref === 'solid' || pref === 'flash') return pref;
    }
    return getFlashMode(null, (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('sisyphusFlash') : null) || (typeof localStorage !== 'undefined' ? localStorage.getItem('sisyphusFlash') : null) || 'flash');
  }

  function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 24);
    ctx.lineTo(canvas.width / 2, canvas.height - 24);
    ctx.stroke();
    ctx.setLineDash([]);

    const flashMode = resolveFlashMode();
    if (remainingSeconds <= 15) {
      if (flashMode === 'solid') {
        ctx.strokeStyle = 'rgba(255, 68, 68, 0.85)';
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
      } else if (Math.floor(Date.now() / 250) % 2 === 0) {
        ctx.strokeStyle = 'rgba(255, 68, 68, 0.85)';
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
      }
    } else if (remainingSeconds <= 30) {
      if (flashMode === 'solid') {
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.75)';
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
      } else if (Math.floor(Date.now() / 500) % 2 === 0) {
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

    if (ball.x - ball.radius <= playerPaddle.x + playerPaddle.width && ball.y >= playerPaddle.y && ball.y <= playerPaddle.y + playerPaddle.height) {
      ball.speedX = Math.abs(ball.speedX);
      ballInZone = false;
      ballVisible = true;
      sndPlayerHit();
      currentScore += 1;
      // persist score for the session
      try { sessionStorage.setItem('sisyphusGameScore', String(currentScore)); } catch (e) { /* ignore */ }
      if (scoreDisplay) scoreDisplay.textContent = `Score: ${currentScore}`;
      // re-evaluate paddle sizes if ghost mode
      applyPaddleScaling();
    }

    if (ball.x + ball.radius >= aiPaddle.x && ball.y >= aiPaddle.y && ball.y <= aiPaddle.y + aiPaddle.height) {
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

  function clearTimerWarning() {
    if (timerDisplay) timerDisplay.classList.remove('timer-warning', 'timer-danger');
  }

  function updateTimerWarning() {
    if (!timerDisplay) return;
    if (resolveFlashMode() === 'flash') {
      if (remainingSeconds <= 15) {
        timerDisplay.classList.remove('timer-warning');
        timerDisplay.classList.add('timer-danger');
      } else if (remainingSeconds <= 30) {
        timerDisplay.classList.remove('timer-danger');
        timerDisplay.classList.add('timer-warning');
      } else {
        clearTimerWarning();
      }
    } else {
      clearTimerWarning();
    }
  }

  function endGame() {
    gameActive = false;
    cancelAnimationFrame(animationFrameId);
    clearInterval(gameTimer);
    clearTimerWarning();
    sndGameOver();
    if (onEnd) onEnd();
    if (consumedBonusMinutes > 0 && typeof onBonusConsumed === 'function') {
      onBonusConsumed(consumedBonusMinutes);
      consumedBonusMinutes = 0; // one-time bonus is spent; guard against double-firing
    }
    remainingSeconds = gameDuration;
    if (timerDisplay) timerDisplay.textContent = formatTimer(remainingSeconds);
    if (scoreDisplay) scoreDisplay.textContent = `Score: ${currentScore}`;
  }

  function startGame(mode = 'normal') {
    gameMode = mode === 'ghost' ? 'ghost' : 'normal';
    gameActive = true;
    // restore session score if present
    const stored = Number(sessionStorage.getItem('sisyphusGameScore')) || 0;
    currentScore = stored;
    if (scoreDisplay) scoreDisplay.textContent = `Score: ${currentScore}`;
    const bonus = typeof getBonusMinutes === 'function' ? (Number(getBonusMinutes()) || 0) : 0;
    consumedBonusMinutes = bonus; // read once per call — the "one-time" part
    remainingSeconds = computeSessionDuration(gameDuration, bonus);
    clearTimerWarning();
    if (timerDisplay) timerDisplay.textContent = formatTimer(remainingSeconds);
    initGameObjects();
    gameTimer = setInterval(() => {
      remainingSeconds -= 1;
      if (timerDisplay) timerDisplay.textContent = formatTimer(remainingSeconds);
      updateTimerWarning();
      if (remainingSeconds <= 0) {
        endGame();
      }
    }, 1000);
    animationFrameId = requestAnimationFrame(drawGame);
  }

  function setGhostLevel(level) {
    ghostLevel = Number(level) || 1;
    try { sessionStorage.setItem('sisyphusGhostLevel', String(ghostLevel)); } catch (e) { /* ignore */ }
    applyPaddleScaling();
  }

  function setPaddlePosition(clientY) {
    const rect = canvas.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    playerPaddle.y = Math.max(0, Math.min(canvas.height - playerPaddle.height, (relativeY / rect.height) * canvas.height - playerPaddle.height / 2));
  }

  return { startGame, endGame, setPaddlePosition, setGhostLevel };
}

export default { createGameController, computeSessionDuration };
