export default class Controls {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys

  constructor(scene: Phaser.Scene) {
    this.cursors = scene.input.keyboard.createCursorKeys()
  }

  // returns a value between -1.0 (fully left) and 1.0 (fully right)
  get stickX() {
    return (this.left.isDown ? -1 : 0) + (this.right.isDown ? 1 : 0)
  }

  get left() {
    return this.cursors.left
  }

  get right() {
    return this.cursors.right
  }

  get down() {
    return this.cursors.down
  }

  get jump() {
    return this.cursors.up
  }

  get attack() {
    return this.cursors.space
  }
}
