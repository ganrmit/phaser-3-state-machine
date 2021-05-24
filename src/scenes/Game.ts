import Phaser from 'phaser'
import Player from '../entities/Player'

export default class StateDemo extends Phaser.Scene {
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  player!: Player
  movingPlatform!: Phaser.Physics.Arcade.Body

  constructor() {
    super('StateScene')
  }

  preload() {
    Player.preload(this)
  }

  create() {
    this.player = new Player(this, 100, 100)

    let platforms = this.physics.add.staticGroup()
    platforms.add(this.add.rectangle(150, 200, 300, 20, 0xff0000))
    platforms.add(this.add.rectangle(0, 100, 20, 200, 0xff0000))
    platforms.add(this.add.rectangle(300, 100, 20, 200, 0xff0000))
    this.physics.add.collider(this.player, platforms)

    // TODO: ask Clark about casting
    this.movingPlatform = this.physics.add.existing(this.add.rectangle(250, 120, 50, 7, 0x00ff00)).body as Phaser.Physics.Arcade.Body
    this.movingPlatform.setVelocityX(-50)
    this.movingPlatform.setImmovable(true)
    this.movingPlatform.allowGravity = false
    this.physics.add.collider(this.player, this.movingPlatform.gameObject)
  }

  update(time: number, delta: number) {
    this.player.update(time, delta)

    if (this.movingPlatform.x >= 200) {
      this.movingPlatform.setVelocityX(-50)
    } else if (this.movingPlatform.x <= 50) {
      this.movingPlatform.setVelocityX(50)
    }
  }
}
