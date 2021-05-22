export default class Player extends Phaser.Physics.Arcade.Sprite {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys

  static preload(scene: Phaser.Scene) {
    scene.load.atlas('adventurer', 'assets/adventurer/adventurer.png', 'assets/adventurer/adventurer_atlas.json')
    scene.load.animation('adventurer_anim', 'assets/adventurer/adventurer_anim.json')
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'adventurer')
    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setCollideWorldBounds()
    this.setSize(12, 36)
    this.setGravityY(300)
    this.enterState('idle')

    this.cursors = scene.input.keyboard.createCursorKeys()
  }

  update(time: number, delta: number) {
    switch (this.state) {
      case 'idle':
        this.controllableStates()
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.body.touching.down) {
          this.setVelocityY(-250)
          this.enterState('jump')
        } else if (this.cursors.left.isDown || this.cursors.right.isDown) {
          this.enterState('run')
        } else if (this.cursors.down.isDown) {
          this.enterState('crouch')
        }
        break
      case 'run':
        this.controllableStates()
        if (this.cursors.down.isDown) {
          this.enterState('slide')
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.body.touching.down) {
          this.setVelocityY(-250)
          this.enterState('jump')
        } else if (this.cursors.left.isDown) {
          this.setVelocityX(-160)
        } else if (this.cursors.right.isDown) {
          this.setVelocityX(160)
        } else {
          this.enterState('idle')
        }
        break
      case 'crouch':
        this.controllableStates()
        if (!this.cursors.down.isDown) {
          this.enterState('idle')
        }
        break
      case 'jump':
        this.controllableStates()
        if (this.cursors.left.isDown) {
          this.setVelocityX(-160)
        } else if (this.cursors.right.isDown) {
          this.setVelocityX(160)
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
          this.setVelocityY(-250)
          this.enterState('doublejump')
        } else if (this.body.touching.down) {
          this.enterState('idle')
        }
        break
      case 'doublejump':
        this.controllableStates()
        if (this.cursors.left.isDown) {
          this.setVelocityX(-160)
        } else if (this.cursors.right.isDown) {
          this.setVelocityX(160)
        }
        if (this.body.touching.down) {
          this.enterState('idle')
        }
        break
      case 'slide':
        if (!this.cursors.down.isDown) {
          this.enterState('idle')
        }
        break
    }
  }

  controllableStates() {
    if (this.cursors.left.isDown) {
      this.setFlipX(true)
    } else if (this.cursors.right.isDown) {
      this.setFlipX(false)
    } else {
      this.setVelocityX(0)
    }
  }

  enterState(state: string) {
    this.state = state
    switch (state) {
      case 'idle':
        this.anims.play('idle')
        break
      case 'run':
        this.anims.play('run')
        break
      case 'crouch':
        this.anims.play('crouch')
        break
      case 'jump':
        this.anims.play('jump')
        break
      case 'doublejump':
        this.anims.play('smrslt')
        break
      case 'slide':
        this.anims.play('slide')
        break
    }
  }
}
