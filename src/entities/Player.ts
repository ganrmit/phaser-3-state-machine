// Attempt at making a class based player state machine with support for state's having their
// own state (... terminology is failing me here but for instance the WallClimb state can
// have its own counters to control animation etc)
//
// Check the bottom of this file for the actual state classes
export default class Player extends Phaser.Physics.Arcade.Sprite {
  readonly baseRunSpeed = 160
  readonly baseJumpHeight = 250

  controls: Phaser.Types.Input.Keyboard.CursorKeys
  pState: State

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
    this.controls = scene.input.keyboard.createCursorKeys()
    // Phaser has its own this.state so have to make a dumb name to keep TypeScript happy
    this.pState = new IdleState(this, this.controls)
  }

  update(time: number, delta: number) {
    let newState = this.pState.update()
    if (newState) {
      this.pState = newState
    }
  }
}

abstract class State {
  constructor(protected player: Player, protected controls: Phaser.Types.Input.Keyboard.CursorKeys) {}

  abstract update(): State | void

  // How do I make Typescript accept class implementations as a param?
  to(state: any): State {
    return new state(this.player, this.controls)
  }

  lookDirection() {
    if (this.controls.left.isDown) {
      this.player.setFlipX(true)
    } else if (this.controls.right.isDown) {
      this.player.setFlipX(false)
    } else {
      this.player.setVelocityX(0)
    }
  }
}

class IdleState extends State {
  constructor(player: Player, controls: Phaser.Types.Input.Keyboard.CursorKeys) {
    super(player, controls)
    player.anims.play('idle')
  }

  update() {
    this.lookDirection()
    if (Phaser.Input.Keyboard.JustDown(this.controls.up) && this.player.body.touching.down) {
      // I'm not sure this indirect construction is actually better
      // but it will allow me to do exit transitions easily... not sure.
      return this.to(JumpState)
    } else if (this.controls.left.isDown || this.controls.right.isDown) {
      return new RunState(this.player, this.controls)
    } else if (this.controls.down.isDown) {
      return new CrouchState(this.player, this.controls)
    }
  }
}

class RunState extends State {
  constructor(player: Player, controls: Phaser.Types.Input.Keyboard.CursorKeys) {
    super(player, controls)
    player.anims.play('run')
  }

  update() {
    this.lookDirection()
    if (this.controls.down.isDown) {
      return new SlideState(this.player, this.controls)
    } else if (Phaser.Input.Keyboard.JustDown(this.controls.up) && this.player.body.touching.down) {
      return new JumpState(this.player, this.controls)
    } else if (this.controls.left.isDown) {
      this.player.setVelocityX(-this.player.baseRunSpeed)
    } else if (this.controls.right.isDown) {
      this.player.setVelocityX(this.player.baseRunSpeed)
    } else {
      return new IdleState(this.player, this.controls)
    }
  }
}

class CrouchState extends State {
  constructor(player: Player, controls: Phaser.Types.Input.Keyboard.CursorKeys) {
    super(player, controls)
    player.anims.play('crouch')
  }

  update() {
    this.lookDirection()
    if (!this.controls.down.isDown) {
      return new IdleState(this.player, this.controls)
    } else if (this.controls.left.isDown) {
      this.player.setVelocityX(-this.player.baseRunSpeed)
      return this.to(SlideState)
    } else if (this.controls.right.isDown) {
      this.player.setVelocityX(this.player.baseRunSpeed)
      return this.to(SlideState)
    }
  }
}

class JumpState extends State {
  constructor(player: Player, controls: Phaser.Types.Input.Keyboard.CursorKeys) {
    super(player, controls)
    player.setVelocityY(-this.player.baseJumpHeight)
    player.anims.play('jump')
  }

  update() {
    this.lookDirection()
    if (this.controls.left.isDown) {
      this.player.setVelocityX(-this.player.baseRunSpeed)
    } else if (this.controls.right.isDown) {
      this.player.setVelocityX(this.player.baseRunSpeed)
    }
    if (Phaser.Input.Keyboard.JustDown(this.controls.up)) {
      return new DoublejumpState(this.player, this.controls)
    } else if (this.player.body.touching.down) {
      return new IdleState(this.player, this.controls)
    }
  }
}

class DoublejumpState extends State {
  constructor(player: Player, controls: Phaser.Types.Input.Keyboard.CursorKeys) {
    super(player, controls)
    player.setVelocityY(-this.player.baseJumpHeight)
    player.anims.play('smrslt')
  }

  update() {
    this.lookDirection()
    if (this.controls.left.isDown) {
      this.player.setVelocityX(-this.player.baseRunSpeed)
    } else if (this.controls.right.isDown) {
      this.player.setVelocityX(this.player.baseRunSpeed)
    }
    if (this.player.body.touching.down) {
      return new IdleState(this.player, this.controls)
    }
  }
}

class SlideState extends State {
  constructor(player: Player, controls: Phaser.Types.Input.Keyboard.CursorKeys) {
    super(player, controls)
    player.anims.play('slide')
  }

  update() {
    if (!this.controls.down.isDown) {
      return new IdleState(this.player, this.controls)
    }
  }
}