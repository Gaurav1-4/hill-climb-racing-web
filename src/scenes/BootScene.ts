import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.image('real_car', 'car.png');
    this.load.image('driver', 'driver.png');
    this.load.image('night_bg', 'night_bg_seamless.png');
    
    // Generate clean vector textures for everything else
    this.generateTextures();
  }

  create() {
    this.scene.start('MainMenuScene');
  }

  private generateTextures() {
    // Clear old textures
    const keys = ['clean_wheel', 'clean_coin', 'clean_fuel'];
    for (const key of keys) {
      if (this.textures.exists(key)) this.textures.remove(key);
    }

    const graphics = this.make.graphics({ x: 0, y: 0 }, false);

    // Wheel texture
    graphics.fillStyle(0x222222, 1);
    graphics.fillCircle(25, 25, 25);
    graphics.fillStyle(0x888888, 1);
    graphics.fillCircle(25, 25, 12);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(25, 25, 4);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(25, 17, 3);
    graphics.fillCircle(25, 33, 3);
    graphics.fillCircle(17, 25, 3);
    graphics.fillCircle(33, 25, 3);
    graphics.generateTexture('clean_wheel', 50, 50);
    graphics.clear();

    // Coin
    graphics.fillStyle(0xffaa00, 1);
    graphics.fillCircle(20, 20, 20);
    graphics.fillStyle(0xffd700, 1);
    graphics.fillCircle(20, 20, 16);
    graphics.fillStyle(0xffaa00, 1);
    graphics.fillCircle(20, 20, 10);
    graphics.generateTexture('clean_coin', 40, 40);
    graphics.clear();

    // Fuel Pickup
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRoundedRect(0, 5, 30, 35, 4);
    graphics.fillStyle(0xcc0000, 1);
    graphics.fillRect(5, 15, 20, 20);
    graphics.fillStyle(0x333333, 1);
    graphics.fillRect(10, 0, 10, 5);
    graphics.generateTexture('clean_fuel', 30, 40);
    graphics.clear();
  }
}
