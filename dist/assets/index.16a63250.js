import{P as t}from"./vendor.21f5455c.js";!function(t=".",s="__import__"){try{self[s]=new Function("u","return import(u)")}catch(i){const e=new URL(t,location),o=t=>{URL.revokeObjectURL(t.src),t.remove()};self[s]=t=>new Promise(((i,r)=>{const a=new URL(t,e);if(self[s].moduleMap[a])return i(self[s].moduleMap[a]);const n=new Blob([`import * as m from '${a}';`,`${s}.moduleMap['${a}']=m;`],{type:"text/javascript"}),l=Object.assign(document.createElement("script"),{type:"module",src:URL.createObjectURL(n),onerror(){r(new Error(`Failed to import: ${t}`)),o(l)},onload(){i(self[s].moduleMap[a]),o(l)}});document.head.appendChild(l)})),self[s].moduleMap={}}}("assets/");var s={type:t.AUTO,parent:"game",backgroundColor:"#33A5E7",physics:{default:"arcade",arcade:{gravity:{y:300}}},render:{pixelArt:!0},scale:{width:300,height:200,mode:t.Scale.FIT,autoCenter:t.Scale.CENTER_BOTH}};class i{constructor(t){this.cursors=t.input.keyboard.createCursorKeys()}get stickX(){return(this.left.isDown?-1:0)+(this.right.isDown?1:0)}get left(){return this.cursors.left}get right(){return this.cursors.right}get down(){return this.cursors.down}get jump(){return this.cursors.up}get attack(){return this.cursors.space}}class e extends Phaser.Physics.Arcade.Sprite{constructor(t,s,e){super(t,s,e,"adventurer"),this.baseRunSpeed=160,this.baseJumpVelocity=250,this.canDoubleJump=!0,t.add.existing(this),t.physics.add.existing(this),this.setCollideWorldBounds(),this.setSize(12,30),this.setGravityY(300),this.setDepth(100),this.controls=new i(t),this.currentState=new r(this,this.controls),this.lastState=this.currentState}static preload(t){t.load.atlas("adventurer","assets/adventurer/adventurer.png","assets/adventurer/adventurer_atlas.json"),t.load.animation("adventurer_anim","assets/adventurer/adventurer_anim.json")}update(t,s){let i=this.currentState.update();i&&(this.lastState=this.currentState,this.currentState=i)}againstSlide(){return this.body.onWall()&&(this.x<30||this.x>270)}}class o{constructor(t,s){this.player=t,this.controls=s}update(){}transition(t){return console.log(t.name),this.exit(),new t(this.player,this.controls)}lookDirection(){this.controls.left.isDown?this.player.setFlipX(!0):this.controls.right.isDown&&this.player.setFlipX(!1)}moveX(){this.player.setVelocityX(this.player.baseRunSpeed*this.controls.stickX)}exit(){}}class r extends o{constructor(t,s){super(t,s),t.anims.play("idle"),t.canDoubleJump=!0}update(){return this.lookDirection(),this.moveX(),Phaser.Input.Keyboard.JustDown(this.controls.jump)&&this.player.body.touching.down?this.transition(l):0!==this.controls.stickX?this.transition(a):this.controls.down.isDown?this.transition(n):this.controls.attack.isDown?this.transition(y):void 0}}class a extends o{constructor(t,s){super(t,s),t.anims.play("run"),t.canDoubleJump=!0}update(){return this.lookDirection(),this.moveX(),this.controls.down.isDown?this.transition(c):Phaser.Input.Keyboard.JustDown(this.controls.jump)&&this.player.body.touching.down?this.transition(l):this.player.body.touching.down?0===this.controls.stickX?this.transition(r):this.controls.attack.isDown?this.transition(y):void 0:this.transition(p)}}class n extends o{constructor(t,s){super(t,s),t.anims.play("crouch")}update(){return this.lookDirection(),this.moveX(),this.controls.down.isDown?0!==this.controls.stickX?this.transition(c):void 0:this.transition(r)}}class l extends o{constructor(t,s){super(t,s),t.setVelocityY(-this.player.baseJumpVelocity),t.anims.play("jump")}update(){return this.lookDirection(),this.moveX(),!this.player.anims.isPlaying&&this.player.body.velocity.y>0&&this.player.anims.play("fall"),Phaser.Input.Keyboard.JustUp(this.controls.jump)&&this.player.body.velocity.y<-100&&(this.player.body.velocity.y=-100),Phaser.Input.Keyboard.JustDown(this.controls.jump)?this.transition(h):this.player.body.touching.down?this.transition(r):this.player.againstSlide()?this.transition(u):void 0}}class h extends o{constructor(t,s){super(t,s),t.setVelocityY(-this.player.baseJumpVelocity),t.anims.play("smrslt"),t.canDoubleJump=!1}update(){return this.lookDirection(),this.moveX(),this.player.body.touching.down?this.transition(r):this.player.againstSlide()?this.transition(u):void 0}}class c extends o{constructor(t,s){super(t,s),t.anims.play("slide")}update(){return this.player.body.velocity.x*=.97,Math.abs(this.player.body.velocity.x)<10&&(this.player.body.velocity.x=0,this.player.anims.play("thumbs-up")),this.controls.down.isDown||this.player.body.touching.down?this.controls.down.isDown?void 0:this.transition(d):this.transition(p)}}class d extends o{constructor(t,s){super(t,s),t.anims.play("stand")}update(){if(!this.player.anims.isPlaying)return this.transition(r)}}class u extends o{constructor(t,s){super(t,s),t.anims.play("wall-slide"),this.wallLeft=this.player.body.touching.left,this.player.body.setMaxVelocityY(50)}update(){if(this.player.body.touching.down)return this.transition(r);if(0===this.controls.stickX||(this.wallLeft?this.controls.stickX<0:this.controls.stickX>0))this.player.setVelocityX(this.wallLeft?-10:10);else if(this.player.body.touching.none)return this.transition(p)}exit(){this.player.body.setMaxVelocityY(1/0)}}class p extends o{constructor(t,s){super(t,s),t.anims.play("fall")}update(){return this.lookDirection(),this.moveX(),this.player.body.touching.down?this.transition(r):Phaser.Input.Keyboard.JustDown(this.controls.jump)&&this.player.canDoubleJump?this.transition(h):void 0}}class y extends o{constructor(t,s){super(t,s),this.attackLevel=1,this.idleFrames=0,t.anims.play("attack1"),this.player.setVelocityX(0)}update(){if(this.lookDirection(),!this.player.anims.isPlaying)return 3===this.attackLevel||++this.idleFrames>15?this.transition(r):void(this.controls.attack.isDown&&(this.attackLevel++,this.idleFrames=0,2===this.attackLevel?this.player.anims.play("attack2"):3===this.attackLevel&&this.player.anims.play("attack3")))}}class m extends t.Scene{constructor(){super("StateScene")}preload(){e.preload(this)}create(){this.physics.world.setBoundsCollision(!0,!0,!1,!0),this.player=new e(this,100,100),this.createPlatforms()}update(t,s){this.player.update(t,s),this.movingPlatform.x>=200?this.movingPlatform.setVelocityX(-50):this.movingPlatform.x<=50&&this.movingPlatform.setVelocityX(50)}createPlatforms(){let t=this.physics.add.staticGroup();t.add(this.add.rectangle(150,200,300,20,16711680)),t.add(this.add.rectangle(300,100,20,200,16711680)),t.add(this.add.rectangle(0,100,20,200,16711680)),this.physics.add.collider(this.player,t),this.movingPlatform=this.physics.add.existing(this.add.rectangle(250,120,50,7,65280)).body,this.movingPlatform.setVelocityX(-50),this.movingPlatform.setImmovable(!0),this.movingPlatform.allowGravity=!1,this.physics.add.collider(this.player,this.movingPlatform.gameObject)}}new t.Game(Object.assign(s,{scene:[m]}));
