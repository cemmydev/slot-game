import { Scene } from 'phaser';
import { GameConfig } from '../config';
import Reel from './reel.js';

// Define interfaces for better type safety
interface PayTableConfig {
  combinationOf3: {
    [key: string]: number[];
  };
  onlyThisSlotsCombination: [string[], number][];
}

interface ReelInterface {
  startSpin(): void;
  stopSpin(resultSlots: (string | number)[], stopDelay: number): void;
  result: string[];
}

export default class Machine {
  private config: GameConfig['game']['machine'];
  private scene: Scene;
  public x: number;
  public y: number;
  private reelsCount: number;
  private payTable: PayTableConfig;
  private reels: ReelInterface[];
  private result: string[][];
  private winLines: number[];
  public locked: boolean;
  public winSum: number;
  private resultSlots: (string | number)[][];

  constructor(scene: Scene, x: number, y: number, config: GameConfig['game'], payTable: PayTableConfig) {        
    this.config = config.machine;
    this.scene = scene;

    this.x = x - this.config.width / 2;
    this.y = y - this.config.height / 2;

    this.reelsCount = this.config.reelsCount;
    this.payTable = payTable;
    this.reels = [];
    this.result = [[], [], []];
    this.winLines = [];
    this.locked = false;
    this.winSum = 0;
    this.resultSlots = [];

    this._addElements(scene, config);
  }
  
  private _addElements(scene: Scene, config: GameConfig['game']): void {        
    scene.add.sprite(
      this.x + this.config.width + 70, 
      this.y + 70, 
      this.config.atlasName, 
      this.config.sprites.right)
      .setOrigin(0.5);            

    scene.add.sprite(
      this.x + 15, 
      this.y + this.config.height - 35, 
      this.config.atlasName, 
      this.config.sprites.left)
      .setOrigin(0.5);

    scene.add.sprite(
      this.x, this.y, 
      this.config.atlasName, 
      this.config.sprites.bottom)
      .setOrigin(0);

    this._fillWithReels(scene, this.reelsCount, config);    
    
    scene.add.sprite(
      this.x, this.y, 
      this.config.atlasName, 
      this.config.sprites.top)
      .setOrigin(0);
  }

  private _fillWithReels(scene: Scene, count: number, config: GameConfig['game']): void {
    let x = this.x + this.config.reelsFirstOffset;
    const y = this.y + this.config.height / 2;
    
    for (let i = 0; i < count; i++) {
      if (i) x += (config.reel.width + this.config.reelsOffset);
      this.reels.push(new Reel(scene, x, y, config.reel, config.slots) as ReelInterface);
    }
  }

  public startSpin(): void {
    this.locked = true;
    this.reels.forEach((reel: ReelInterface) => reel.startSpin());
    setTimeout(() => this._stopSpin(), this.config.stopDelay);
  }

  private _stopSpin(): void {
    setTimeout(() => this._finish(), 
      this.config.reelStopDelay * this.reels.length);

    this.reels.forEach((reel: ReelInterface, i: number) => 
      reel.stopSpin(this.resultSlots[i], this.config.reelStopDelay * i));
  }

  private _finish(): void {
    this.locked = false;
    this.reels.forEach((reel: ReelInterface, i: number) => {
      this.result[0][i] = reel.result[3];
      this.result[1][i] = reel.result[2];
      this.result[2][i] = reel.result[1];
    });

    this._checkWinCombinations();
  }

  private _checkWinCombinations(): void {
    this.winSum = 0;
    this.result.forEach((line: string[], i: number) => {
      if ((line[0] === line[1]) && (line[0] === line[2])) {                
        if (this.payTable.combinationOf3[line[0]]) {
          console.log(`${i} line win ${this.payTable.combinationOf3[line[0]][i]}`);
          this.winLines[i] = this.payTable.combinationOf3[line[0]][i];
          this.winSum += this.payTable.combinationOf3[line[0]][i];
          this._highlight(i);
        }
      } else {
        this.payTable.onlyThisSlotsCombination.forEach((combination: [string[], number], j: number) => {
          let win = true;

          if (combination[0].indexOf(line[0]) === -1) win = false;
          if (combination[0].indexOf(line[1]) === -1) win = false;
          if (combination[0].indexOf(line[2]) === -1) win = false;
          
          if (win) {
            console.log(`${i} line win ${this.payTable.onlyThisSlotsCombination[j][1]}`);
            this.winLines[i] = this.payTable.onlyThisSlotsCombination[j][1];
            this.winSum += this.payTable.onlyThisSlotsCombination[j][1];
            this._highlight(i);
          }
        });
      }
    });
  }

  private _highlight(line: number): void { 
    const y = this.y + 80;
    const height = 100;

    const graphics = this.scene.add.graphics({ 
      fillStyle: { color: 0xe41c27, alpha: 0.5 }, 
      lineStyle: { width: 5, color: 0xbc8b26 }
    });
    
    graphics.fillRoundedRect(
      this.x + 28,
      y + height * line,
      this.config.width - 60,
      10,
      5);
    
    this.scene.tweens.add({
      targets: graphics,
      alpha: 0.5,
      ease: 'Linear',
      duration: 500,
      repeat: 2,
      yoyo: true,
      onComplete: () => graphics.destroy()
    });
  }
  
  public setResultSlots(resultSlots: (string | number)[][]): void {
    this.resultSlots = resultSlots;
  }
}
