import { BoardSystem } from './BoardSystem';
import { Tile } from '../entities/Tile';
import { GameConfig, type SpecialType } from '../core/GameConfig';
import { useStore } from '../data/StateStore';

interface MatchResult {
  tiles: Tile[];
  specialToSpawn?: { x: number, y: number, type: SpecialType, color: string };
}

export class MatchSystem {
  private board: BoardSystem;
  public isProcessing: boolean = false;

  constructor(board: BoardSystem) {
    this.board = board;
  }

  public async trySwap(t1: Tile, t2: Tile) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    // Perform swap
    await new Promise<void>(resolve => this.board.swapTiles(t1, t2, resolve));

    let matches = this.findMatches(t1, t2);
    
    // Check for special piece swap (e.g., rocket + bomb)
    // For MVP, we will just trigger them individually if they are matched, 
    // or trigger them immediately if swapped with another special? 
    // Wait, typical match-3: swapping two specials triggers a combo. 
    // If not doing combo for MVP, just trigger if matched.
    // Actually, let's just do standard match detection first.

    if (matches.length > 0) {
      useStore.decrementMove();
      await this.processMatches(matches);
    } else {
      // Check if we swapped a special piece that can be activated without a match
      // e.g., Investor Boost swapping with a normal tile destroys all of that color.
      if (t1.specialType === 'investor' || t2.specialType === 'investor') {
        useStore.decrementMove();
        const investor = t1.specialType === 'investor' ? t1 : t2;
        const target = t1.specialType === 'investor' ? t2 : t1;
        await this.activateInvestor(investor, target);
        await this.processMatches([]); // Continue with cascades
      } else {
        // Revert swap if no match
        await new Promise<void>(resolve => this.board.swapTiles(t1, t2, resolve));
        this.isProcessing = false;
      }
    }
  }

  private async activateInvestor(investor: Tile, target: Tile) {
    const targetType = target.type;
    const toDestroy = [investor];
    const size = GameConfig.boardSize;
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const t = this.board.grid[x][y];
        if (t && t.type === targetType && t !== target) {
          toDestroy.push(t);
        }
      }
    }
    toDestroy.push(target);
    await this.destroyTiles(toDestroy);
  }

  private findMatches(swapped1?: Tile, swapped2?: Tile): MatchResult[] {
    const grid = this.board.grid;
    const size = GameConfig.boardSize;
    const hLines: Tile[][] = [];
    const vLines: Tile[][] = [];

    // Horizontal check
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size - 2; x++) {
        let matchLen = 1;
        while (x + matchLen < size && grid[x][y]?.type === grid[x + matchLen][y]?.type && grid[x][y] !== null) {
          matchLen++;
        }
        if (matchLen >= 3) {
          const line = [];
          for (let i = 0; i < matchLen; i++) line.push(grid[x + i][y]!);
          hLines.push(line);
        }
        x += matchLen - 1;
      }
    }

    // Vertical check
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size - 2; y++) {
        let matchLen = 1;
        while (y + matchLen < size && grid[x][y]?.type === grid[x][y + matchLen]?.type && grid[x][y] !== null) {
          matchLen++;
        }
        if (matchLen >= 3) {
          const line = [];
          for (let i = 0; i < matchLen; i++) line.push(grid[x][y + i]!);
          vLines.push(line);
        }
        y += matchLen - 1;
      }
    }

    const results: MatchResult[] = [];
    const processed = new Set<Tile>();

    const allLines = [...hLines, ...vLines];
    
    // Group intersecting lines
    for (const line of allLines) {
      if (processed.has(line[0])) continue;

      const group = new Set<Tile>(line);
      let added = true;
      while (added) {
        added = false;
        for (const otherLine of allLines) {
          if (otherLine.some(t => group.has(t)) && !otherLine.every(t => group.has(t))) {
            otherLine.forEach(t => group.add(t));
            added = true;
          }
        }
      }

      group.forEach(t => processed.add(t));
      const groupArray = Array.from(group);

      let specialToSpawn: MatchResult['specialToSpawn'] = undefined;
      let targetTile = groupArray.find(t => t === swapped1 || t === swapped2) || groupArray[0];

      const hLen = hLines.find(l => group.has(l[0]))?.length || 0;
      const vLen = vLines.find(l => group.has(l[0]))?.length || 0;

      if (hLen >= 5 || vLen >= 5) {
        specialToSpawn = { x: targetTile.gridX, y: targetTile.gridY, type: 'bomb', color: targetTile.type };
      } else if (hLen >= 3 && vLen >= 3) {
        specialToSpawn = { x: targetTile.gridX, y: targetTile.gridY, type: 'investor', color: targetTile.type };
      } else if (hLen === 4) {
        specialToSpawn = { x: targetTile.gridX, y: targetTile.gridY, type: 'rocket_v', color: targetTile.type }; // Match horizontal creates vertical rocket
      } else if (vLen === 4) {
        specialToSpawn = { x: targetTile.gridX, y: targetTile.gridY, type: 'rocket_h', color: targetTile.type }; // Match vertical creates horizontal rocket
      }

      results.push({ tiles: groupArray, specialToSpawn });
    }

    return results;
  }

  private async processMatches(matches: MatchResult[]) {
    let toDestroy = new Set<Tile>();

    for (const match of matches) {
      match.tiles.forEach(t => toDestroy.add(t));
    }

    // Process specials triggering
    let processingSpecials = true;
    while (processingSpecials) {
      processingSpecials = false;
      const currentDestroy = Array.from(toDestroy);
      for (const tile of currentDestroy) {
        if (tile.specialType !== 'none') {
          const extraTiles = this.getSpecialDestruction(tile);
          for (const extra of extraTiles) {
            if (!toDestroy.has(extra)) {
              toDestroy.add(extra);
              processingSpecials = true;
            }
          }
          tile.specialType = 'none'; // prevent infinite loops
        }
      }
    }

    if (toDestroy.size > 0) {
      await this.destroyTiles(Array.from(toDestroy));

      // Spawn new special pieces
      for (const match of matches) {
        if (match.specialToSpawn) {
          const { x, y, type, color } = match.specialToSpawn;
          const newTile = this.board.createTile(x, y, color as any);
          newTile.setSpecial(type);
          // Don't animate spawn scale here as it's replacing
        }
      }

      await this.applyGravity();
      await this.fillEmptySpaces();

      const newMatches = this.findMatches();
      if (newMatches.length > 0) {
        await this.processMatches(newMatches);
      } else {
        this.isProcessing = false;
      }
    } else {
      this.isProcessing = false;
    }
  }

  private getSpecialDestruction(tile: Tile): Tile[] {
    const extras: Tile[] = [];
    const grid = this.board.grid;
    const size = GameConfig.boardSize;

    if (tile.specialType === 'rocket_h') {
      for (let x = 0; x < size; x++) {
        if (grid[x][tile.gridY]) extras.push(grid[x][tile.gridY]!);
      }
    } else if (tile.specialType === 'rocket_v') {
      for (let y = 0; y < size; y++) {
        if (grid[tile.gridX][y]) extras.push(grid[tile.gridX][y]!);
      }
    } else if (tile.specialType === 'bomb') {
      for (let x = Math.max(0, tile.gridX - 1); x <= Math.min(size - 1, tile.gridX + 1); x++) {
        for (let y = Math.max(0, tile.gridY - 1); y <= Math.min(size - 1, tile.gridY + 1); y++) {
          if (grid[x][y]) extras.push(grid[x][y]!);
        }
      }
    }
    return extras;
  }

  private async destroyTiles(tiles: Tile[]) {
    tiles.forEach(tile => {
      useStore.addResource(tile.type, 1);
      if (this.board.grid[tile.gridX][tile.gridY] === tile) {
        this.board.grid[tile.gridX][tile.gridY] = null;
      }
      tile.destroy();
    });

    await new Promise(r => setTimeout(r, GameConfig.animationDuration));
  }

  private async applyGravity() {
    const grid = this.board.grid;
    const size = GameConfig.boardSize;
    let moved = false;

    for (let x = 0; x < size; x++) {
      for (let y = size - 1; y >= 0; y--) {
        if (grid[x][y] === null) {
          // Find piece above
          for (let aboveY = y - 1; aboveY >= 0; aboveY--) {
            const tile = grid[x][aboveY];
            if (tile) {
              grid[x][y] = tile;
              grid[x][aboveY] = null;
              tile.moveTo(x, y);
              moved = true;
              break;
            }
          }
        }
      }
    }

    if (moved) {
      await new Promise(r => setTimeout(r, GameConfig.animationDuration));
    }
  }

  private async fillEmptySpaces() {
    const grid = this.board.grid;
    const size = GameConfig.boardSize;
    let spawned = false;

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (grid[x][y] === null) {
          const type = GameConfig.types[Math.floor(Math.random() * GameConfig.types.length)];
          const tile = this.board.createTile(x, y, type);
          
          const { x: worldX, y: worldY } = tile.getWorldPosition(x, -1 - y);
          tile.container.setPosition(worldX, worldY);
          
          tile.moveTo(x, y);
          spawned = true;
        }
      }
    }

    if (spawned) {
      await new Promise(r => setTimeout(r, GameConfig.animationDuration));
    }
  }
}
