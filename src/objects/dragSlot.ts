import { Scene } from 'phaser';
import Slot, { SlotConfig } from './slot';

export default class DragSlot extends Slot {
  private defaultX: number;
  private defaultY: number;

  constructor(scene: Scene, x: number, y: number, slots: SlotConfig, slot: string | null = null) {
    super(scene, x, y, slots, slot);
    this.setScale(0.5);
    this.setOrigin(0.5);

    this.defaultX = x;
    this.defaultY = y;

    this.setInteractive();
    this.scene.input.setDraggable(this);
  }

  public reset(): void {
    this.x = this.defaultX;
    this.y = this.defaultY;
  }
}
