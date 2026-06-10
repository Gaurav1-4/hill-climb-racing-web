import Phaser from 'phaser';
import { Vehicle } from '../entities/Vehicle';
import { Terrain } from '../entities/Terrain';
import { CollectibleSystem } from '../systems/CollectibleSystem';
import { HUD } from '../ui/HUD';
import { SaveSystem } from '../systems/SaveSystem';
import { Background } from '../entities/Background';

export class GameScene extends Phaser.Scene {
  private vehicle!: Vehicle;
  private terrain!: Terrain;
  private collectibleSystem!: CollectibleSystem;
  private hud!: HUD;
  private background!: Background;

  private keys!: {
    A: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    LEFT: Phaser.Input.Keyboard.Key;
    RIGHT: Phaser.Input.Keyboard.Key;
  };

  private startX = 0;
  private currentDistance = 0;
  private currentCoins = 0;

  constructor() {
    super('GameScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#87CEEB');

    this.startX = 0;
    this.currentDistance = 0;
    this.currentCoins = 0;

    this.terrain = new Terrain(this);
    this.background = new Background(this);
    this.vehicle = new Vehicle(this, 100, 300);
    this.collectibleSystem = new CollectibleSystem(this);
    this.hud = new HUD(this);

    // Setup Camera
    this.cameras.main.startFollow(this.vehicle.chassis, false, 0.05, 0.05, -200, 100);
    this.cameras.main.setLerp(0.08, 0.08); // Extra smooth

    // Input
    if (this.input.keyboard) {
      this.keys = this.input.keyboard.addKeys('A,D,LEFT,RIGHT') as any;
    }

    // Collision events
    this.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA as MatterJS.BodyType;
        const bodyB = pair.bodyB as MatterJS.BodyType;

        const spriteA = bodyA.gameObject as Phaser.Physics.Matter.Sprite;
        const spriteB = bodyB.gameObject as Phaser.Physics.Matter.Sprite;

        if (!spriteA || !spriteB) return;

        // Check Collectibles
        this.checkCollectibleCollision(spriteA, spriteB);
        this.checkCollectibleCollision(spriteB, spriteA);
      });
    });
  }

  private checkCollectibleCollision(sensorSprite: Phaser.Physics.Matter.Sprite, vehiclePart: Phaser.Physics.Matter.Sprite) {
    if (!sensorSprite.body || !vehiclePart.body) return;
    
    // Ensure one body is part of the vehicle
    const isVehicle = vehiclePart === this.vehicle.chassis || 
                      vehiclePart === this.vehicle.frontWheel || 
                      vehiclePart === this.vehicle.backWheel;
    
    if (!isVehicle) return;

    if ((sensorSprite.body as MatterJS.BodyType).label === 'coin') {
      const value = sensorSprite.getData('value') || 1;
      this.currentCoins += value;
      sensorSprite.destroy();
    } else if ((sensorSprite.body as MatterJS.BodyType).label === 'fuel') {
      this.vehicle.addFuel(25);
      sensorSprite.destroy();
    }
  }

  update(_time: number, dt: number) {
    // Process input
    if ((this.keys && (this.keys.D.isDown || this.keys.RIGHT.isDown)) || this.hud.rightPedalDown) {
      this.vehicle.accelerate();
    }
    
    if ((this.keys && (this.keys.A.isDown || this.keys.LEFT.isDown)) || this.hud.leftPedalDown) {
      this.vehicle.brake();
    }

    this.vehicle.update(dt);
    
    const playerX = this.vehicle.getX();
    this.terrain.update(playerX);
    this.background.update(playerX);
    this.collectibleSystem.update(playerX, (x: number) => this.terrain.getSurfaceYAtX(x));

    // Update distance
    // Distance in meters: roughly 100 pixels = 1 meter
    const distPx = playerX - this.startX;
    this.currentDistance = Math.max(0, distPx / 100);

    // Update HUD
    this.hud.update(
      this.vehicle.currentFuel,
      this.vehicle.getMaxFuel(),
      this.currentDistance,
      this.currentCoins
    );

    // Game Over condition (Out of fuel and stopped moving)
    const chassisBody = this.vehicle.chassis.body as MatterJS.BodyType;
    const speed = Math.abs(chassisBody.velocity.x) + Math.abs(chassisBody.velocity.y);
    if (this.vehicle.currentFuel <= 0 && speed < 0.1) {
      this.triggerGameOver();
    }
  }

  private triggerGameOver() {
    SaveSystem.addCoins(this.currentCoins);
    SaveSystem.updateBestDistance(this.currentDistance);

    this.scene.start('GameOverScene', {
      distance: this.currentDistance,
      coinsEarned: this.currentCoins
    });
  }
}
