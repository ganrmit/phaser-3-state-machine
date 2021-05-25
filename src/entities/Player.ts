// Attempt at making a class based player state machine with support for state's having their
// own state (... terminology is failing me here but for instance the WallClimb state can
// have its own counters to control animation etc)
// Check the bottom of this file for the actual state classes

import Controls from '../util/Controls'
import StopWatch from '../util/StopWatch'

// Notes for adding actual attacks soon
// Check out rectangle overlap https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Arcade.ArcadePhysics.html#overlapTiles__anchor
// https://labs.phaser.io/edit.html?src=src\physics\arcade\get%20bodies%20within%20rectangle.js example lab
// https://github.com/ourcade/phaser3-sword-swing-attack/blob/master/src/scenes/SwordAttackScene.ts

export default class Player extends Phaser.Physics.Arcade.Sprite {
  readonly baseRunSpeed = 160
  readonly baseJumpVelocity = 250

  controls: Controls
  currentState: State
  lastState: State
  canDoubleJump = true

  static preload(scene: Phaser.Scene) {
    scene.load.atlas('adventurer', 'assets/adventurer/adventurer.png', 'assets/adventurer/adventurer_atlas.json')
    scene.load.animation('adventurer_anim', 'assets/adventurer/adventurer_anim.json')
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'adventurer')
    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setCollideWorldBounds()
    this.setSize(12, 30)
    this.setGravityY(300)
    this.setDepth(100)
    this.controls = new Controls(scene)
    this.currentState = new IdleState(this, this.controls)
    this.lastState = this.currentState
  }

  update(time: number, delta: number) {
    let newState = this.currentState.update()
    if (newState) {
      this.lastState = this.currentState
      this.currentState = newState
    }
  }

  // Ugly hack until I figure out how I want to handle what walls are slideable
  againstSlide(): boolean {
    return (this.body as Phaser.Physics.Arcade.Body).onWall() && (this.x < 30 || this.x > 270)
  }
}

abstract class State {
  constructor(protected player: Player, protected controls: Controls) {}

  update(): State | void {}

  transition(klass: new (player: Player, controls: Controls) => State): State {
    console.log(klass.name)
    this.exit()
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

  exit() {}
}

class IdleState extends State {
  constructor(player: Player, controls: Controls) {
    super(player, controls)
    player.anims.play('idle')
    player.canDoubleJump = true
  }

  update() {
    this.lookDirection()
    this.moveX()
    if (Phaser.Input.Keyboard.JustDown(this.controls.jump) && this.player.body.touching.down) {
      return this.transition(JumpState)
    } else if (this.controls.stickX !== 0) {
      return this.transition(RunState)
    } else if (this.controls.down.isDown) {
      return this.transition(CrouchState)
    } else if (this.controls.attack.isDown) {
      return this.transition(AttackState)
    }
  }
}

class RunState extends State {
  constructor(player: Player, controls: Controls) {
    super(player, controls)
    player.anims.play('run')
    player.canDoubleJump = true
  }

  update() {
    this.lookDirection()
    this.moveX()
    if (this.controls.down.isDown) {
      return this.transition(SlideState)
    } else if (Phaser.Input.Keyboard.JustDown(this.controls.jump) && this.player.body.touching.down) {
      return this.transition(JumpState)
    } else if (!this.player.body.touching.down) {
      return this.transition(FallState)
    } else if (this.controls.stickX === 0) {
      return this.transition(IdleState)
    } else if (this.controls.attack.isDown) {
      return this.transition(AttackState)
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
    player.setVelocityY(-this.player.baseJumpVelocity)
    player.anims.play('jump')
  }

  update() {
    this.lookDirection()
    this.moveX()
    if (!this.player.anims.isPlaying && this.player.body.velocity.y > 0) {
      // NOTE: this really should just transition but Falling + Wall slides will take some more effort.
      this.player.anims.play('fall')
    }
    if (Phaser.Input.Keyboard.JustUp(this.controls.jump) && this.player.body.velocity.y < -100) {
      this.player.body.velocity.y = -100
    }
    if (Phaser.Input.Keyboard.JustDown(this.controls.jump)) {
      return this.transition(DoublejumpState)
    } else if (this.player.body.touching.down) {
      return this.transition(IdleState)
    } else if (this.player.againstSlide()) {
      return this.transition(WallSlideState)
    }
  }
}

class DoublejumpState extends State {
  constructor(player: Player, controls: Controls) {
    super(player, controls)
    player.setVelocityY(-this.player.baseJumpVelocity)
    player.anims.play('smrslt')
    player.canDoubleJump = false
  }

  update() {
    this.lookDirection()
    this.moveX()
    if (this.player.body.touching.down) {
      return this.transition(IdleState)
    } else if (this.player.againstSlide()) {
      return this.transition(WallSlideState)
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
      this.player.anims.play('thumbs-up')
    } 
    if (!this.controls.down.isDown && !this.player.body.touching.down) {
      return this.transition(FallState)
    } else if (!this.controls.down.isDown) {
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
  wallLeft: boolean

  constructor(player: Player, controls: Controls) {
    super(player, controls)
    player.anims.play('wall-slide')
    this.wallLeft = this.player.body.touching.left
    ;(this.player.body as Phaser.Physics.Arcade.Body).setMaxVelocityY(50)
  }

  update() {
    if (this.player.body.touching.down) {
      return this.transition(IdleState)
    } else if (this.controls.stickX === 0 || (this.wallLeft ? this.controls.stickX < 0 : this.controls.stickX > 0)) {
      // Bias to hug the wall
      this.player.setVelocityX(this.wallLeft ? -10 : 10)
    } else if (this.player.body.touching.none) {
      return this.transition(FallState)
    }
  }

  exit() {
    (this.player.body as Phaser.Physics.Arcade.Body).setMaxVelocityY(Infinity)
  }
}

class FallState extends State {
  constructor(player: Player, controls: Controls) {
    super(player, controls)
    player.anims.play('fall')
  }

  update() {
    this.lookDirection()
    this.moveX()
    if (this.player.body.touching.down) {
      return this.transition(IdleState)
    } else if (Phaser.Input.Keyboard.JustDown(this.controls.jump) && this.player.canDoubleJump) {
      return this.transition(DoublejumpState)
    }
  }
}

class AttackState extends State {
  attackLevel = 1
  idleFrames = 0

  constructor(player: Player, controls: Controls) {
    super(player, controls)
    player.anims.play('attack1')
    this.player.setVelocityX(0)
  }

  update() {
    this.lookDirection()
    if (this.player.anims.isPlaying) {
      return
    } else if (this.attackLevel === 3 || ++this.idleFrames > 15) {
      return this.transition(IdleState)
    } else if (this.controls.attack.isDown) {
      this.attackLevel++
      this.idleFrames = 0
      if (this.attackLevel === 2) {
        this.player.anims.play('attack2')
      } else if (this.attackLevel === 3) {
        this.player.anims.play('attack3')
      }
    }
  }
}