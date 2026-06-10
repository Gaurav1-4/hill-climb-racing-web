export interface SaveData {
  coins: number;
  bestDistance: number;
  upgrades: {
    engine: number;
    suspension: number;
    grip: number;
    fuelTank: number;
  };
}

export class SaveSystem {
  private static readonly SAVE_KEY = 'hcr_save_v1';

  private static defaultData: SaveData = {
    coins: 0,
    bestDistance: 0,
    upgrades: {
      engine: 0,
      suspension: 0,
      grip: 0,
      fuelTank: 0,
    },
  };

  public static load(): SaveData {
    const data = localStorage.getItem(this.SAVE_KEY);
    if (data) {
      try {
        return { ...this.defaultData, ...JSON.parse(data) };
      } catch (e) {
        console.error('Failed to parse save data', e);
        return { ...this.defaultData };
      }
    }
    return { ...this.defaultData };
  }

  public static save(data: SaveData): void {
    localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
  }

  public static addCoins(amount: number): void {
    const data = this.load();
    data.coins += amount;
    this.save(data);
  }

  public static updateBestDistance(distance: number): void {
    const data = this.load();
    if (distance > data.bestDistance) {
      data.bestDistance = Math.floor(distance);
      this.save(data);
    }
  }

  public static getCoins(): number {
    return this.load().coins;
  }
}
