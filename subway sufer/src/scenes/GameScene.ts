import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { InputManager } from '../managers/InputManager';
import { SpawnManager } from '../managers/SpawnManager';
import { Constants } from '../config/Constants';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

export class GameScene extends Phaser.Scene {
    private player!: Player;
    private inputManager!: InputManager;
    private spawnManager!: SpawnManager;
    private trackGraphics!: Phaser.GameObjects.Graphics;
    
    // Pseudo-3D parameters
    private scrollOffset: number = 0;
    private speed: number = Constants.STARTING_SPEED;

    private debugText!: Phaser.GameObjects.Text;
    private showDebug: boolean = false;
    
    private coinsCollected: number = 0;

    constructor() {
        super('GameScene');
    }

    create() {
        // Setup background track lines
        this.trackGraphics = this.add.graphics();

        // Create player
        const centerX = GAME_WIDTH / 2;
        this.player = new Player(this, centerX, Constants.PLAYER_Y);

        // Create managers
        this.inputManager = new InputManager(this);
        this.inputManager.onLeft = () => this.player.moveLeft();
        this.inputManager.onRight = () => this.player.moveRight();
        this.inputManager.onUp = () => this.player.jump();
        this.inputManager.onDown = () => this.player.slide();
        
        this.spawnManager = new SpawnManager(this);

        // Setup Debug Overlay
        this.debugText = this.add.text(10, 10, '', {
            fontSize: '14px',
            color: '#00ff00',
            backgroundColor: '#00000088',
            padding: { x: 5, y: 5 }
        });
        this.debugText.setDepth(100);
        this.debugText.setVisible(this.showDebug);

        this.input.keyboard?.on('keydown-BACKTICK', () => {
            this.showDebug = !this.showDebug;
            this.debugText.setVisible(this.showDebug);
        });
    }

    update(_time: number, delta: number) {
        if (this.player.getState() === 'DEAD') return;

        // Scroll the track visually
        this.scrollOffset += (this.speed * (delta / 1000));
        if (this.scrollOffset > 100) {
            this.scrollOffset %= 100;
        }
        this.drawTracks();

        // Update objects
        this.spawnManager.update(delta, this.speed);
        
        // Increase speed slightly over time
        this.speed += delta * 0.005;

        this.checkCollisions();

        // Update Debug Text
        if (this.showDebug) {
            const activeObs = this.spawnManager.obstacles.filter(o => o.active).length;
            const activeCoins = this.spawnManager.coins.filter(c => c.active).length;
            this.debugText.setText([
                `FPS: ${Math.round(this.game.loop.actualFps)}`,
                `State: ${this.player.getState()}`,
                `Lane: ${this.player.getLane()}`,
                `Speed: ${Math.round(this.speed)}`,
                `Hitbox: ${this.player.hitBox.width}x${this.player.hitBox.height}`,
                `Active Obs: ${activeObs}`,
                `Active Coins: ${activeCoins}`,
                `Coins Collected: ${this.coinsCollected}`
            ]);
        }
    }

    private checkCollisions() {
        const pLane = this.player.getLane();
        const pY = this.player.y;
        
        // Calculate player's logical bounds
        // Since anchor is center, y ranges from y - height/2 to y + height/2
        const pTop = pY - (this.player.hitBox.height / 2);
        const pBottom = pY + (this.player.hitBox.height / 2);

        // Check Obstacles
        for (const obs of this.spawnManager.obstacles) {
            if (!obs.active) continue;
            
            // Only check collision if in the same lane and object is near the player (z between 0.8 and 1.1)
            // z=1.0 is exactly at player bottom
            if (obs.lane === pLane && obs.z > 0.8 && obs.z < 1.1) {
                // Determine obstacle logical vertical bounds based on its visual y position
                const oTop = obs.y - (obs.hitBox.height / 2);
                const oBottom = obs.y + (obs.hitBox.height / 2);
                
                // AABB overlap check on Y axis
                if (pTop < oBottom && pBottom > oTop) {
                    this.triggerGameOver();
                    return; // Stop checking further
                }
            }
        }

        // Check Coins
        for (const coin of this.spawnManager.coins) {
            if (!coin.active) continue;
            
            if (coin.lane === pLane && coin.z > 0.85 && coin.z < 1.05) {
                const cTop = coin.y - (coin.hitBox.height / 2);
                const cBottom = coin.y + (coin.hitBox.height / 2);
                
                if (pTop < cBottom && pBottom > cTop) {
                    coin.deactivate();
                    this.coinsCollected++;
                }
            }
        }
    }

    private triggerGameOver() {
        this.player.die();
        this.speed = 0;
        
        // Shake camera for impact
        this.cameras.main.shake(300, 0.02);
        
        this.time.delayedCall(1000, () => {
            this.scene.start('GameOverScene', { score: this.coinsCollected });
        });
    }

    private drawTracks() {
        this.trackGraphics.clear();
        this.trackGraphics.lineStyle(2, 0x444444, 1);

        const centerX = GAME_WIDTH / 2;
        const horizonY = Constants.HORIZON_Y;
        const bottomY = GAME_HEIGHT;

        // Draw lane dividers converging at horizon
        const leftDividerX = centerX - (Constants.LANE_WIDTH / 2);
        const rightDividerX = centerX + (Constants.LANE_WIDTH / 2);

        this.trackGraphics.beginPath();
        
        // Left divider
        this.trackGraphics.moveTo(centerX, horizonY);
        this.trackGraphics.lineTo(leftDividerX, bottomY);

        // Right divider
        this.trackGraphics.moveTo(centerX, horizonY);
        this.trackGraphics.lineTo(rightDividerX, bottomY);

        this.trackGraphics.strokePath();

        // Draw horizontal moving lines to simulate speed
        this.trackGraphics.lineStyle(1, 0x333333, 1);
        for (let i = 0; i < 10; i++) {
            // Non-linear spacing for perspective
            let yFactor = ((i * 100 + this.scrollOffset) % 1000) / 1000; 
            // Square it for simple depth effect (objects get closer faster)
            let depthFactor = yFactor * yFactor; 
            
            let yPos = horizonY + (bottomY - horizonY) * depthFactor;
            
            // Width also depends on depth
            let widthFactor = depthFactor;
            let currentWidth = GAME_WIDTH * widthFactor;

            this.trackGraphics.beginPath();
            this.trackGraphics.moveTo(centerX - currentWidth/2, yPos);
            this.trackGraphics.lineTo(centerX + currentWidth/2, yPos);
            this.trackGraphics.strokePath();
        }
    }
}
