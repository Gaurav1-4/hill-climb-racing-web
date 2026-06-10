import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data: { distance: number, coinsEarned: number }) {
    const width = this.scale.width;
    const height = this.scale.height;

    // Overlay
    this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

    // Game Over Title
    this.add.text(width / 2, height * 0.2, 'OUT OF FUEL', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Stats
    const statsText = `Distance: ${Math.floor(data.distance)}m\nCoins Earned: ${data.coinsEarned}\nBest Distance: ${SaveSystem.load().bestDistance}m`;
    this.add.text(width / 2, height * 0.4, statsText, {
      fontSize: '28px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Buttons
    this.createButton(width / 2, height * 0.65, 'RETRY', () => {
      this.scene.start('GameScene');
    });

    this.createButton(width / 2, height * 0.75, 'GARAGE', () => {
      this.scene.start('GarageScene');
    });

    this.createButton(width / 2, height * 0.85, 'MAIN MENU', () => {
      this.scene.start('MainMenuScene');
    });
  }

  private createButton(x: number, y: number, text: string, onClick: () => void) {
    const btn = this.add.container(x, y);
    
    const bg = this.add.rectangle(0, 0, 250, 50, 0x4CAF50).setInteractive({ useHandCursor: true });
    bg.setStrokeStyle(4, 0x000000);
    
    const txt = this.add.text(0, 0, text, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    btn.add([bg, txt]);

    bg.on('pointerdown', () => {
      bg.setFillStyle(0x388E3C);
    });

    bg.on('pointerup', () => {
      bg.setFillStyle(0x4CAF50);
      onClick();
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(0x4CAF50);
    });

    return btn;
  }
}
