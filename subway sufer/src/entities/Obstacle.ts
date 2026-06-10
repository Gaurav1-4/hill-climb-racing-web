import Phaser from 'phaser';
import { Constants } from '../config/Constants';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

export type ObstacleType = 'BARRIER' | 'HIGH_BARRIER' | 'TRAIN';

export class Obstacle extends Phaser.GameObjects.Sprite {
    public active: boolean = false;
    public hitBox = { width: 0, height: 0, yOffset: 0 };
    
    public lane: number = 0; // -1, 0, 1
    public z: number = 0; // Pseudo-depth. 0 = horizon, 1 = bottom

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0, 'barrier'); // default texture
        scene.add.existing(this);
        this.setVisible(false);
    }

    public spawn(lane: number, type: ObstacleType) {
        this.active = true;
        this.lane = lane;
        this.z = 0;
        this.setVisible(true);

        switch(type) {
            case 'BARRIER':
                this.setTexture('barrier');
                this.hitBox = { width: 60, height: 40, yOffset: 0 };
                break;
            case 'HIGH_BARRIER':
                this.setTexture('high_barrier');
                this.hitBox = { width: 60, height: 80, yOffset: -40 }; // Elevated collision area
                break;
            case 'TRAIN':
                this.setTexture('train');
                this.hitBox = { width: 80, height: 150, yOffset: 0 };
                break;
        }
        
        this.updatePerspective();
    }

    public deactivate() {
        this.active = false;
        this.setVisible(false);
    }

    public updatePerspective() {
        const horizonY = Constants.HORIZON_Y;
        const bottomY = GAME_HEIGHT;
        
        // Non-linear depth scaling (objects get closer faster)
        const depthFactor = this.z * this.z;
        
        // Calculate Y position
        this.y = horizonY + (bottomY - horizonY) * depthFactor;

        // Calculate Scale
        const scale = 0.1 + (0.9 * depthFactor);
        this.setScale(scale);

        // Calculate X position with perspective spread
        const centerX = GAME_WIDTH / 2;
        const laneOffsetAtBottom = this.lane * Constants.LANE_WIDTH;
        
        // Spread lanes outward as they get closer
        this.x = centerX + (laneOffsetAtBottom * scale);

        // Adjust Y visually based on type (e.g. high barriers drawn higher up)
        this.y += this.hitBox.yOffset * scale;
    }
}
