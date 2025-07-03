// ui.js - All UI Functions (Screen Management, HUD Updates, Menu Handling)

import { GameState, DUNGEON_THEME } from './core/constants.js';
import { gameState, resetGame, startGameLoop, stopGameLoop } from './core/gameState.js';
import { soundManager, checkAchievements, saveHighScore, checkForTop10Score, displayHighscores } from './systems.js';
import { activeDropBuffs } from './systems.js';
import { 
    updateEnhancedComboDisplay, 
    updateEnhancedBuffDisplay,
    initEnhancedContainers  // Add this import
} from './ui-enhancements.js';


// Screen Management
export function hideAllScreens() {
    const screens = ['startScreen', 'levelComplete', 'gameOver', 'pauseScreen', 'newHighScore', 'infoOverlay'];
    screens.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
}

export function showScreen(screenId) {
    hideAllScreens();
    const element = document.getElementById(screenId);
    if (element) element.style.display = 'block';
}

// HUD Updates
export function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('bullets').textContent = gameState.isBerserker ? '∞' : gameState.bullets;
    document.getElementById('highscoreValue').textContent = gameState.highScore;
    
    updateHeartsDisplay();
    
    if (gameState.currentState === GameState.LEVEL_COMPLETE) {
        updateBuffButtons();
    }
}

// Separate function for enhanced displays that need continuous updates
export function updateEnhancedDisplays() {
    // Make sure containers exist before updating
    const buffContainer = document.getElementById('enhancedBuffs');
    const comboDisplay = document.getElementById('comboDisplay');
    
    if (!buffContainer || !comboDisplay) {
        console.warn('Enhanced display containers missing, reinitializing...');
        initEnhancedContainers();
    }
    
    updateEnhancedBuffDisplay();
    updateEnhancedComboDisplay();
}

export function updateHeartsDisplay() {
    const heartsContainer = document.getElementById('heartsContainer');
    if (!heartsContainer) return;
    
    heartsContainer.innerHTML = '';
    
    // Shield display removed - now handled by enhanced buff display
    
    // Hearts display
    for (let i = 0; i < gameState.maxLives; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart' + (i >= gameState.lives ? ' empty' : '');
        heart.textContent = '♥';
        heartsContainer.appendChild(heart);
    }
}

export function updateActiveBuffsDisplay() {
    const buffDisplay = document.getElementById('activeBuffs');
    if (!buffDisplay) return;
    
    let buffText = '';
    
    // Permanent buffs
    if (gameState.activeBuffs.chainLightning > 0) {
        buffText += '⚡ Chain Lightning ';
    }
    if (gameState.activeBuffs.undeadResilience > 0) {
        buffText += '🧟 Undead Vigor ';
    }
    if (gameState.activeBuffs.shadowLeap > 0) {
        buffText += '🌙 Shadow Leap ';
    }
    
    // Temporary drop buffs
    Object.keys(activeDropBuffs).forEach(buff => {
        const remaining = Math.ceil(activeDropBuffs[buff] / 60);
        switch(buff) {
            case 'speedBoost': buffText += `⚡(${remaining}s) `; break;
            case 'jumpBoost': buffText += `🚀(${remaining}s) `; break;
            case 'scoreMultiplier': buffText += `💰(${remaining}s) `; break;
            case 'magnetMode': buffText += `🌟(${remaining}s) `; break;
            case 'berserkerMode': buffText += `🔥(${remaining}s) `; break;
            case 'ghostWalk': buffText += `👻(${remaining}s) `; break;
            case 'timeSlow': buffText += `⏰(${remaining}s) `; break;
        }
    });
    
    if (buffText) {
        buffDisplay.textContent = buffText;
        buffDisplay.style.display = 'block';
    } else {
        buffDisplay.style.display = 'none';
    }
}

