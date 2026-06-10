import Phaser from 'phaser';
import { Obstacle } from '../entities/Obstacle';
import type { ObstacleType } from '../entities/Obstacle';
import { Coin } from '../entities/Coin';

export class SpawnManager {
    private scene: Phaser.Scene;
    
    public obstacles: Obstacle[] = [];
    public coins: Coin[] = [];
    
    private timeSinceLastSpawn: number = 0;
    private spawnInterval: number = 1000; // ms
    private obstacleTypes: ObstacleType[] = ['BARRIER', 'HIGH_BARRIER', 'TRAIN'];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.initPools();
    }

    private initPools() {
        for (let i = 0; i < 20; i++) {
            this.obstacles.push(new Obstacle(this.scene));
        }
        for (let i = 0; i < 30; i++) {
            this.coins.push(new Coin(this.scene));
        }
    }

    public update(delta: number, speed: number) {
        // Z movement per second based on speed. Base speed 400 = ~0.5 z per sec
        const zSpeed = speed / 800; 

        // Update active objects
        this.obstacles.forEach(obs => {
            if (obs.active) {
                obs.z += zSpeed * (delta / 1000);
                obs.updatePerspective();
                
                if (obs.z > 1.2) { // Past the camera
                    obs.deactivate();
                }
            }
        });

        this.coins.forEach(coin => {
            if (coin.active) {
                coin.z += zSpeed * (delta / 1000);
                coin.updatePerspective();
                
                if (coin.z > 1.2) {
                    coin.deactivate();
                }
            }
        });

        // Spawn logic based on time and speed
        // The faster the speed, the shorter the spawn interval
        const currentSpawnInterval = this.spawnInterval * (400 / speed);
        
        this.timeSinceLastSpawn += delta;
        if (this.timeSinceLastSpawn >= currentSpawnInterval) {
            this.timeSinceLastSpawn = 0;
            this.spawnRow();
        }
    }

    private spawnRow() {
        const lane = Phaser.Math.Between(-1, 1);
        const rand = Phaser.Math.FloatBetween(0, 1);
        
        if (rand < 0.7) {
            this.spawnObstacle(lane);
        } else {
            this.spawnCoin(lane);
        }
        
        // Sometimes spawn a coin in another lane
        if (rand > 0.4) {
            const otherLane = lane === 0 ? (Math.random() > 0.5 ? 1 : -1) : 0;
            this.spawnCoin(otherLane);
        }
    }

    private spawnObstacle(lane: number) {
        const inactive = this.obstacles.find(o => !o.active);
        if (inactive) {
            const type = Phaser.Math.RND.pick(this.obstacleTypes);
            inactive.spawn(lane, type);
        }
    }

    private spawnCoin(lane: number) {
        const inactive = this.coins.find(c => !c.active);
        if (inactive) {
            inactive.spawn(lane);
        }
    }
}
