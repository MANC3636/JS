import { GameEngine } from './GameEngine.js';

// Initialize the game
const gameEngine = new GameEngine();
window.gameEngine = gameEngine; // Expose to global for UI access

gameEngine.init();
gameEngine.animate();
