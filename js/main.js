// main.js - Entry Point, Initialization - OPTIMIZED VERSION

import { CANVAS, GameState } from './core/constants.js';
import { gameState, resetGame, startGameLoop, stopGameLoop, update, loadGame, initRenderLoop } from './core/gameState.js';
import { camera, resetCamera } from './core/camera.js';
import { player, updatePlayer } from './core/player.js';
import { keys, initInput } from './core/input.js';
import { 
    initEnhancements, 
    initEnhancedContainers,
    updateEnhancedComboDisplay,
    updateEnhancedBuffDisplay
} from './ui-enhancements.js';

import { 
    soundManager, 
    loadGlobalHighscores, 
    updateDropBuffs,
    checkAchievements
} from './systems.js';

import {
    obstacles,
    bulletsFired,
    explosions,
    environmentElements,
    bloodParticles,
    lightningEffects,
    scorePopups,
    doubleJumpParticles,
    dropParticles,
    drops,
    spawnObstacle,
    updateAllEntities,
    updateObstacles,
    updateBullets,
    updateExplosions,
    updateEnvironmentElements,
    updateDrops,
    updateEffects,
    checkCollisions,
    shoot,
    bulletBoxesFound,
    obstacleTimer,
    initEnvironmentElements,
} from './entities.js';

import {
    updateUI as uiUpdateUI,
    applyTheme,
    showScreen,
    hideAllScreens,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    gameOver
} from './ui.js';

import { render } from './rendering/renderer.js';

// Initialize canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions in constants
CANVAS.width = canvas.width;
CANVAS.height = canvas.height;

// Connect everything to gameState
gameState.canvas = canvas;
gameState.ctx = ctx;
gameState.camera = camera;

// Make functions available globally for other modules
window.gameState = gameState;
window.player = player;
window.camera = camera;
window.keys = keys;
window.soundManager = soundManager;

// Entity arrays
window.obstacles = obstacles;
window.bulletsFired = bulletsFired;
window.explosions = explosions;
window.environmentElements = environmentElements;
window.bloodParticles = bloodParticles;
window.lightningEffects = lightningEffects;
window.scorePopups = scorePopups;
window.doubleJumpParticles = doubleJumpParticles;
window.dropParticles = dropParticles;
window.drops = drops;

// Entity state
window.bulletBoxesFound = bulletBoxesFound;
window.obstacleTimer = obstacleTimer;

// Core functions
window.updatePlayer = () => updatePlayer(keys, gameState);
window.spawnObstacle = () => spawnObstacle(gameState.level, gameState.gameSpeed, gameState.timeSlowFactor);
window.updateObstacles = () => {
    if (obstacles.length > 0) {
        updateObstacles(gameState.gameSpeed, gameState.enemySlowFactor, gameState.level, gameState.magnetRange, gameState);
    }
};
window.updateBullets = () => {
    if (bulletsFired.length > 0) {
        updateBullets(gameState);
    }
};
window.updateExplosions = updateExplosions;
window.updateEnvironmentElements = () => updateEnvironmentElements(gameState.gameSpeed, gameState.timeSlowFactor);
window.updateDrops = () => updateDrops(gameState.gameSpeed, gameState.magnetRange, gameState);
window.updateEffects = () => updateEffects(gameState.timeSlowFactor, gameState);
window.checkCollisions = () => checkCollisions(gameState);
window.shoot = () => shoot(gameState);
window.render = () => render(ctx);

// UI functions
window.updateUI = () => uiUpdateUI();

// OPTIMIERT: Enhanced displays nur bei Bedarf updaten
let enhancedDisplaysInitialized = false;
let lastBuffUpdateTime = 0;

window.updateEnhancedDisplays = () => {
    // Nur alle 500ms updaten statt 60x pro Sekunde
    const now = Date.now();
    if (now - lastBuffUpdateTime < 500) return;
    lastBuffUpdateTime = now;
    
    // Container erstellen falls nötig (nur einmal)
    if (!enhancedDisplaysInitialized) {
        if (!document.getElementById('enhancedBuffs') || !document.getElementById('comboDisplay')) {
            initEnhancedContainers();
        }
        enhancedDisplaysInitialized = true;
    }
    
    // Updates ohne Debug-Logs
    updateEnhancedComboDisplay();
    updateEnhancedBuffDisplay();
};

// Main update function - OHNE kontinuierliche Enhanced Display Updates
window.update = () => {
    update();
    // Enhanced displays werden nur bei Bedarf aktualisiert, nicht jedes Frame
};

// Initialize game
function init() {
    console.log('Dungeon Runner V1.0 - Modular Edition');
    
    // Initialize systems
    initInput();
    applyTheme();
    loadGame();
    initEnvironmentElements();
    
    // Initialize sound system
    soundManager.init();
    
    // Initialize enhanced UI
    initEnhancements();
    
    // Container nur einmal erstellen
    setTimeout(() => {
        initEnhancedContainers();
        enhancedDisplaysInitialized = true;
        window.updateEnhancedDisplays();
    }, 100);
    
    // Set initial state
    gameState.currentState = GameState.START;
    showScreen('startScreen');
    
    // Check for achievement unlocks
    if (window.ACHIEVEMENTS?.untouchable?.unlocked) {
        gameState.hasShield = true;
    }
    
    // Start the render loop
    initRenderLoop();
    
    // OPTIMIERT: Enhanced displays nur alle 500ms updaten
    setInterval(() => {
        window.updateEnhancedDisplays();
    }, 500); // Statt 16ms (60fps) nur alle 500ms
}

// Window events
window.addEventListener('beforeunload', function() {
    stopGameLoop();
});

// Start the game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}