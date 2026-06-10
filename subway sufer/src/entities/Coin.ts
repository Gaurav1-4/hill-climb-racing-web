import Phaser from 'phaser';
import { Constants } from '../config/Constants';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

export class Coin extends Phaser.GameObjects.Sprite {
    public active: boolean = false;
    public hitBox = { width: 20, height: 20, yOffset: -20 }; // Slightly raised
    
    public lane: number = 0;
    public z: number = 0;
    
    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0, 'coin');
        scene.add.existing(this);
        this.setVisible(false);
    }

    public spawn(lane: number) {
        this.active = true;
        this.lane = lane;
        this.z = 0;
        this.setVisible(true);
        this.updatePerspective();
    }

    public deactivate() {
        this.active = false;
        this.setVisible(false);
    }

    public updatePerspective() {
        const horizonY = Constants.HORIZON_Y;
        const bottomY = GAME_HEIGHT;
        
        const depthFactor = this.z * this.z;
        this.y = horizonY + (bottomY - horizonY) * depthFactor;

        const scale = 0.1 + (0.9 * depthFactor);
        this.setScale(scale);

        const centerX = GAME_WIDTH / 2;
        const laneOffsetAtBottom = this.lane * Constants.LANE_WIDTH;
        
        this.x = centerX + (laneOffsetAtBottom * scale);
        this.y += this.hitBox.yOffset * scale;
    }
}
