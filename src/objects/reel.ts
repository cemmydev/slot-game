import { GameObjects, Scene } from 'phaser';
import { GameConfig } from '../config';
import Slot, { SlotConfig } from './slot';

interface ReelConfig {
  width: number;
  height: number;
  slotsCount: number;
  speed: number;
  slotSize: number;
}

export default class Reel extends GameObjects.Container {
  public override scene: Scene;
  private slotSize: number;
  private slotsCount: number;
  private speed: number;
  private stopDelay: number;
  private updSlotCount: number;
  private slowdown: boolean;
  private resultSlots: (string | number)[];
  public result: string[];
  private rotating!: Phaser.Time.TimerEvent;

  constructor(scene: Scene, x: number, y: number, config: ReelConfig, slots: SlotConfig) {
    super(scene, x, y - config.height / 2);

    this.scene = scene;
    scene.add.existing(this);

    this._init(scene, config, slots);
  }

  private _init(scene: Scene, config: ReelConfig, slots: SlotConfig): void {
    this.slotSize = config.slotSize;
    this.slotsCount = config.slotsCount;
    this.speed = config.speed;
    this.stopDelay = config.stopDelay;

    this.updSlotCount = 0;
    this.slowdown = false;
    this.resultSlots = [];
    this.result = [];

    this.setSize(config.width, config.height);        

    this._createMask(scene);
    this._fillWithSlots(scene, config.slotsCount, slots);
  }

  private _createMask(scene: Scene): void {
    const shape = scene.make.graphics();
    shape.fillRect(this.x, this.y, this.width, this.height);
    const mask = shape.createGeometryMask();        
    this.setMask(mask);
  }

  private _fillWithSlots(scene: Scene, count: number, slots: SlotConfig): void {
    const x = this.width / 2;
    const y = this.slotSize;
    for (let i = 0; i <= count; i++) {
      this.add(new Slot(scene, x, y * i, slots));
    }
  }

  private _move(slot: Slot): void {
    slot.y += this.speed;

    if (slot.y === this.slotSize * 4) {
      let updateVal: string | undefined;

      if (this.slowdown) {
        if (this.resultSlots[this.updSlotCount]) {
          updateVal = this.resultSlots[this.updSlotCount] as string;
        }
        
        this.updSlotCount++;
        
        if (this.updSlotCount > this.slotsCount) {
          this.rotating.remove();
          this.slowdown = false;
          this.updSlotCount = 0;
        }
      }

      this.result[this.updSlotCount] = slot.updateSlot(updateVal || null);
      slot.y = 0;
    }
  }
  
  public startSpin(): void {
    this.rotating = this.scene.time.addEvent({
      delay: 10,
      callback: this.spin,
      callbackScope: this,
      loop: true
    });
  }

  public spin(): void {
    this.iterate((slot: Slot) => this._move(slot));        
  }

  public stopSpin(resultSlots: (string | number)[], stopDelay: number): void {   
    this.resultSlots[0] = resultSlots[2] ? resultSlots[2] : 0;
    this.resultSlots[1] = resultSlots[1] ? resultSlots[1] : 0;
    this.resultSlots[2] = resultSlots[0] ? resultSlots[0] : 0;
    
    setTimeout(() => this.slowdown = true, stopDelay);
  }
}
