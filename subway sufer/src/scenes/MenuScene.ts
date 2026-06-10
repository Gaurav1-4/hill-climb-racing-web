import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const centerX = GAME_WIDTH / 2;
        const centerY = GAME_HEIGHT / 2;

        this.add.text(centerX, centerY - 100, 'ENDLESS RUNNER', {
            fontSize: '40px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const playBtn = this.add.text(centerX, centerY + 50, 'TAP TO PLAY', {
            fontSize: '28px',
            color: '#00ff00',
            backgroundColor: '#004400',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        // Tweens for play button
        this.tweens.add({
            targets: playBtn,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        playBtn.on('pointerdown', () => {
            this.scene.start('GameScene');
            this.scene.start('UIScene');
        });

        const highScore = localStorage.getItem('endlessHighScore') || '0';
        this.add.text(centerX, GAME_HEIGHT - 100, `HIGH SCORE: ${highScore}`, {
            fontSize: '24px',
            color: '#aaaaaa'
        }).setOrigin(0.5);
    }
}
