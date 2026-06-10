import Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { GameOverScene } from './scenes/GameOverScene';

const config = {
    ...GameConfig,
    scene: [BootScene, MenuScene, GameScene, UIScene, GameOverScene]
};

export const game = new Phaser.Game(config);
