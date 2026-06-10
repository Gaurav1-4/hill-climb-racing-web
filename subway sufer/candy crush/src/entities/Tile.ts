import Phaser from 'phaser';
import gsap from 'gsap';
import { GameConfig, type ResourceType, type SpecialType } from '../core/GameConfig';

export class Tile {
  public gridX: number;
  public gridY: number;
  public type: ResourceType;
  public specialType: SpecialType = 'none';
  public container: Phaser.GameObjects.Container;
  public sprite: Phaser.GameObjects.Sprite;
  public overlay: Phaser.GameObjects.Graphics;
  public scene: Phaser.Scene;
  public isMatched: boolean = false;

  constructor(scene: Phaser.Scene, gridX: number, gridY: number, type: ResourceType) {
    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.type = type;

    const { x, y } = this.getWorldPosition(gridX, gridY);
    this.container = scene.add.container(x, y);
    this.container.setSize(GameConfig.tileSize, GameConfig.tileSize);
    this.container.setInteractive();

    this.sprite = scene.add.sprite(0, 0, type);
    this.sprite.setOrigin(0.5);
    
    this.overlay = scene.add.graphics({ x: 0, y: 0 });
    
    this.container.add([this.sprite, this.overlay]);

    // Spawn animation
    this.container.scale = 0;
    gsap.to(this.container, {
      scale: 1,
      duration: GameConfig.animationDuration / 1000,
      ease: 'back.out(1.7)'
    });
  }

  public getWorldPosition(gridX: number, gridY: number): { x: number, y: number } {
    const startX = (640 - (GameConfig.boardSize * GameConfig.tileSize)) / 2 + GameConfig.tileSize / 2;
    const startY = 200 + GameConfig.tileSize / 2;
    return {
      x: startX + gridX * GameConfig.tileSize,
      y: startY + gridY * GameConfig.tileSize
    };
  }

  public moveTo(gridX: number, gridY: number, onComplete?: () => void) {
    this.gridX = gridX;
    this.gridY = gridY;
    const { x, y } = this.getWorldPosition(gridX, gridY);

    gsap.to(this.container, {
      x,
      y,
      duration: GameConfig.animationDuration / 1000,
      ease: 'power2.out',
      onComplete
    });
  }

  public setSpecial(type: SpecialType) {
    this.specialType = type;
    this.overlay.clear();
    this.overlay.lineStyle(4, 0xffffff, 1);
    
    if (type === 'rocket_h') {
      this.overlay.moveTo(-20, 0);
      this.overlay.lineTo(20, 0);
      this.overlay.strokePath();
    } else if (type === 'rocket_v') {
      this.overlay.moveTo(0, -20);
      this.overlay.lineTo(0, 20);
      this.overlay.strokePath();
    } else if (type === 'bomb') {
      this.overlay.strokeCircle(0, 0, 15);
    } else if (type === 'investor') {
      this.sprite.setTint(0xffffff);
      this.overlay.strokeRect(-15, -15, 30, 30);
    }
  }

  public destroy() {
    gsap.to(this.container, {
      scale: 0,
      alpha: 0,
      duration: GameConfig.animationDuration / 1000,
      ease: 'back.in(1.7)',
      onComplete: () => {
        this.container.destroy();
      }
    });
  }
}
