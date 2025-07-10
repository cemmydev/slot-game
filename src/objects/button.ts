import { GameObjects, Scene } from 'phaser';
import { eventManager, ButtonStateChangedEvent } from '../events';

export default class Button extends GameObjects.Sprite {
  public disabled: boolean;
  private buttonType: string;
  private buttonId: string;

  constructor(scene: Scene, x: number, y: number, atlas: string, sprite: string, buttonType: string = 'generic', buttonId?: string) {
    super(scene, x, y, atlas, sprite);

    scene.add.existing(this);

    this.setInteractive();
    this.disabled = false;
    this.buttonType = buttonType;
    this.buttonId = buttonId || `${buttonType}-${Date.now()}`;

    this.on('pointerdown', () => {
      if (!this.disabled) this.setScale(0.95);
    });
    this.on('pointerout', () => {
      this.setScale(1);
    });

    scene.input.on('pointerup', () => {
      this.setScale(1);
    });
  }

  public disable(): void {
    // Only emit event if state actually changes
    if (this.disabled) {
      return; // Already disabled
    }

    const previousState = 'enabled';
    this.setTint(0x464646);
    this.disabled = true;

    // Emit button state changed event
    eventManager.emit(new ButtonStateChangedEvent({
      buttonType: this.buttonType,
      buttonId: this.buttonId,
      previousState,
      newState: 'disabled'
    }));
  }

  public enable(): void {
    // Only emit event if state actually changes
    if (!this.disabled) {
      return; // Already enabled
    }

    const previousState = 'disabled';
    this.clearTint();
    this.disabled = false;

    // Emit button state changed event
    eventManager.emit(new ButtonStateChangedEvent({
      buttonType: this.buttonType,
      buttonId: this.buttonId,
      previousState,
      newState: 'enabled'
    }));
  }

  public getButtonType(): string {
    return this.buttonType;
  }

  public getButtonId(): string {
    return this.buttonId;
  }

  public isDisabled(): boolean {
    return this.disabled;
  }
}
