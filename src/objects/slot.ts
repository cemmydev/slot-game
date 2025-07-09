import { GameObjects, Utils, Scene } from 'phaser';
import { GameConfig } from '../config';

export interface SlotConfig {
  atlasName: string;
  slotsList: string[];
}

export default class Slot extends GameObjects.Sprite {
  protected slots: string[];

  constructor(scene: Scene, x: number, y: number, slots: SlotConfig, slot: string | null = null) {
    super(scene, x, y, slots.atlasName);
    this._init(slots, slot);
  }

  private _init(slots: SlotConfig, slot: string | null): void {        
    this.setOrigin(0.5, 1);
    this.setScale(0.85);

    this.slots = slots.slotsList;

    this.update(slot);
  }

  public update(slot?: string | null): string {
    if (!slot) {
      slot = Utils.Array.GetRandom(this.slots);
    }
    this.setFrame(slot);
    return slot;
  }
}
