import { PlatformManager } from "../Platforms/platform.manager";
import { Player } from "../Player/player";
import { Progression } from "../Progression/progression";
import { JumpScore } from "./game.score";

export interface ControlKeys {
  jump: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
}

export class JumpGameScene extends Phaser.Scene {
  private player!: Player;
  private controlKeys?: ControlKeys;
  private gameOver!: boolean;
  private platformManager!: PlatformManager;
  private progression!: Progression;
  public gameEvents!: Phaser.Events.EventEmitter;
  private gameRunning = false;

  preload() {
    this.load.spritesheet(
      "player",
      "jumpGame/Assets/mystic-cat-walk-jump-spritesheet.png",
      { frameWidth: 256, frameHeight: 256 },
    );
  }

  create() {
    this.gameEvents = new Phaser.Events.EventEmitter();
    new JumpScore(this.gameEvents);
    const graphics = this.add.graphics();

    graphics.fillStyle(0xfffaff);
    graphics.fillCircle(0, 0, 2);

    graphics.generateTexture("catParticle", 8, 8);
    graphics.destroy();

    this.showGameMenu();
  }
  update(time: number, delta: number): void {
    if (this.gameOver || !this.gameRunning) return;
    const dt = delta / 1000;
    this.player.update(this.controlKeys!);

    if (
      this.player.getBody().y <
      this.cameras.main.scrollY + this.cameras.main.height * 0.15
    ) {
      this.cameras.main.scrollY -= 700 * dt;
    } else {
      this.cameras.main.scrollY -=
        Phaser.Math.Linear(20, 600, this.progression.getProgression()) * dt;
    }
    this.platformManager.update(this.progression.getProgression());
    this.checkGameOver();
  }

  private showGameMenu() {
    const cat = this.add.image(
      this.game.canvas.width / 2,
      this.game.canvas.height / 2 - 150,
      "player",
      0,
    );
    this.gameRunning = false;
    const text = this.add
      .text(
        this.game.canvas.width / 2,
        this.game.canvas.height / 2,
        "START GAME",
        { fontSize: 48, color: "#990085" },
      )
      .setOrigin(0.5)
      .setInteractive();
    text.on("pointerover", () => text.setColor("#abbd08").setFontStyle("bold"));
    text.on("pointerout", () => text.setColor("#990085").setFontStyle(""));
    text.on("pointerdown", () => {
      text.destroy();
      cat.destroy();
      this.startNewGame();
    });
  }

  private async startNewGame() {
    await this.countDown();
    this.player = new Player(this);
    this.controlKeys = this.input.keyboard!.addKeys({
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as ControlKeys;
    this.physics.world.setBoundsCollision(true, true, false, false);
    this.gameOver = false;
    this.platformManager = new PlatformManager(this, this.player);
    this.progression = new Progression(this);
    this.gameRunning = true;
  }

  private checkGameOver() {
    const camera = this.cameras.main;
    const cameraBottom = camera.worldView.bottom;

    if (this.player.getBody().y > cameraBottom) {
      this.gameOver = true;
      this.scene.restart();
    }
  }

  private async countDown() {
    const text = this.add
      .text(
        this.game.canvas.width / 2,
        this.game.canvas.height / 2,
        "START GAME",
        { fontSize: 126, color: "#990085", fontStyle: "bold" },
      )
      .setOrigin(0.5)
      .setVisible(false);

    for (let i = 3; i >= 0; i--) {
      text.setVisible(true).setText(String(i > 0 ? i : "GET READY"));
      this.tweens.add({
        targets: text,
        scale: 1.5,
        yoyo: i > 0 ? true : false,
        duration: 500,
      });
      await new Promise((res) => setTimeout(res, 1000));
    }
    text.destroy();
  }
}
