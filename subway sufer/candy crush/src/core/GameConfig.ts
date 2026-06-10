export const GameConfig = {
  boardSize: 8,
  tileSize: 80,
  colors: {
    code: 0x3498db, // Blue
    design: 0xe74c3c, // Red
    marketing: 0xf1c40f, // Yellow
    sales: 0x2ecc71, // Green
    funding: 0x9b59b6, // Purple
  },
  types: ['code', 'design', 'marketing', 'sales', 'funding'] as const,
  animationDuration: 200, // ms
};

export type ResourceType = typeof GameConfig.types[number];
export type SpecialType = 'none' | 'rocket_h' | 'rocket_v' | 'bomb' | 'investor';