export function updateComboDisplay() {
    let comboDisplay = document.getElementById('comboDisplay');
    
    if (!comboDisplay) {
        comboDisplay = document.createElement('div');
        comboDisplay.id = 'comboDisplay';
        comboDisplay.className = 'combo-display';
        document.getElementById('gameContainer').appendChild(comboDisplay);
    }
    
    // Only show combo display for 2x and above
    if (gameState.comboCount >= 2) {
        comboDisplay.textContent = `${gameState.comboCount}x Combo!`;
        comboDisplay.style.display = 'block';
    } else {
        comboDisplay.style.display = 'none';
    }
}

export function updatePauseScreen() {
    document.getElementById('pauseScore').textContent = gameState.score;
    document.getElementById('pauseLevel').textContent = gameState.level;
    document.getElementById('pauseLives').textContent = gameState.lives;
}

export function updateBuffButtons() {
    const buffButtonsContainer = document.getElementById('buffButtons');
    if (!buffButtonsContainer) return;
    
    buffButtonsContainer.innerHTML = '';
    
    gameState.availableBuffs.forEach(buff => {
        const button = document.createElement('div');
        button.className = 'buff-card';
        button.onclick = () => chooseBuff(buff.id);
        
        const title = document.createElement('div');
        title.className = 'buff-title';
        title.textContent = buff.title;
        
        const desc = document.createElement('div');
        desc.className = 'buff-desc';
        desc.textContent = buff.desc;
        
        button.appendChild(title);
        button.appendChild(desc);
        buffButtonsContainer.appendChild(button);
    });
}

export function updateHighScore() {
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        saveHighScore(gameState.highScore);
        document.getElementById('newHighScore').style.display = 'block';
    }
    document.getElementById('highscoreValue').textContent = gameState.highScore;
}

// Menu Handling
export function startGame() {
    soundManager.init();
    if (soundManager.audioContext) {
        soundManager.audioContext.resume();
    }
    soundManager.startBackgroundMusic(); // Diese Zeile hinzufügen
    
    gameState.currentState = GameState.PLAYING;
    gameState.gameRunning = true;
    resetGame();
    hideAllScreens();
    
    // Initialize enhanced containers immediately
    initEnhancedContainers();
    
    updateUI();
    startGameLoop();
    
    // Force an immediate update of enhanced displays
    setTimeout(() => {
        updateEnhancedDisplays();
    }, 100);
}

export function restartGame() {
    gameState.currentState = GameState.PLAYING;
    gameState.gameRunning = true;
    resetGame();
    hideAllScreens();
    
    soundManager.startBackgroundMusic(); // Musik neu starten
    
    // Reinitialize enhanced containers
    initEnhancedContainers();
    
    updateUI();
    
    // Force update of enhanced displays
    setTimeout(() => {
        updateEnhancedDisplays();
    }, 100);
}

// Füge diese Änderungen zu deiner ui.js hinzu:

export function pauseGame() {
    if (gameState.currentState === GameState.PLAYING) {
        gameState.currentState = GameState.PAUSED;
        gameState.gameRunning = false;
        
        // Musik pausieren statt stoppen
        soundManager.pauseBackgroundMusic();
        
        updatePauseScreen();
        showScreen('pauseScreen');
    }
}

export function resumeGame() {
    if (gameState.currentState === GameState.PAUSED) {
        gameState.currentState = GameState.PLAYING;
        gameState.gameRunning = true;
        
        // Musik fortsetzen
        soundManager.resumeBackgroundMusic();
        
        hideAllScreens();
    }
}

export function gameOver() {
    gameState.currentState = GameState.GAME_OVER;
    gameState.gameRunning = false;
    
    // Musik komplett stoppen bei Game Over (mit Reset auf Anfang)
    soundManager.stopBackgroundMusic();
    
    updateHighScore();
    soundManager.death();
    
    displayHighscores();
    
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('levelsCompleted').textContent = gameState.levelsCompleted;
    
    checkForTop10Score(gameState.score);
    
    showScreen('gameOver');
}

