import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.image('real_car', 'car.png');
    this.load.image('driver', 'driver.png');
    
    // Generate clean vector textures for everything else
    this.generateTextures();
  }

  create() {
    this.scene.start('MainMenuScene');
  }

  private generateTextures() {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);

    // Wheel texture (Dark grey tire, light grey rim, dots for rotation tracking)
    graphics.fillStyle(0x222222, 1);
    graphics.fillCircle(25, 25, 25);
    graphics.fillStyle(0x888888, 1);
    graphics.fillCircle(25, 25, 12);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(25, 25, 4);
    // Draw bolts to make rotation visible
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(25, 17, 3);
    graphics.fillCircle(25, 33, 3);
    graphics.fillCircle(17, 25, 3);
    graphics.fillCircle(33, 25, 3);
    graphics.generateTexture('clean_wheel', 50, 50);
    graphics.clear();

    // Coin (Beautiful gold coin with a rim)
    graphics.fillStyle(0xffaa00, 1);
    graphics.fillCircle(20, 20, 20);
    graphics.fillStyle(0xffd700, 1);
    graphics.fillCircle(20, 20, 16);
    graphics.fillStyle(0xffaa00, 1);
    graphics.fillCircle(20, 20, 10);
    graphics.generateTexture('clean_coin', 40, 40);
    graphics.clear();

    // Fuel Pickup (Red jerry can)
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRoundedRect(0, 5, 30, 35, 4);
    graphics.fillStyle(0xcc0000, 1);
    graphics.fillRect(5, 15, 20, 20); // label
    graphics.fillStyle(0x333333, 1);
    graphics.fillRect(10, 0, 10, 5); // nozzle
    graphics.generateTexture('clean_fuel', 30, 40);
    graphics.clear();

    this.generateBackgrounds();
  }

  private generateBackgrounds() {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);

    // Sky Gradient (just a tall solid color for now, light blue)
    graphics.fillStyle(0x87CEEB, 1);
    graphics.fillRect(0, 0, 1024, 1024);
    graphics.generateTexture('bg_sky', 1024, 1024);
    graphics.clear();

    // Mountains (distant, bluish with snow caps)
    for (let i = -100; i < 1100; i += 120 + Math.random() * 50) {
      const height = 1024 - 300 - Math.random() * 300; // random peak height
      const width = 150 + Math.random() * 100;
      const peakX = i + width / 2;
      
      // Mountain Base
      graphics.fillStyle(0x3E5A74, 1);
      graphics.beginPath();
      graphics.moveTo(i, 1024);
      graphics.lineTo(peakX, height);
      graphics.lineTo(i + width, 1024);
      graphics.closePath();
      graphics.fillPath();

      // Snow Cap
      graphics.fillStyle(0xE0F7FA, 1); // Ice white
      graphics.beginPath();
      const snowDepth = 100; 
      const ratio = (width / 2) / (1024 - height);
      const dx = snowDepth * ratio;
      
      graphics.moveTo(peakX, height); // Peak
      graphics.lineTo(peakX - dx, height + snowDepth); // Left snow edge
      graphics.lineTo(peakX - dx/2, height + snowDepth + 20); // Jagged middle left
      graphics.lineTo(peakX + dx/2, height + snowDepth - 10); // Jagged middle right
      graphics.lineTo(peakX + dx, height + snowDepth); // Right snow edge
      graphics.closePath();
      graphics.fillPath();
    }
    graphics.generateTexture('bg_mountains', 1024, 1024);
    graphics.clear();

    // Hills (midground, light green)
    graphics.fillStyle(0x3E8E41, 1);
    graphics.beginPath();
    graphics.moveTo(0, 1024);
    for(let i=0; i<1024; i+=150) {
      graphics.lineTo(i + 75, 1024 - 250 - Math.random() * 100);
      graphics.lineTo(i + 150, 1024);
    }
    graphics.lineTo(1024, 1024);
    graphics.closePath();
    graphics.fillPath();
    graphics.generateTexture('bg_hills', 1024, 1024);
    graphics.clear();

    // Trees (foreground, beautiful multi-tiered pine trees)
    for (let i = 20; i < 1024; i += 80 + Math.random() * 60) {
      const trunkX = i;
      const trunkY = 1024 - 40;
      
      // Trunk
      graphics.fillStyle(0x5D4037, 1); // Dark brown
      graphics.fillRect(trunkX, trunkY, 16, 40);

      const center = trunkX + 8; // Center of the trunk
      
      // Bottom layer
      graphics.fillStyle(0x1B5E20, 1); // Dark green
      graphics.beginPath();
      graphics.moveTo(center - 40, trunkY);
      graphics.lineTo(center, trunkY - 80);
      graphics.lineTo(center + 40, trunkY);
      graphics.closePath();
      graphics.fillPath();
      
      // Middle layer
      graphics.fillStyle(0x2E7D32, 1); // Slightly lighter green
      graphics.beginPath();
      graphics.moveTo(center - 35, trunkY - 40);
      graphics.lineTo(center, trunkY - 130);
      graphics.lineTo(center + 35, trunkY - 40);
      graphics.closePath();
      graphics.fillPath();
      
      // Top layer
      graphics.fillStyle(0x388E3C, 1); // Lightest green
      graphics.beginPath();
      graphics.moveTo(center - 25, trunkY - 90);
      graphics.lineTo(center, trunkY - 180);
      graphics.lineTo(center + 25, trunkY - 90);
      graphics.closePath();
      graphics.fillPath();
    }
    graphics.generateTexture('bg_trees', 1024, 1024);
    graphics.clear();
  }
}
