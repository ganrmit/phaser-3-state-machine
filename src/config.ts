import Phaser from 'phaser'

export default {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#33A5E7',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      // debug: true,
    },
  },
  render: {
    pixelArt: true
  },
  scale: {
    width: 300,
    height: 200,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
}