// Erweiterte Mute-Funktion für bessere Pause-Kontrolle
export function toggleMute() {
    soundManager.toggleMute();
    
    // Wenn unmuted und Spiel läuft, Musik fortsetzen
    if (!soundManager.isMuted && gameState.currentState === GameState.PLAYING) {
        soundManager.resumeBackgroundMusic();
    }
}

export function chooseBuff(buffType) {
    // Apply the chosen buff
    switch(buffType) {
        case 'undeadResilience':
            gameState.activeBuffs.undeadResilience = 1;
            break;
        case 'shadowLeap':
            gameState.activeBuffs.shadowLeap = 1;
            break;
        case 'chainLightning':
            gameState.activeBuffs.chainLightning = 1;
            break;
    }
    
    // Remove chosen buff from available buffs
    gameState.availableBuffs = gameState.availableBuffs.filter(buff => buff.id !== buffType);
    
    // Level up
    gameState.level++;
    gameState.levelProgress = 1;
    window.bulletBoxesFound = 0;
    gameState.damageThisLevel = 0;
    gameState.gameSpeed += 0.6;
    gameState.bullets += 12;
    
    // Grant temporary invulnerability
    gameState.postBuffInvulnerability = 120;
    
    // Resume game
    gameState.currentState = GameState.PLAYING;
    gameState.gameRunning = true;
    hideAllScreens();
    updateUI();
}

// Theme Application
export function applyTheme() {
    const container = document.getElementById('gameContainer');
    container.className = 'dungeon-theme';
    
    // Update all labels
    const updates = [
        ['gameTitle', DUNGEON_THEME.title],
        ['startButton', DUNGEON_THEME.startButton],
        ['scoreLabel', DUNGEON_THEME.labels.score],
        ['levelLabel', DUNGEON_THEME.labels.level],
        ['bulletsLabel', DUNGEON_THEME.labels.bullets],
        ['livesLabel', DUNGEON_THEME.labels.lives],
        ['highscoreLabel', DUNGEON_THEME.labels.highScore],
        ['scoreStatLabel', DUNGEON_THEME.labels.score],
        ['enemiesStatLabel', DUNGEON_THEME.labels.enemies],
        ['gameOverTitle', DUNGEON_THEME.labels.gameOver],
        ['finalScoreLabel', DUNGEON_THEME.labels.finalScore],
        ['pauseScoreLabel', DUNGEON_THEME.labels.score],
        ['pauseLevelLabel', DUNGEON_THEME.labels.level],
        ['pauseLivesLabel', DUNGEON_THEME.labels.lives],
        ['buffChoiceTitle', '🔮 Choose Your Dark Power:']
    ];

    updates.forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    });

    gameState.activeBuffs = {};
    gameState.availableBuffs = [...DUNGEON_THEME.buffs];
    updateUI();
}

// Global UI Functions (for window access)
window.startGame = startGame;
window.pauseGame = pauseGame;
window.resumeGame = resumeGame;
window.restartGame = restartGame;
window.chooseBuff = chooseBuff;
window.gameOver = gameOver;
window.showScreen = showScreen;
window.hideAllScreens = hideAllScreens;
window.updateUI = updateUI;
window.updateEnhancedDisplays = updateEnhancedDisplays;

// Toggle functions
window.toggleMute = () => soundManager.toggleMute();

window.toggleInfoOverlay = function() {
    const infoOverlay = document.getElementById('infoOverlay');
    if (!infoOverlay) return;
    
    if (infoOverlay.style.display === 'block') {
        infoOverlay.style.display = 'none';
        if (gameState.currentState === GameState.PAUSED && gameState.gameRunning === false) {
            resumeGame();
        }
    } else {
        if (gameState.currentState === GameState.PLAYING && gameState.gameRunning === true) {
            gameState.currentState = GameState.PAUSED;
            gameState.gameRunning = false;
        }
        infoOverlay.style.display = 'block';
    }
};