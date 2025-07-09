import { GameObjects, Scene } from 'phaser';
import { GameConfig } from '../config';

export default class PayTable extends GameObjects.Container {
  public override scene: Scene;
  private config: GameConfig['payTable'];
  private bg!: Phaser.GameObjects.Graphics;
  private tableSwitcher!: Phaser.GameObjects.BitmapText;

  constructor(scene: Scene, config: GameConfig['payTable']) {        
    super(scene, 0, 0);
    
    scene.add.existing(this);
    
    this.scene = scene;    
    this.config = config;    

    this._addText(config.text);
    this._addBG();
    this._addSwitcher();
  }

  private _addBG(): void {
    this.bg = this.scene.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.8} });
    const shape = new Phaser.Geom.Rectangle(0, 0, this.width, this.height);
    this.bg.fillRectShape(shape);
    this.add(this.bg);
    this.sendToBack(this.bg);
  }

  private _addText(textsArray: string[][]): void {
    const y = 30;
    let bmText: Phaser.GameObjects.BitmapText;
    
    textsArray.forEach((text: string[], i: number) => {
      this.add(
        bmText = this.scene.add.bitmapText(
          18,
          y + y * i,
          'freedom', text.join(' '), 20
        )
      );
      if (this.width < bmText.width) this.width = bmText.width;
      this.height = y + y * i;
    });
    this.setSize(this.width + 18 * 2, this.height + 18 * 2);
    this.y = -this.height;
  }

  private _addSwitcher(): void {        
    this.tableSwitcher = this.scene.add.bitmapText(
      15, 15, 'freedom', this.config.switcherText[0], 20
    )
    .setInteractive()
    .on('pointerdown', () => this.switch());
    this.tableSwitcher.input!.hitArea.setSize(106, 27);
  }

  public switch(): void {
    let blockPosY: number;
    let switcherPosX: number;
    
    if (this.y === 0) {
      blockPosY = -this.height;
      switcherPosX = 16;
      this.tableSwitcher.setText(this.config.switcherText[0]);
    } else {            
      blockPosY = 0;
      switcherPosX = this.width - 60;
      this.tableSwitcher.setText(this.config.switcherText[1]);
    }

    this.scene.tweens.add({
      targets: this,
      y: blockPosY,
      ease: 'Cubic',
      duration: 300,
      repeat: 0,
      yoyo: false
    });

    this.scene.tweens.add({
      targets: this.tableSwitcher,
      x: switcherPosX,
      ease: 'Cubic',
      duration: 300,
      repeat: 0,
      yoyo: false
    });
  }
}
