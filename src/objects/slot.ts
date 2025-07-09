import { GameObjects, Utils, Scene } from 'phaser';

export interface SlotConfig {
  atlasName: string;
  slotsList: string[];
}

export default class Slot extends GameObjects.Sprite {
  protected slots!: string[];

  constructor(scene: Scene, x: number, y: number, slots: SlotConfig, slot: string | null = null) {
    super(scene, x, y, slots.atlasName);
    this._init(slots, slot);
  }

  private _init(slots: SlotConfig, slot: string | null): void {        
    this.setOrigin(0.5, 1);
    this.setScale(0.85);

    this.slots = slots.slotsList;

    this.updateSlot(slot);
  }

  public updateSlot(slot?: string | null): string {
    const selectedSlot = slot || Utils.Array.GetRandom(this.slots);
    this.setFrame(selectedSlot);
    return selectedSlot;
  }
}
