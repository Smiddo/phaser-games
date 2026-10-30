import { ControlKeys, JumpGameScene } from "../Game/game.playscene";

export class Player {
  private player: Phaser.GameObjects.Sprite;
  private body: Phaser.Physics.Arcade.Body;
  private lastVelocityX!: number;
  private canBump = true;
  private isJumping = false;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  constructor(private readonly scene: JumpGameScene) {
    this.player = this.createPlayer();

    scene.physics.add.existing(this.player);
    this.body = this.player.body as Phaser.Physics.Arcade.Body;
    this.body.setSize(180, 40).setOffset(35, 200);
    this.body.setDragX(2500);
    this.body.setCollideWorldBounds(true);
    this.lastVelocityX = this.body.velocity.x;

    this.particles = this.scene.add.particles(0, 0, "catParticle", {
      lifespan: 500,
      speed: { min: 150, max: 500 },
      angle: { min: 0, max: 360 },
      scale: { start: 2.5, end: 0 },
      alpha: { start: 1, end: 0.5 },
      color: [0xcb0ac4],
      emitting: false,
      quantity: 1,
    });

    this.particles.startFollow(this.player);
    this.particles.setDepth(200);
  }
  update(keys: ControlKeys) {
    this.handleJump(keys);
    this.handleHorizontalMovement(keys);

    this.handleWallBump(keys);
    this.ajustGravity();
    this.updateAnimation(keys);

    this.lastVelocityX = this.body.velocity.x;
  }

  private createPlayer() {
    const player = this.scene.add
      .sprite(
        this.scene.game.canvas.width / 2,
        this.scene.game.canvas.height - 175,
        "player",
        0,
      )
      .setScale(0.4)
      .setDepth(50);
    this.scene.anims.create({
      key: "walk",
      frames: this.scene.anims.generateFrameNumbers("player", {
        start: 0,
        end: 3,
      }),
      frameRate: 5,
      repeat: -1,
    });
    this.scene.anims.create({
      key: "jump",
      frames: this.scene.anims.generateFrameNumbers("player", {
        start: 4,
        end: 7,
      }),
      frameRate: 4,
    });

    player.on("animationcomplete-jump", () => {
      player.setFrame(0);
    });
    return player;
  }
  getBody() {
    return this.body;
  }

  private handleHorizontalMovement(keys: ControlKeys) {
    if (keys.right.isDown) {
      if (this.body.velocity.x < 0) {
        this.body.setAccelerationX(2000);
      } else this.body.setAccelerationX(500);
    } else if (keys.left.isDown) {
      if (this.body.velocity.x > 0) {
        this.body.setAccelerationX(-2000);
      } else this.body.setAccelerationX(-500);
    } else this.body.setAccelerationX(0);
  }

  private handleJump(keys: ControlKeys) {
    if (keys.jump.isDown && this.body.blocked.down) {
      this.body.setVelocityY(-550);
      this.isJumping = true;
    }
  }
  private handleWallBump(keys: ControlKeys) {
    const impactSpeed = Math.abs(this.lastVelocityX);

    if (!this.canBump || impactSpeed < 50) return;
    if (this.body.velocity.y > -25) return;

    if (
      Phaser.Input.Keyboard.DownDuration(keys.left, 500) &&
      this.body.blocked.right
    ) {
      this.body.setVelocity(-200, -impactSpeed);
      this.bump(impactSpeed);
      this.canBump = false;
      this.scene.gameEvents.emit("bump", impactSpeed);
    }
    if (
      Phaser.Input.Keyboard.DownDuration(keys.right, 500) &&
      this.body.blocked.left
    ) {
      this.body.setVelocity(200, -impactSpeed);
      this.bump(impactSpeed);
      this.canBump = false;
      this.scene.gameEvents.emit("bump", impactSpeed);
    }
  }
  private ajustGravity() {
    if (this.body.velocity.y > 0) {
      this.body.setGravityY(1500);
    } else {
      this.body.setGravityY(500);
    }
  }
  private updateAnimation(keys: ControlKeys) {
    if (this.isJumping) {
      this.player.anims.play("jump", true);
    }
    if (keys.left.isDown) {
      this.player.setFlipX(true);
      if (this.body.blocked.down && !this.isJumping)
        this.player.anims.play("walk", true);
      return;
    } else if (keys.right.isDown) {
      this.player.setFlipX(false);
      if (this.body.blocked.down && !this.isJumping)
        this.player.anims.play("walk", true);
    } else {
      if (
        Math.abs(this.body.velocity.x) < 5 &&
        this.player.anims.currentAnim?.key === "walk"
      ) {
        this.player.anims.stop();
        this.player.setFrame(0);
      }
    }
  }

  public landed() {
    this.canBump = true;
    this.isJumping = false;
  }

  private bump(impactSpeed: number) {
    if (impactSpeed > 750) {
      this.particles.setConfig({
        lifespan: 1000,
        speed: { min: 50, max: 500 },
        angle: { min: 0, max: 360 },
        scale: { start: 2.5, end: 0 },
        alpha: { start: 1, end: 0.5 },
        color: [0xcb0ac4, 0x6591e9, 0xf9ff00],
        emitting: false,
        quantity: 1,
      });
      this.particles.emitParticle(1200);
      return;
    }
    if (impactSpeed > 500) {
      this.particles.setConfig({
        lifespan: 750,
        speed: { min: 150, max: 300 },
        angle: { min: 0, max: 360 },
        scale: { start: 2.5, end: 0 },
        alpha: { start: 1, end: 0.5 },
        color: [0xcb0ac4, 0x6591e9],
        emitting: false,
        quantity: 1,
      });
      this.particles.emitParticle(600);
      return;
    } else {
      this.particles.setConfig({
        lifespan: 500,
        speed: { min: 150, max: 300 },
        angle: { min: 0, max: 360 },
        scale: { start: 2.5, end: 0 },
        alpha: { start: 1, end: 0.5 },
        color: [0xffffff],
        emitting: false,
        quantity: 1,
      });
      this.particles.emitParticle(300);
      return;
    }
  }
}
