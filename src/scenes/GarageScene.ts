import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { UpgradeSystem, type UpgradeType } from '../systems/UpgradeSystem';

export class GarageScene extends Phaser.Scene {
  private coinsText!: Phaser.GameObjects.Text;

  constructor() {
    super('GarageScene');
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.cameras.main.setBackgroundColor('#2f4f4f');

    this.add.text(width / 2, 50, 'GARAGE', {
      fontSize: '40px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.coinsText = this.add.text(width - 20, 20, `Coins: ${SaveSystem.getCoins()}`, {
      fontSize: '28px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(1, 0);

    // Upgrade Panels
    const startY = 150;
    const spacingY = 90;

    this.createUpgradePanel(width / 2, startY, 'Engine', 'engine');
    this.createUpgradePanel(width / 2, startY + spacingY, 'Suspension', 'suspension');
    this.createUpgradePanel(width / 2, startY + spacingY * 2, 'Tire Grip', 'grip');
    this.createUpgradePanel(width / 2, startY + spacingY * 3, 'Fuel Tank', 'fuelTank');

    // Back Button
    const backBtn = this.add.container(width / 2, height - 60);
    const bg = this.add.rectangle(0, 0, 200, 50, 0x888888).setInteractive({ useHandCursor: true });
    const txt = this.add.text(0, 0, 'BACK', { fontSize: '24px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    backBtn.add([bg, txt]);

    bg.on('pointerdown', () => bg.setFillStyle(0x666666));
    bg.on('pointerup', () => this.scene.start('MainMenuScene'));
    bg.on('pointerout', () => bg.setFillStyle(0x888888));
  }

  private createUpgradePanel(x: number, y: number, name: string, type: UpgradeType) {
    const panel = this.add.container(x, y);

    // Background
    const bg = this.add.rectangle(0, 0, 600, 80, 0x000000, 0.5);
    panel.add(bg);

    // Name
    const nameText = this.add.text(-280, 0, name, { fontSize: '24px', color: '#ffffff' }).setOrigin(0, 0.5);
    panel.add(nameText);

    // Level
    const level = UpgradeSystem.getUpgradeLevel(type);
    const levelText = this.add.text(-100, -20, `Level: ${level + 1}`, { fontSize: '20px', color: '#aaaaaa' }).setOrigin(0, 0.5);
    panel.add(levelText);

    // Current & Next Value
    const currentValue = this.getDisplayValue(type, level);
    const nextValue = level < 4 ? this.getDisplayValue(type, level + 1) : 'MAX';
    const valueText = this.add.text(-100, 20, `Curr: ${currentValue} | Next: ${nextValue}`, { fontSize: '16px', color: '#88cc88' }).setOrigin(0, 0.5);
    panel.add(valueText);

    // Upgrade Button
    const cost = UpgradeSystem.getUpgradeCost(type);
    const btnBg = this.add.rectangle(200, 0, 160, 50, cost !== null ? 0x4CAF50 : 0x444444).setInteractive({ useHandCursor: cost !== null });
    const btnTextStr = cost !== null ? `${cost} Coins` : 'MAX';
    const btnText = this.add.text(200, 0, btnTextStr, { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    
    panel.add([btnBg, btnText]);

    if (cost !== null) {
      btnBg.on('pointerdown', () => btnBg.setFillStyle(0x388E3C));
      btnBg.on('pointerout', () => btnBg.setFillStyle(0x4CAF50));
      btnBg.on('pointerup', () => {
        btnBg.setFillStyle(0x4CAF50);
        if (UpgradeSystem.purchaseUpgrade(type)) {
          this.updatePanel(type, levelText, valueText, btnBg, btnText);
          this.coinsText.setText(`Coins: ${SaveSystem.getCoins()}`);
        } else {
          // Visual feedback for not enough coins
          this.cameras.main.shake(100, 0.005);
        }
      });
    }
  }

  private getDisplayValue(type: UpgradeType, level: number): string {
    if (type === 'fuelTank') {
      return [100, 125, 150, 175, 200][level].toString();
    }
    const mults = [100, 110, 120, 135, 150];
    return `${mults[level]}%`;
  }

  private updatePanel(type: UpgradeType, levelText: Phaser.GameObjects.Text, valueText: Phaser.GameObjects.Text, btnBg: Phaser.GameObjects.Rectangle, btnText: Phaser.GameObjects.Text) {
    const level = UpgradeSystem.getUpgradeLevel(type);
    levelText.setText(`Level: ${level + 1}`);
    
    const currentValue = this.getDisplayValue(type, level);
    const nextValue = level < 4 ? this.getDisplayValue(type, level + 1) : 'MAX';
    valueText.setText(`Curr: ${currentValue} | Next: ${nextValue}`);

    const cost = UpgradeSystem.getUpgradeCost(type);
    
    if (cost !== null) {
      btnText.setText(`${cost} Coins`);
    } else {
      btnText.setText('MAX');
      btnBg.setFillStyle(0x444444);
      btnBg.disableInteractive();
    }
  }
}
