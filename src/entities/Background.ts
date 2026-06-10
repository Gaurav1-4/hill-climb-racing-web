import Phaser from 'phaser';

export class Background {
  private scene: Phaser.Scene;
  private bgSky!: Phaser.GameObjects.TileSprite;
  private bgMountains!: Phaser.GameObjects.TileSprite;
  private bgHills!: Phaser.GameObjects.TileSprite;
  private bgTrees!: Phaser.GameObjects.TileSprite;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const width = scene.scale.width;
    const height = scene.scale.height;

    // The sky fills the screen
    this.bgSky = scene.add.tileSprite(0, 0, width, height, 'bg_sky').setOrigin(0, 0).setScrollFactor(0);

    // Anchor mountains, hills, and trees to the bottom of the screen
    this.bgMountains = scene.add.tileSprite(0, height, width, 1024, 'bg_mountains').setOrigin(0, 1).setScrollFactor(0);
    this.bgHills = scene.add.tileSprite(0, height, width, 1024, 'bg_hills').setOrigin(0, 1).setScrollFactor(0);
    this.bgTrees = scene.add.tileSprite(0, height, width, 1024, 'bg_trees').setOrigin(0, 1).setScrollFactor(0);

    // Set depths so they are behind terrain
    this.bgSky.setDepth(-10);
    this.bgMountains.setDepth(-9);
    this.bgHills.setDepth(-8);
    this.bgTrees.setDepth(-7);
  }

  public update(playerX: number) {
    // Parallax scrolling
    this.bgMountains.tilePositionX = playerX * 0.1;
    this.bgHills.tilePositionX = playerX * 0.3;
    this.bgTrees.tilePositionX = playerX * 0.6;
  }
}
