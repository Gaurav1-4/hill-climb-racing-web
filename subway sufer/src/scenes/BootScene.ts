import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load simple placeholder assets if any, or generate textures
        this.generatePlaceholders();
    }

    create() {
        this.scene.start('MenuScene');
    }

    private generatePlaceholders() {
        // Generate player texture (blue square)
        const playerGraphics = this.make.graphics({ x: 0, y: 0 });
        playerGraphics.fillStyle(0x00aaff, 1);
        playerGraphics.fillRect(0, 0, 64, 64);
        playerGraphics.generateTexture('player', 64, 64);

        // Generate coin texture (yellow circle)
        const coinGraphics = this.make.graphics({ x: 0, y: 0 });
        coinGraphics.fillStyle(0xffaa00, 1);
        coinGraphics.fillCircle(16, 16, 16);
        coinGraphics.generateTexture('coin', 32, 32);

        // Generate barrier texture (red block)
        const barrierGraphics = this.make.graphics({ x: 0, y: 0 });
        barrierGraphics.fillStyle(0xff3333, 1);
        barrierGraphics.fillRect(0, 0, 80, 40);
        barrierGraphics.generateTexture('barrier', 80, 40);

        // Generate high barrier texture (orange block)
        const highBarrierGraphics = this.make.graphics({ x: 0, y: 0 });
        highBarrierGraphics.fillStyle(0xff8800, 1);
        highBarrierGraphics.fillRect(0, 0, 80, 80);
        highBarrierGraphics.generateTexture('high_barrier', 80, 80);

        // Generate train texture (large grey/red block)
        const trainGraphics = this.make.graphics({ x: 0, y: 0 });
        trainGraphics.fillStyle(0x888888, 1);
        trainGraphics.fillRect(0, 0, 100, 200);
        trainGraphics.generateTexture('train', 100, 200);
    }
}
