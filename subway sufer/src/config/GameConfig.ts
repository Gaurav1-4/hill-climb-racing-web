import Phaser from 'phaser';

export const GAME_WIDTH = 400; // Base width, scales to fit
export const GAME_HEIGHT = 800; // Base height, portrait mode

export const GameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_WIDTH,
        height: GAME_HEIGHT
    },
    // No physics engine needed for deterministic movement MVP, 
    // but enabling arcade just in case simple AABB is useful later.
    // For now we do manual overlaps.
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { x: 0, y: 0 }
        }
    },
    pixelArt: true,
};
