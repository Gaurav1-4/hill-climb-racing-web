import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        this.add.text(10, 10, 'UI SCENE OVERLAY', { color: '#ff0000' });
    }
}
