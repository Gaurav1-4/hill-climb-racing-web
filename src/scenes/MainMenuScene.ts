import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Background
    this.cameras.main.setBackgroundColor('#87CEEB');

    // Title
    this.add.text(width / 2, height * 0.2, 'HILL CLIMB CLONE', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Stats
    const statsText = `Best Distance: ${SaveSystem.load().bestDistance}m\nTotal Coins: ${SaveSystem.getCoins()}`;
    this.add.text(width / 2, height * 0.4, statsText, {
      fontSize: '24px',
      color: '#ffff00',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Play Button
    this.createButton(width / 2, height * 0.6, 'PLAY', () => {
      this.scene.start('GameScene');
    });

    // Garage Button
    this.createButton(width / 2, height * 0.75, 'GARAGE', () => {
      this.scene.start('GarageScene');
    });
  }

  private createButton(x: number, y: number, text: string, onClick: () => void) {
    const btn = this.add.container(x, y);
    
    const bg = this.add.rectangle(0, 0, 200, 60, 0x4CAF50).setInteractive({ useHandCursor: true });
    bg.setStrokeStyle(4, 0x000000);
    
    const txt = this.add.text(0, 0, text, {
      fontSize: '28px',
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
