import { GameConfig, type ResourceType } from '../core/GameConfig';

export interface GameState {
  movesLeft: number;
  score: number;
  resources: Record<ResourceType, number>;
  objectives: Partial<Record<ResourceType | 'score', number>>;
  status: 'playing' | 'won' | 'lost';
}

type Listener = (state: GameState) => void;

class StateStore {
  private state: GameState;
  private listeners: Listener[] = [];

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): GameState {
    const resources = {} as Record<ResourceType, number>;
    GameConfig.types.forEach(t => resources[t] = 0);

    return {
      movesLeft: 20, // Default for vertical slice
      score: 0,
      resources,
      objectives: {
        code: 50,
        marketing: 30
      }, // Example objective for MVP
      status: 'playing'
    };
  }

  public subscribe(listener: Listener) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.state));
  }

  public getState() {
    return this.state;
  }

  public reset() {
    this.state = this.getInitialState();
    this.notify();
  }

  public addResource(type: ResourceType, amount: number) {
    if (this.state.status !== 'playing') return;
    this.state.resources[type] += amount;
    this.state.score += amount * 10;
    this.checkWinLoss();
    this.notify();
  }

  public decrementMove() {
    if (this.state.status !== 'playing') return;
    this.state.movesLeft--;
    this.checkWinLoss();
    this.notify();
  }

  private checkWinLoss() {
    let won = true;
    
    // Check if objectives are met
    if (this.state.objectives.score && this.state.score < this.state.objectives.score) won = false;
    
    GameConfig.types.forEach(type => {
      if (this.state.objectives[type] && this.state.resources[type] < this.state.objectives[type]!) {
        won = false;
      }
    });

    if (won) {
      this.state.status = 'won';
    } else if (this.state.movesLeft <= 0) {
      this.state.status = 'lost';
    }
  }
}

export const useStore = new StateStore();
