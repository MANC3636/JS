// game.js — Pong game controller. Inject DOM elements and sound functions.
import { sndWallHit, sndPlayerHit, sndAiHit, sndGameOver } from './sound.js';

export function createGameController({ canvas, scoreDisplay, timerDisplay, onEnd } = {}) {
  const ctx = canvas.getContext('2d');
  let gameActive = false;
  let currentScore = 0;
  let gameDuration = 120;
  let remainingSeconds = gameDuration;
  let animationFrameId = null;
  let gameTimer = null;

  let ball = null;
  let playerPaddle = null;
  let aiPaddle = null;
  let ballVisible = true;
  let ballInZone = false;
  let gameMode = 'normal';

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
    playerPaddle = { x: 20, y: height / 2 - 50, width: 16, height: 100, speed: 8 };
    aiPaddle = { x: width - 36, y: height / 2 - 50, width: 16, height: 100, speed: 4 };
    ball = { x: width / 2, y: height / 2, radius: 10, speedX: 5, speedY: 3 };
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

    if (ball.x - ball.radius <= playerPaddle.x + playerPaddle.width && ball.y >= playerPaddle.y && ball.y <= playerPaddle.y + playerPaddle.height) {
      ball.speedX = Math.abs(ball.speedX);
      ballInZone = false;
      ballVisible = true;
      sndPlayerHit();
      currentScore += 1;
      if (scoreDisplay) scoreDisplay.textContent = `Score: ${currentScore}`;
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

  function endGame() {
    gameActive = false;
    cancelAnimationFrame(animationFrameId);
    clearInterval(gameTimer);
    clearTimerWarning();
    sndGameOver();
    if (onEnd) onEnd();
    remainingSeconds = gameDuration;
    if (timerDisplay) timerDisplay.textContent = formatTimer(remainingSeconds);
    if (scoreDisplay) scoreDisplay.textContent = `Score: ${currentScore}`;
  }

  function startGame(mode = 'normal') {
    gameMode = mode === 'ghost' ? 'ghost' : 'normal';
    gameActive = true;
    currentScore = 0;
    if (scoreDisplay) scoreDisplay.textContent = `Score: ${currentScore}`;
    remainingSeconds = gameDuration;
    clearTimerWarning();
    if (timerDisplay) timerDisplay.textContent = formatTimer(remainingSeconds);
    initGameObjects();
    gameTimer = setInterval(() => {
      remainingSeconds -= 1;
      if (timerDisplay) timerDisplay.textContent = formatTimer(remainingSeconds);
      if (remainingSeconds <= 15) {
        if (timerDisplay) {
          timerDisplay.classList.remove('timer-warning');
          timerDisplay.classList.add('timer-danger');
        }
      } else if (remainingSeconds <= 30) {
        if (timerDisplay) timerDisplay.classList.add('timer-warning');
      }
      if (remainingSeconds <= 0) {
        endGame();
      }
    }, 1000);
    animationFrameId = requestAnimationFrame(drawGame);
  }

  function setPaddlePosition(clientY) {
    const rect = canvas.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    playerPaddle.y = Math.max(0, Math.min(canvas.height - playerPaddle.height, (relativeY / rect.height) * canvas.height - playerPaddle.height / 2));
  }

  return { startGame, endGame, setPaddlePosition };
}

export default { createGameController };
