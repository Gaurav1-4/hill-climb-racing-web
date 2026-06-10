import Phaser from 'phaser';

export class CollectibleSystem {
  private scene: Phaser.Scene;
  private coins: Phaser.Physics.Matter.Sprite[] = [];
  private fuelPickups: Phaser.Physics.Matter.Sprite[] = [];
  
  private lastCoinSpawnX = 0;
  private lastFuelSpawnX = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public update(playerX: number, getSurfaceY: (x: number) => number) {
    // Spawn Coins
    if (playerX + 1000 > this.lastCoinSpawnX) {
      const spawnX = this.lastCoinSpawnX + Phaser.Math.Between(200, 400);
      const surfaceY = getSurfaceY(spawnX);
      
      const rand = Math.random();
      let value = 1;
      let scale = 1.0;
      
      if (rand > 0.9) {
        value = 10;
        scale = 1.5;
      } else if (rand > 0.6) {
        value = 5;
        scale = 1.2;
      }

      this.spawnCoin(spawnX, surfaceY - 20, value, scale);
      this.lastCoinSpawnX = spawnX;
    }

    // Spawn Fuel
    if (playerX + 1000 > this.lastFuelSpawnX) {
      const spawnX = this.lastFuelSpawnX + Phaser.Math.Between(1500, 2500);
      const surfaceY = getSurfaceY(spawnX);
      
      this.spawnFuel(spawnX, surfaceY - 10);
      this.lastFuelSpawnX = spawnX;
    }

    // Cleanup old items
    this.cleanupCoins(playerX);
    this.cleanupFuel(playerX);
  }

  private spawnCoin(x: number, y: number, value: number, scale: number) {
    const coin = this.scene.matter.add.sprite(x, y, 'clean_coin', undefined, {
      isSensor: true,
      isStatic: true,
      label: 'coin'
    });
    coin.setScale(scale);
    // Store value in data
    coin.setData('value', value);
    this.coins.push(coin);

    // Add floating animation (bobbing gently just above the ground)
    this.scene.tweens.add({
      targets: coin,
      y: y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private spawnFuel(x: number, y: number) {
    const fuel = this.scene.matter.add.sprite(x, y - 20, 'clean_fuel', undefined, {
      isSensor: true,
      isStatic: true,
      label: 'fuel'
    });
    fuel.setScale(0.8);
    this.fuelPickups.push(fuel);

    // Add floating animation (bobbing gently just above the ground)
    this.scene.tweens.add({
      targets: fuel,
      y: y - 30,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private cleanupCoins(playerX: number) {
    const cleanupThreshold = playerX - 1000;
    this.coins = this.coins.filter(coin => {
      if (!coin.active || coin.x < cleanupThreshold) {
        if (coin.active) {
          coin.destroy();
        }
        return false;
      }
      return true;
    });
  }

  private cleanupFuel(playerX: number) {
    const cleanupThreshold = playerX - 1000;
    this.fuelPickups = this.fuelPickups.filter(fuel => {
      if (!fuel.active || fuel.x < cleanupThreshold) {
        if (fuel.active) {
          fuel.destroy();
        }
        return false;
      }
      return true;
    });
  }
}
