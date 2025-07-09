import Phaser from 'phaser'
import BootScene from './scenes/boot'
import PreloadScene from './scenes/preload'
import GameScene from './scenes/game'
import {config} from './config'

let phaserConfig = config.phaser
phaserConfig.type = Phaser.AUTO
phaserConfig.scene = [BootScene, PreloadScene, GameScene]

// Modern Phaser 3 built-in scaling configuration
phaserConfig.scale = {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: config.size.width || 800,
    height: config.size.height || 600,
    min: {
        width: config.size.minWidth || 800,
        height: config.size.minHeight || 600
    },
    max: {
        width: 1920,
        height: 1080
    }
}

phaserConfig.banner = { hidePhaser: true }
new Phaser.Game(phaserConfig)