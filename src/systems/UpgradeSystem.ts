import { GameConfig } from '../config/GameConfig';
import { SaveSystem } from './SaveSystem';

export type UpgradeType = 'engine' | 'suspension' | 'grip' | 'fuelTank';

export class UpgradeSystem {
  public static getUpgradeLevel(type: UpgradeType): number {
    const data = SaveSystem.load();
    return data.upgrades[type];
  }

  public static getMaxLevel(): number {
    return 4; // 0 to 4 (5 levels)
  }

  public static getUpgradeCost(type: UpgradeType): number | null {
    const level = this.getUpgradeLevel(type);
    if (level >= this.getMaxLevel()) return null;
    
    // costs array length is 4 (for levels 0->1, 1->2, 2->3, 3->4)
    return GameConfig.economy.upgrades[type].costs[level];
  }

  public static purchaseUpgrade(type: UpgradeType): boolean {
    const cost = this.getUpgradeCost(type);
    if (cost === null) return false;

    const data = SaveSystem.load();
    if (data.coins >= cost) {
      data.coins -= cost;
      data.upgrades[type]++;
      SaveSystem.save(data);
      return true;
    }

    return false;
  }

  public static getCurrentStat(type: UpgradeType): number {
    const level = this.getUpgradeLevel(type);
    
    if (type === 'fuelTank') {
      return GameConfig.economy.upgrades.fuelTank.values[level];
    } else if (type === 'engine') {
      return GameConfig.vehicle.baseTorque * GameConfig.economy.upgrades.engine.multipliers[level];
    } else if (type === 'suspension') {
      return GameConfig.vehicle.baseSuspensionStiffness * GameConfig.economy.upgrades.suspension.multipliers[level];
    } else if (type === 'grip') {
      return GameConfig.vehicle.baseGrip * GameConfig.economy.upgrades.grip.multipliers[level];
    }
    return 0;
  }
}
