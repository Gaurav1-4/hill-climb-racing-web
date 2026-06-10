import Phaser from 'phaser';
import { Constants } from '../config/Constants';
import { GAME_WIDTH } from '../config/GameConfig';

export type PlayerState = 'RUNNING' | 'JUMPING' | 'SLIDING' | 'DEAD';

export class Player extends Phaser.GameObjects.Sprite {
    private currentLane: number = 0; // -1, 0, 1
    private currentState: PlayerState = 'RUNNING';
    
    public hitBox = { width: 40, height: 60 }; // Logical AABB bounding box
    private baseHitBoxHeight = 60;
    private slideHitBoxHeight = 30;
    
    private activeLaneTween: Phaser.Tweens.Tween | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        
        // Setup initial position
        this.updatePosition(0);
    }

    public moveLeft() {
        if (this.currentState === 'DEAD' || this.currentLane <= -1) return;
        this.currentLane--;
        this.switchLaneTween();
    }

    public moveRight() {
        if (this.currentState === 'DEAD' || this.currentLane >= 1) return;
        this.currentLane++;
        this.switchLaneTween();
    }

    public jump() {
        if (this.currentState !== 'RUNNING') return;
        this.currentState = 'JUMPING';

        // Two-part jump for arcade feel (fast up, gravity down)
        const halfDuration = Constants.PLAYER_JUMP_DURATION / 2;
        
        this.scene.tweens.add({
            targets: this,
            y: Constants.PLAYER_Y - Constants.PLAYER_JUMP_HEIGHT,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: halfDuration,
            ease: 'Quad.easeOut', // Quick burst up
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this,
                    y: Constants.PLAYER_Y,
                    scaleX: 1.0,
                    scaleY: 1.0,
                    duration: halfDuration,
                    ease: 'Quad.easeIn', // Accelerate down
                    onComplete: () => {
                        if (this.currentState !== 'DEAD') {
                            this.currentState = 'RUNNING';
                        }
                    }
                });
            }
        });
    }

    public slide() {
        if (this.currentState !== 'RUNNING') return;
        this.currentState = 'SLIDING';
        
        // Physically shrink the bounding box
        this.hitBox.height = this.slideHitBoxHeight;

        // Visual slide
        this.scene.tweens.add({
            targets: this,
            scaleY: 0.5,
            duration: Constants.PLAYER_JUMP_DURATION / 2,
            yoyo: true,
            ease: 'Sine.easeOut',
            onComplete: () => {
                if (this.currentState !== 'DEAD') {
                    this.currentState = 'RUNNING';
                    // Restore bounding box
                    this.hitBox.height = this.baseHitBoxHeight;
                }
            }
        });
    }

    public die() {
        this.currentState = 'DEAD';
        this.setTint(0xff0000); 
    }

    public getState() {
        return this.currentState;
    }

    public getLane() {
        return this.currentLane;
    }

    private switchLaneTween() {
        const targetX = (GAME_WIDTH / 2) + (this.currentLane * Constants.LANE_WIDTH);
        
        // Kill existing tween if swiping rapidly to prevent jitter
        if (this.activeLaneTween) {
            this.activeLaneTween.stop();
        }

        this.activeLaneTween = this.scene.tweens.add({
            targets: this,
            x: targetX,
            duration: Constants.PLAYER_LANE_SWITCH_DURATION,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.activeLaneTween = null;
            }
        });
    }

    private updatePosition(duration: number) {
        const targetX = (GAME_WIDTH / 2) + (this.currentLane * Constants.LANE_WIDTH);
        if (duration === 0) {
            this.x = targetX;
        } else {
            this.switchLaneTween();
        }
    }
}
