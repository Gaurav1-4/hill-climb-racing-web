import Phaser from 'phaser';

export class Background {
  private scene: Phaser.Scene;
  private bgImage!: Phaser.GameObjects.TileSprite;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const width = scene.scale.width;
    const height = scene.scale.height;

    // The image is 2048x420. Scale it so it fills the screen vertically.
    const scale = Math.max(1, height / 420);
    
    this.bgImage = scene.add.tileSprite(0, 0, width / scale, 420, 'night_bg')
      .setOrigin(0, 0)
      .setScale(scale)
      .setScrollFactor(0);

    // Set depth so it is behind terrain
    this.bgImage.setDepth(-10);
  }
  public update(playerX: number) {
    // Scroll the entire image slowly to simulate a distant background
    this.bgImage.tilePositionX = playerX * 0.15;
  }
}
