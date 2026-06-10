import Phaser from 'phaser';
import { GameConfig, type ResourceType } from '../core/GameConfig';
import { Tile } from '../entities/Tile';

export class BoardSystem {
  public grid: (Tile | null)[][];
  private scene: Phaser.Scene;
  private selectedTile: Tile | null = null;
  public onSwapAttempt?: (tile1: Tile, tile2: Tile) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.grid = Array(GameConfig.boardSize).fill(null).map(() => Array(GameConfig.boardSize).fill(null));
  }

  public initializeBoard() {
    for (let x = 0; x < GameConfig.boardSize; x++) {
      for (let y = 0; y < GameConfig.boardSize; y++) {
        let type: ResourceType;
        do {
          type = GameConfig.types[Math.floor(Math.random() * GameConfig.types.length)];
        } while (this.wouldCauseMatch(x, y, type));

        this.createTile(x, y, type);
      }
    }
  }

  private wouldCauseMatch(x: number, y: number, type: ResourceType): boolean {
    // Check horizontal
    if (x >= 2 && this.grid[x - 1][y]?.type === type && this.grid[x - 2][y]?.type === type) return true;
    // Check vertical
    if (y >= 2 && this.grid[x][y - 1]?.type === type && this.grid[x][y - 2]?.type === type) return true;
    return false;
  }

  public createTile(x: number, y: number, type: ResourceType): Tile {
    const tile = new Tile(this.scene, x, y, type);
    this.grid[x][y] = tile;

    tile.container.on('pointerdown', () => this.handleTileClick(tile));
    return tile;
  }

  private handleTileClick(tile: Tile) {
    if (!this.selectedTile) {
      this.selectedTile = tile;
      // Add visual feedback
      tile.sprite.setTint(0xcccccc);
    } else {
      const prevTile = this.selectedTile;
      this.selectedTile.sprite.clearTint();
      this.selectedTile = null;

      if (this.isAdjacent(prevTile, tile)) {
        if (this.onSwapAttempt) {
          this.onSwapAttempt(prevTile, tile);
        }
      } else {
        // If clicked elsewhere, just select the new tile
        if (prevTile !== tile) {
          this.selectedTile = tile;
          tile.sprite.setTint(0xcccccc);
        }
      }
    }
  }

  private isAdjacent(t1: Tile, t2: Tile): boolean {
    const dx = Math.abs(t1.gridX - t2.gridX);
    const dy = Math.abs(t1.gridY - t2.gridY);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  }

  public swapTiles(t1: Tile, t2: Tile, onComplete?: () => void) {
    const x1 = t1.gridX, y1 = t1.gridY;
    const x2 = t2.gridX, y2 = t2.gridY;

    this.grid[x1][y1] = t2;
    this.grid[x2][y2] = t1;

    let completed = 0;
    const checkComplete = () => {
      completed++;
      if (completed === 2 && onComplete) onComplete();
    };

    t1.moveTo(x2, y2, checkComplete);
    t2.moveTo(x1, y1, checkComplete);
  }

  public getTileAt(x: number, y: number): Tile | null {
    if (x < 0 || x >= GameConfig.boardSize || y < 0 || y >= GameConfig.boardSize) return null;
    return this.grid[x][y];
  }
}
