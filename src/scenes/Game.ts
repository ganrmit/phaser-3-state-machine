import Phaser from 'phaser'
import Player from '../entities/Player'

export default class StateDemo extends Phaser.Scene {
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  player!: Player

  constructor() {
    super('StateScene')
  }

  preload() {
    Player.preload(this)
  }

  create() {
    let platforms = this.physics.add.staticGroup()
    platforms.add(this.add.rectangle(150, 200, 1000, 20, 0xff0000))
    platforms.add(this.add.rectangle(0, 100, 20, 200, 0xff0000))

    this.player = new Player(this, 100, 100)
    this.physics.add.collider(this.player, platforms)
  }

  update(time: number, delta: number) {
    this.player.update(time, delta)
  }
}
