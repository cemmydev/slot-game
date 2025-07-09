import { GameObjects, Scene } from 'phaser';

export default class Button extends GameObjects.Sprite {
  private disabled: boolean;

  constructor(scene: Scene, x: number, y: number, atlas: string, sprite: string) {
    super(scene, x, y, atlas, sprite);

    scene.add.existing(this);
    
    this.setInteractive();
    this.disabled = false;
    
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
    this.setTint(0x464646);
    this.disabled = true;
  }

  public enable(): void {
    this.clearTint();
    this.disabled = false;
  }
}
