import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(_data: any) {
        // Receive score data from GameScene
    }

    create() {
        const centerX = GAME_WIDTH / 2;
        const centerY = GAME_HEIGHT / 2;

        this.add.text(centerX, centerY - 100, 'GAME OVER', {
            fontSize: '40px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const restartBtn = this.add.text(centerX, centerY + 50, 'RESTART', {
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#444444',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        restartBtn.on('pointerdown', () => {
            this.scene.start('GameScene');
            this.scene.start('UIScene');
        });
    }
}
