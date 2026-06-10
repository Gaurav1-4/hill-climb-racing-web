import Phaser from 'phaser';
import { useStore } from '../data/StateStore';
import { GameConfig } from '../core/GameConfig';

export class UIScene extends Phaser.Scene {
  private movesText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private resourcesText!: Record<string, Phaser.GameObjects.Text>;
  private statusText!: Phaser.GameObjects.Text;

  constructor() {
    super('UIScene');
  }

  create() {
    this.movesText = this.add.text(20, 20, 'Moves: 0', { fontSize: '24px', color: '#fff' });
    this.scoreText = this.add.text(20, 50, 'Score: 0', { fontSize: '24px', color: '#fff' });
    
    this.resourcesText = {};
    let y = 80;
    GameConfig.types.forEach(type => {
      this.resourcesText[type] = this.add.text(20, y, `${type}: 0`, { fontSize: '20px', color: '#ccc' });
      y += 30;
    });

    this.statusText = this.add.text(320, 480, '', { fontSize: '64px', color: '#ff0', fontStyle: 'bold' }).setOrigin(0.5);

    // Objective display
    this.add.text(450, 20, 'Objectives:', { fontSize: '24px', color: '#fff' });
    
    useStore.subscribe(state => {
      this.movesText.setText(`Moves: ${state.movesLeft}`);
      this.scoreText.setText(`Score: ${state.score}`);
      
      GameConfig.types.forEach(type => {
        const current = state.resources[type];
        const obj = state.objectives[type];
        let text = `${type.toUpperCase()}: ${current}`;
        if (obj) {
          text += ` / ${obj}`;
          this.resourcesText[type].setColor(current >= obj ? '#0f0' : '#ccc');
        }
        this.resourcesText[type].setText(text);
      });

      if (state.status === 'won') {
        this.statusText.setText('YOU WIN!');
      } else if (state.status === 'lost') {
        this.statusText.setText('OUT OF MOVES');
        this.statusText.setColor('#f00');
      } else {
        this.statusText.setText('');
      }
    });
  }
}
