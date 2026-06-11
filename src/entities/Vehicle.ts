import Phaser from 'phaser';
import { UpgradeSystem } from '../systems/UpgradeSystem';

export class Vehicle {
  public chassis: Phaser.Physics.Matter.Sprite;
  public backWheel: Phaser.Physics.Matter.Sprite;
  public frontWheel: Phaser.Physics.Matter.Sprite;

  // Stats
  private torque: number;
  private grip: number;
  private maxFuel: number;
  public currentFuel: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {

    // Load stats
    this.torque = UpgradeSystem.getCurrentStat('engine');
    const suspensionStiffness = UpgradeSystem.getCurrentStat('suspension');
    this.grip = UpgradeSystem.getCurrentStat('grip');
    this.maxFuel = UpgradeSystem.getCurrentStat('fuelTank');
    this.currentFuel = this.maxFuel;

    // Create Chassis (Using the new integrated jeep image)
    this.chassis = scene.matter.add.sprite(x, y - 60, 'real_car', undefined, {
      mass: 5,
      frictionAir: 0.05,
      collisionFilter: { group: -1 } // Prevent self-collision within the car
    });
    this.chassis.setScale(0.15); // Original is 1024x1024 -> ~154x154
    this.chassis.setDepth(10); // Bring chassis to front
    this.chassis.setFlipX(true); // Flip the image horizontally so it faces right

    // Create Wheels
    const wheelOptions: Phaser.Types.Physics.Matter.MatterBodyConfig = {
      mass: 2,
      friction: this.grip,
      restitution: 0.1,
      density: 0.05,
      collisionFilter: { group: -1, category: 1, mask: 1 },
      shape: { type: 'circle', radius: 25 } // Larger radius for monster truck
    };

    const wheelOffsetX = 45;
    const wheelOffsetY = 50;

    this.backWheel = scene.matter.add.sprite(x - wheelOffsetX, y + wheelOffsetY, 'clean_wheel', undefined, wheelOptions);
    this.frontWheel = scene.matter.add.sprite(x + wheelOffsetX, y + wheelOffsetY, 'clean_wheel', undefined, wheelOptions);

    // Make clean_wheel size match the massive static wheels on the monster truck chassis
    this.backWheel.setScale(1.2);
    this.frontWheel.setScale(1.2);
    this.backWheel.setDepth(11);
    this.frontWheel.setDepth(11);

    // Create Suspension (Springs)
    const springLength = 1; // Very short so it doesn't drop below the chassis visual
    const damping = 0.5;

    scene.matter.add.constraint(this.chassis.body as MatterJS.BodyType, this.backWheel.body as MatterJS.BodyType, springLength, suspensionStiffness, {
      pointA: { x: -wheelOffsetX, y: wheelOffsetY - 1 },
      damping: damping,
      render: { visible: false }
    });

    scene.matter.add.constraint(this.chassis.body as MatterJS.BodyType, this.frontWheel.body as MatterJS.BodyType, springLength, suspensionStiffness, {
      pointA: { x: wheelOffsetX, y: wheelOffsetY - 1 },
      damping: damping,
      render: { visible: false }
    });

    // Extra constraints to keep wheels from swinging too far
    scene.matter.add.constraint(this.chassis.body as MatterJS.BodyType, this.backWheel.body as MatterJS.BodyType, springLength + 5, suspensionStiffness * 0.5, {
      pointA: { x: -wheelOffsetX, y: wheelOffsetY - 10 },
      damping: damping,
      render: { visible: false }
    });

    scene.matter.add.constraint(this.chassis.body as MatterJS.BodyType, this.frontWheel.body as MatterJS.BodyType, springLength + 5, suspensionStiffness * 0.5, {
      pointA: { x: wheelOffsetX, y: wheelOffsetY - 10 },
      damping: damping,
      render: { visible: false }
    });
  }

  public accelerate() {
    if (this.currentFuel > 0) {
      const backBody = this.backWheel.body as MatterJS.BodyType;
      
      // Limit maximum wheel spin to restrict top speed and make it harder to climb steep hills without momentum
      const maxSpin = 0.6; 
      if (backBody.angularVelocity < maxSpin) {
        this.backWheel.setAngularVelocity(backBody.angularVelocity + this.torque);
      }
      
      // Slight rotation to chassis to simulate wheelie, reduced so it doesn't flip too easily
      const chassisBody = this.chassis.body as MatterJS.BodyType;
      this.chassis.setAngularVelocity(chassisBody.angularVelocity - this.torque * 0.2);
    }
  }

  public brake() {
    if (this.currentFuel > 0) {
      const backBody = this.backWheel.body as MatterJS.BodyType;
      const frontBody = this.frontWheel.body as MatterJS.BodyType;
      const chassisBody = this.chassis.body as MatterJS.BodyType;

      const maxReverseSpin = -0.6;
      if (backBody.angularVelocity > maxReverseSpin) {
        this.backWheel.setAngularVelocity(backBody.angularVelocity - this.torque);
        this.frontWheel.setAngularVelocity(frontBody.angularVelocity - this.torque);
      }
      
      this.chassis.setAngularVelocity(chassisBody.angularVelocity + this.torque * 0.2);
    }
  }

  public update(dt: number) {
    if (this.currentFuel > 0) {
      this.currentFuel -= 5 * (dt / 1000); // drain 5 fuel per second
      if (this.currentFuel < 0) this.currentFuel = 0;
    }
  }

  public getX(): number {
    return this.chassis.x;
  }

  public getY(): number {
    return this.chassis.y;
  }

  public addFuel(amount: number) {
    this.currentFuel += amount;
    if (this.currentFuel > this.maxFuel) {
      this.currentFuel = this.maxFuel;
    }
  }

  public getMaxFuel(): number {
    return this.maxFuel;
  }
}
