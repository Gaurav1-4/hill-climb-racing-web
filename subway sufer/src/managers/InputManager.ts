import Phaser from 'phaser';

export class InputManager {
    private scene: Phaser.Scene;
    private swipeThreshold: number = 50;
    
    public onLeft: () => void = () => {};
    public onRight: () => void = () => {};
    public onUp: () => void = () => {};
    public onDown: () => void = () => {};

    private maxSwipeTime: number = 250;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.setupKeyboard();
        this.setupTouch();
    }

    private setupKeyboard() {
        const cursors = this.scene.input.keyboard?.createCursorKeys();
        
        if (cursors) {
            cursors.left.on('down', () => this.onLeft());
            cursors.right.on('down', () => this.onRight());
            cursors.up.on('down', () => this.onUp());
            cursors.down.on('down', () => this.onDown());
        }
    }

    private setupTouch() {
        this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            const swipeTime = pointer.upTime - pointer.downTime;
            const swipeX = pointer.upX - pointer.downX;
            const swipeY = pointer.upY - pointer.downY;

            if (swipeTime > this.maxSwipeTime) {
                return; // Dragged too slowly
            }

            if (Math.abs(swipeX) > Math.abs(swipeY)) {
                // Horizontal swipe
                if (Math.abs(swipeX) > this.swipeThreshold) {
                    if (swipeX > 0) {
                        this.onRight();
                    } else {
                        this.onLeft();
                    }
                }
            } else {
                // Vertical swipe
                if (Math.abs(swipeY) > this.swipeThreshold) {
                    if (swipeY > 0) {
                        this.onDown();
                    } else {
                        this.onUp();
                    }
                }
            }
        });
    }
}
