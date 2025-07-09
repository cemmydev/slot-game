import { GameObjects, Scene } from 'phaser';
import { GameConfig } from '../config';
import DragSlot from './dragSlot';

interface DragSlotInterface {
  x: number;
  y: number;
  frame: { name: string | number };
  input: Phaser.Types.Input.InteractiveObject | null;
  reset(): void;
}

interface DropZone extends Phaser.GameObjects.Zone {
  previousSlot?: DragSlotInterface;
  reel: number;
  slot: number;
}

export default class DebugBar extends GameObjects.Container {
  public debugSlots: number[][];
  public override scene: Scene;
  private gameConfig: GameConfig;
  private config: GameConfig['debugBar'];
  private fixedMode: boolean;
  private tableSwitcher!: Phaser.GameObjects.BitmapText;
  private modeSwitcher!: Phaser.GameObjects.BitmapText;
  private dragSlots: DragSlot[];

  constructor(scene: Scene, config: GameConfig) {
    super(scene, 0, config.size.height);

    scene.add.existing(this as any);

    this.debugSlots = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

    this.scene = scene;  
    this.gameConfig = config;
    this.config = config.debugBar;
    this.fixedMode = false;
    this.dragSlots = [];
    
    this.setSize(this.config.width, this.config.height);

    this._addBG();
    this._addSwitchers();
    this._addSlotSelector();
    this._addDropZones();
  }

  private _addBG(): void {
    this.add( 
      this.scene.add.sprite(
        0, 0, 
        this.config.bg.atlas,
        this.config.bg.sprite)
        .setOrigin(0) 
    );
  }

  private _addSwitchers(): void {
    this.tableSwitcher = this.scene.add.bitmapText(
      15,
      this.gameConfig.size.height - 30,
      'freedom', 
      this.config.switcherText[0], 
      20
    )
    .setInteractive()
    .on('pointerup', () => this._showToggle());
    
    this.tableSwitcher.input!.hitArea.setSize(80, 27);

    this.modeSwitcher = this.scene.add.bitmapText(
      this.width / 2, 90, 'freedom', 
      this.config.switcherText[2] + ': ' + this.config.switcherText[3],
      20
    )
    .setOrigin(0.5)
    .setInteractive()
    .on('pointerup', () => this._switchMode());
    
    this.add(this.modeSwitcher);      
  }

  private _switchMode(): void {
    if (this.fixedMode) {
      this.fixedMode = false;
      this.modeSwitcher.setText(this.config.switcherText[2] + ': ' + this.config.switcherText[3]);
      this.resetSlotSelector();
    } else {
      this.fixedMode = true;
      this.modeSwitcher.setText(this.config.switcherText[2] + ': ' + this.config.switcherText[4]);
    }
  }

  private _showToggle(): void {
    let blockPosY: number;
    
    if (this.y === this.gameConfig.size.height) {
      blockPosY = this.gameConfig.size.height - this.height;
      this.tableSwitcher.setText(this.config.switcherText[1]);
    } else {            
      blockPosY = this.gameConfig.size.height;
      this.tableSwitcher.setText(this.config.switcherText[0]);
    }

    this.scene.tweens.add({
      targets: this,
      y: blockPosY,
      ease: 'Cubic',
      duration: 300,
      repeat: 0,
      yoyo: false
    });
  }

  private _addSlotSelector(): void {
    this.dragSlots = [];
    const slots = this.gameConfig.game.slots;
    
    slots.slotsList.forEach((sprite: string, i: number) => {
      for (let j = 0; j < this.gameConfig.game.machine.reelsCount; j++) {
        const dragSlot = new DragSlot(this.scene, 80 * i + 80, 40, slots, sprite as any);
        this.add(dragSlot);
        this.dragSlots.push(dragSlot);
      }
    });
  }

  public resetSlotSelector(): void {
    this.debugSlots = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    this.dragSlots.forEach((dragSlot: DragSlot) => dragSlot.reset());
  }

  private _addDropZones(): void {        
    this.config.dropZones.forEach((reel: number[][], i: number) => {
      reel.forEach((zone: number[], j: number) => {
        this._createDropZone(zone[0], this.height - zone[1], 40, i, j);
      });
    });

    this.scene.input.on('drag', function (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) {
      (gameObject as any).x = dragX;
      (gameObject as any).y = dragY;
    });

    this.scene.input.on('drop', (_pointer: Phaser.Input.Pointer, gameObject: DragSlot, dropZone: DropZone) => {
      gameObject.x = dropZone.x;
      gameObject.y = dropZone.y;

      if (dropZone.previousSlot) {
        dropZone.previousSlot.reset();
      }
      dropZone.previousSlot = gameObject;
      
      if (gameObject.frame.name) {
        this.fixedMode = true;
        this.modeSwitcher.setText(this.config.switcherText[2] + ': ' + this.config.switcherText[4]);
        this.debugSlots[dropZone.reel][dropZone.slot] = gameObject.frame.name as any;
      }
    });
    
    this.scene.input.on('dragend', function (_pointer: Phaser.Input.Pointer, gameObject: DragSlot, dropped: boolean) {
      if (!dropped) {
        gameObject.x = gameObject.input!.dragStartX;
        gameObject.y = gameObject.input!.dragStartY;
      }
    });
  }

  private _createDropZone(x: number, y: number, radius: number = 40, reel: number, slot: number): void {
    const zone = this.scene.add.zone(x, y, radius, radius).setCircleDropZone(radius) as DropZone;
    zone.input!.dropZone = true;
    zone.reel = reel;
    zone.slot = slot;
    this.add(zone);

    //  Just a visual display of the drop zone
    // const graphics = this.scene.add.graphics();
    // graphics.lineStyle(2, 0xffff00);
    // graphics.strokeCircle(zone.x, zone.y, zone.input!.hitArea.radius);
    // this.add(graphics);
  }
}
