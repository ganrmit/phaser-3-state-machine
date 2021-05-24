// Attempt at making a class based player state machine with support for state's having their
// own state (... terminology is failing me here but for instance the WallClimb state can
// have its own counters to control animation etc)
// Check the bottom of this file for the actual state classes

import Controls from '../util/Controls'
import StopWatch from '../util/StopWatch'

export default class Player extends Phaser.Physics.Arcade.Sprite {
  readonly baseRunSpeed = 160
  readonly baseJumpHeight = 250

  controls: Controls
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
    this.controls = new Controls(scene)
    // Phaser has its own this.state so have to make a dumb name to keep TypeScript happy
    this.pState = new IdleState(this, this.controls)

    // @ts-ignore dev variable
    window.player = this
  }

  update(time: number, delta: number) {
    let newState = this.pState.update()
    if (newState) {
      this.pState = newState
    }
  }
}

abstract class State {
  constructor(protected player: Player, protected controls: Controls) {}

  abstract update(): State | void

  // Is this how to make Typescript accept class implementations as a param?
  transition(klass: new (player: Player, controls: Controls) => State): State {
    console.log(klass.name)
    return new klass(this.player, this.controls)
  }

  lookDirection() {
    if (this.controls.left.isDown) {
      this.player.setFlipX(true)
    } else if (this.controls.right.isDown) {
      this.player.setFlipX(false)
    }
  }

  moveX() {
    this.player.setVelocityX(this.player.baseRunSpeed * this.controls.stickX)
  }
}

class IdleState extends State {
  constructor(player: Player, controls: Controls) {
    super(player, controls)
    player.anims.play('idle')
  }

  update() {
    this.lookDirection()
    this.moveX()
    if (Phaser.Input.Keyboard.JustDown(this.controls.jump) && this.player.body.touching.down) {
      // I'm not sure this indirect construction is actually better
      // but it will allow me to do exit transitions easily... not sure if worth.
      return this.transition(JumpState)
    } else if (this.controls.stickX !== 0) {
      return this.transition(RunState)
    } else if (this.controls.down.isDown) {
      return this.transition(CrouchState)
    }
  }
}

class RunState extends State {
  constructor(player: Player, controls: Controls) {
    super(player, controls)
    player.anims.play('run')
  }

  update() {
    this.lookDirection()
    this.moveX()
    if (this.controls.down.isDown) {
      return this.transition(SlideState)
    } else if (Phaser.Input.Keyboard.JustDown(this.controls.jump) && this.player.body.touching.down) {
      return this.transition(JumpState)
    } else if (this.controls.stickX === 0) {
      return this.transition(IdleState)
    }
  }
}

class CrouchState extends State {
  constructor(player: Player, controls: Controls) {
    super(player, controls)
    player.anims.play('crouch')
  }

  update() {
    this.lookDirection()
    this.moveX()
    if (!this.controls.down.isDown) {
      return this.transition(IdleState)
    } else if (this.controls.stickX !== 0) {
      return this.transition(SlideState)
    }
  }
}

class JumpState extends State {
  constructor(player: Player, controls: Controls) {
    super(player, controls)
    player.setVelocityY(-this.player.baseJumpHeight)
    player.anims.play('jump')
  }

  update() {
    if (!this.player.anims.isPlaying && this.player.body.velocity.y > 0) {
      this.player.anims.play('fall')
    }
    this.lookDirection()
    this.moveX()
    if (Phaser.Input.Keyboard.JustDown(this.controls.jump)) {
      return this.transition(DoublejumpState)
    } else if (this.player.body.touching.down) {
      return this.transition(IdleState)
    } else if (this.player.body.touching.left || this.player.body.touching.right) {
      return this.transition(WallSlideState)
    }
  }
}

class DoublejumpState extends State {
  stopWatch: StopWatch

  constructor(player: Player, controls: Controls) {
    super(player, controls)
    player.setVelocityY(-this.player.baseJumpHeight)
    player.anims.play('smrslt')
    this.stopWatch = new StopWatch()
  }

  update() {
    this.lookDirection()
    this.moveX()
    if (this.player.body.touching.down) {
      return this.transition(IdleState)
    }
  }
}

class SlideState extends State {
  constructor(player: Player, controls: Controls) {
    super(player, controls)
    player.anims.play('slide')
  }

  update() {
    this.player.body.velocity.x *= 0.97
    if (Math.abs(this.player.body.velocity.x) < 10) {
      this.player.body.velocity.x = 0
    }
    if (!this.controls.down.isDown) {
      return this.transition(StandState)
    }
  }
}

class StandState extends State {
  constructor(player: Player, controls: Controls) {
    super(player, controls)
    player.anims.play('stand')
  }

  update() {
    if (!this.player.anims.isPlaying) {
      return this.transition(IdleState)
    }
  }
}

class WallSlideState extends State {
  constructor(player: Player, controls: Controls) {
    super(player, controls)
    player.anims.play('wall-slide')
    // Next time on Dragon Ball Z! I will make a wallside variable up here.
    // Then the player can only double jump away if they press jump AND the opposite direction.
    // Then I'll need a timer or something on the double jump state to make sure it can't transition back in... or I could just make double jump never transition to this?
  }

  update() {
    if (this.player.body.touching.down) {
      return this.transition(IdleState)
    }
  }
}
