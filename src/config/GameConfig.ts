export const GameConfig = {
  width: 800,
  height: 600,
  physics: {
    gravity: { x: 0, y: 1.5 },
    collisionCategories: {
      terrain: 0x0001,
      vehicle: 0x0002,
      sensor: 0x0004,
    },
  },
  terrain: {
    segmentWidth: 200,
    segmentCount: 20, // number of segments to keep in memory ahead
    amplitude: 150,
    frequency: 0.005,
    cleanupDistance: 1000,
  },
  vehicle: {
    baseFuel: 100,
    baseTorque: 0.02,
    baseSuspensionStiffness: 0.2,
    baseGrip: 0.8,
    fuelConsumptionRate: 5, // fuel per second
    fuelPickupAmount: 25,
  },
  economy: {
    coins: {
      small: 1,
      medium: 5,
      large: 10,
    },
    upgrades: {
      engine: {
        costs: [100, 250, 500, 1000],
        multipliers: [1, 1.1, 1.2, 1.35, 1.5], // 5 levels (index 0 is default)
      },
      suspension: {
        costs: [100, 250, 500, 1000],
        multipliers: [1, 1.1, 1.2, 1.35, 1.5],
      },
      grip: {
        costs: [100, 250, 500, 1000],
        multipliers: [1, 1.1, 1.2, 1.35, 1.5],
      },
      fuelTank: {
        costs: [100, 250, 500, 1000],
        values: [100, 125, 150, 175, 200], // Absolute values for fuel
      },
    },
  },
};
