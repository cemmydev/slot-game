import { Scene } from 'phaser';

export default class BootScene extends Scene {
  constructor() { 
    super({ key: 'Boot' }); 
  }

  preload(): void {
    this.load.image('logo', './assets/logo.png');
  }

  create(): void {   
    this.scene.start('Preload');
  }
}
