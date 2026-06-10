import Phaser from 'phaser';

export class HUD {
  private scene: Phaser.Scene;
  
  private fuelBarBg!: Phaser.GameObjects.Rectangle;
  private fuelBarFill!: Phaser.GameObjects.Rectangle;
  private distanceText!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;

  // Mobile controls
  public leftPedalDown = false;
  public rightPedalDown = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createUI();
  }

  private createUI() {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    // Fuel Bar
    this.scene.add.text(20, 20, 'FUEL', { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setScrollFactor(0);
    this.fuelBarBg = this.scene.add.rectangle(100, 30, 200, 20, 0x000000).setOrigin(0, 0.5).setScrollFactor(0);
    this.fuelBarBg.setStrokeStyle(2, 0xffffff);
    this.fuelBarFill = this.scene.add.rectangle(100, 30, 200, 20, 0xff0000).setOrigin(0, 0.5).setScrollFactor(0);

    // Distance
    this.distanceText = this.scene.add.text(width / 2, 30, '0m', { 
      fontSize: '28px', 
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0);

    // Coins
    this.coinsText = this.scene.add.text(width - 20, 30, 'Coins: 0', { 
      fontSize: '24px', 
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(1, 0.5).setScrollFactor(0);

    // Mobile Controls (Pedals)
    // Left Pedal (Brake/Reverse)
    const leftPedal = this.scene.add.rectangle(60, height - 60, 100, 100, 0xff0000, 0.3)
      .setScrollFactor(0)
      .setInteractive()
      .setDepth(100);
    
    this.scene.add.text(60, height - 60, 'BRAKE', { fontSize: '18px', color: '#fff' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);

    leftPedal.on('pointerdown', () => this.leftPedalDown = true);
    leftPedal.on('pointerup', () => this.leftPedalDown = false);
    leftPedal.on('pointerout', () => this.leftPedalDown = false);

    // Right Pedal (Gas)
    const rightPedal = this.scene.add.rectangle(width - 60, height - 60, 100, 100, 0x00ff00, 0.3)
      .setScrollFactor(0)
      .setInteractive()
      .setDepth(100);

    this.scene.add.text(width - 60, height - 60, 'GAS', { fontSize: '18px', color: '#fff' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);

    rightPedal.on('pointerdown', () => this.rightPedalDown = true);
    rightPedal.on('pointerup', () => this.rightPedalDown = false);
    rightPedal.on('pointerout', () => this.rightPedalDown = false);
  }

  public update(currentFuel: number, maxFuel: number, distance: number, currentRunCoins: number) {
    const fuelPercent = Math.max(0, currentFuel / maxFuel);
    this.fuelBarFill.width = 200 * fuelPercent;

    if (fuelPercent > 0.5) {
      this.fuelBarFill.setFillStyle(0x00ff00);
    } else if (fuelPercent > 0.2) {
      this.fuelBarFill.setFillStyle(0xffff00);
    } else {
      this.fuelBarFill.setFillStyle(0xff0000);
    }

    this.distanceText.setText(`${Math.floor(distance)}m`);
    this.coinsText.setText(`Coins: ${currentRunCoins}`);
  }
}
