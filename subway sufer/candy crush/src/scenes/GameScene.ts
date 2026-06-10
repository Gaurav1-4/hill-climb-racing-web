import Phaser from 'phaser';
import { BoardSystem } from '../systems/BoardSystem';
import { MatchSystem } from '../systems/MatchSystem';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // Generate placeholder graphics for the tiles
    const graphics = this.make.graphics({ x: 0, y: 0 });

    const createPlaceholder = (key: string, color: number, shape: string) => {
      graphics.clear();
      graphics.fillStyle(color, 1);
      
      switch (shape) {
        case 'circle':
          graphics.fillCircle(40, 40, 36);
          break;
        case 'rect':
          graphics.fillRect(4, 4, 72, 72);
          break;
        case 'triangle':
          graphics.fillTriangle(40, 4, 4, 76, 76, 76);
          break;
        case 'star':
          // approximate a star or use a diamond
          graphics.beginPath();
          graphics.moveTo(40, 4);
          graphics.lineTo(50, 30);
          graphics.lineTo(76, 30);
          graphics.lineTo(55, 45);
          graphics.lineTo(63, 76);
          graphics.lineTo(40, 55);
          graphics.lineTo(17, 76);
          graphics.lineTo(25, 45);
          graphics.lineTo(4, 30);
          graphics.lineTo(30, 30);
          graphics.closePath();
          graphics.fillPath();
          break;
        case 'diamond':
          graphics.beginPath();
          graphics.moveTo(40, 4);
          graphics.lineTo(76, 40);
          graphics.lineTo(40, 76);
          graphics.lineTo(4, 40);
          graphics.closePath();
          graphics.fillPath();
          break;
      }
      
      graphics.generateTexture(key, 80, 80);
    };

    createPlaceholder('code', 0x3498db, 'rect');
    createPlaceholder('design', 0xe74c3c, 'circle');
    createPlaceholder('marketing', 0xf1c40f, 'triangle');
    createPlaceholder('sales', 0x2ecc71, 'diamond');
    createPlaceholder('funding', 0x9b59b6, 'star');
  }

  private board!: BoardSystem;
  private matchSystem!: MatchSystem;

  create() {
    this.scene.launch('UIScene');

    this.add.text(320, 40, 'Startup Crush', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Initialize systems
    this.board = new BoardSystem(this);
    this.matchSystem = new MatchSystem(this.board);

    this.board.onSwapAttempt = (t1, t2) => {
      this.matchSystem.trySwap(t1, t2);
    };

    this.board.initializeBoard();
  }

  update() {
    // Update loop
  }
}
