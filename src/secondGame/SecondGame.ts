import Phaser from "phaser";
import { GameEvents } from "../Events/gameEvents";

type Brick = {
  type: "rectangle" | "circle";
  rect?: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Arc;
  text?: Phaser.GameObjects.Text;
  score: number;
  row: number;
  col: number;
  hitPoints: number;
  damage?: () => void;
};
const modes = ["idle", "playing"] as const;
type Mode = (typeof modes)[number];

export class SecondGameScene extends Phaser.Scene {
  private ballCount = 1;
  private balls: Phaser.GameObjects.Arc[] = [];
  private score = 0;
  private initBall?: Phaser.GameObjects.Arc;
  private ballPosition?: number[];
  private shootVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2({
    x: 0,
    y: 0,
  });
  private brickSize!: { width: number; height: number };
  private mode: Mode = "idle";
  private brickGrid: (Brick | undefined)[][] = [];
  private level = 1;
  private speedButton!: Phaser.GameObjects.Container;
  constructor() {
    super("SecondGameScene");
  }
  preload() {
    this.load.image("insight-bg", "secondGame/insight-removebg-preview.png");
  }
  create() {
    this.game.canvas.style.border = "1px solid white";
    this.brickSize = {
      width: this.game.canvas.width / 10,
      height: this.game.canvas.height / 10,
    };
    this.add
      .image(0, 0, "insight-bg")
      .setPosition(this.game.canvas.width / 2, 712)
      .setAlpha(0.5);
    this.createBrickGrid();
    this.pushBrickRow();

    this.initBallForShoot();

    const speedButtonRect = this.add.rectangle(0, 0, 100, 50, 0xffffff, 0);
    const speedButtonText = this.add.text(0, 0, ">>>");
    this.speedButton = this.add
      .container(this.game.canvas.width / 2, this.game.canvas.height - 50, [
        speedButtonRect,
        speedButtonText,
      ])
      .setSize(speedButtonRect.width, speedButtonRect.height)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    this.speedButton.on("pointerdown", () => {
      this.physics.world.timeScale = 0.15;
    });
    this.input.on(
      Phaser.Input.Events.POINTER_DOWN,
      (e: Phaser.Input.Pointer) => {
        if (this.mode !== "idle") return;
        if (!this.ballPosition) return;
        const [ballx, bally] = this.ballPosition;
        if (e.y >= bally) {
          return;
        }
        const direction = new Phaser.Math.Vector2(
          e.position.x - ballx,
          e.position.y - bally,
        );
        direction.normalize();

        this.shootVector = direction;
        this.initBall?.destroy();
        this.initBall = undefined;
        this.mode = "playing";
        this.shootBalls();
      },
    );
  }

  createBrickGrid() {
    for (let i = 0; i < 9; i++) {
      const row = [];
      for (let y = 0; y < 9; y++) {
        row.push(undefined);
      }
      this.brickGrid.push(row);
    }
  }
  pushBrickRow() {
    for (let i = 0; i < this.brickGrid[0].length; i++) {
      const x = Math.random();
      if (x > 0.6 && x < 0.95)
        this.createBrick({
          row: 0,
          col: i,
          hitPoints: Phaser.Math.Between(this.level, this.level * 5),
        });
      else if (x >= 0.95)
        this.createCircleBrick({
          row: 0,
          col: i,
          hitPoints: Phaser.Math.Between(this.level, this.level * 5) * 2,
        });
    }
  }
  moveDownBricks() {
    for (let i = this.brickGrid.length - 1; i >= 0; i--) {
      for (let y = 0; y < this.brickGrid[i].length; y++) {
        const brick = this.brickGrid[i][y];
        if (!brick) continue;
        this.tweens.add({
          targets: [brick.rect, brick.text],
          y: `+=${this.brickSize.height}`,
          duration: 500,
          onComplete: () => {
            const body = brick.rect!.body as Phaser.Physics.Arcade.StaticBody;
            body.updateFromGameObject();
          },
        });
        if (i + 1 >= 9) {
          //gameover

          return;
        }

        this.brickGrid[i + 1][y] = brick;
        this.brickGrid[i][y] = undefined;
        brick.row = i + 1;
        brick.col = y;
      }
    }
    this.level++;
  }
  displayBricks() {
    for (let i = this.brickGrid.length - 1; i >= 0; i--) {
      for (let y = 0; y < this.brickGrid[i].length; y++) {
        const brick = this.brickGrid[i][y];
        if (!brick) continue;
        brick.type === "rectangle" &&
          this.createBrick({ row: i, col: y, hitPoints: brick.hitPoints });
        brick.type === "circle" &&
          this.createCircleBrick({
            row: i,
            col: y,
            hitPoints: brick.hitPoints,
          });
      }
    }
  }

  createCircleBrick({ row = 0, col = 0, hitPoints = 15 }) {
    const width = this.brickSize.width;
    const height = this.brickSize.height;
    const circle = this.add.circle(0, 0, width / 2, 0xffffff).setOrigin(0.5);

    let score = 50;
    const text = this.add.text(0, 0, String(hitPoints), { color: "black" });
    text.setOrigin(0.5);

    circle.setPosition(col * width + width / 2, row * height + height / 2);
    text.setPosition(col * width + width / 2, row * height + height / 2);
    this.physics.add.existing(circle, true);
    const body = circle.body as Phaser.Physics.Arcade.StaticBody;
    body.setCircle(width / 2);
    const circleBrick: Brick = {
      rect: circle,
      text,
      type: "circle",
      row,
      col,
      score,
      hitPoints: hitPoints * this.level,
      damage: () => {
        hitPoints--;
        text.text = String(hitPoints);
        if (hitPoints <= 0) {
          circle.destroy();
          text.destroy();
          this.score += score; //general bonus for destroying a whole brick
          this.ballCount++;
          this.brickGrid[circleBrick.row!][circleBrick.col!] = undefined;
          GameEvents.dispatchEvent(
            new CustomEvent("scoreChanged", { detail: this.score }),
          );
        }
      },
    };
    this.brickGrid[row][col] = circleBrick;
  }
  createBrick({ row = 0, col = 0, hitPoints = 5 }) {
    const width = this.brickSize.width;
    const height = this.brickSize.height;
    const rect = this.add
      .rectangle(0, 0, width, height, 0x10141c)
      .setOrigin(0, 0);
    rect.setStrokeStyle(2, 0xffe200);

    const score = 20;
    const text = this.add
      .text(0, 0, String(hitPoints), { fontSize: 24, fontStyle: "bold" })
      .setOrigin(0.5);

    rect.setPosition(col * width, row * height);
    text.setPosition(col * width + width / 2, row * height + height / 2);
    this.physics.add.existing(rect, true);
    const body = rect.body as Phaser.Physics.Arcade.StaticBody;
    body.updateFromGameObject();

    const brick: Brick = {
      rect,
      text,
      row,
      col,
      hitPoints: hitPoints * this.level,
      type: "rectangle",
      score,
      damage: () => {
        hitPoints--;
        text.text = String(hitPoints);
        if (hitPoints <= 0) {
          rect.destroy();
          text.destroy();
          this.score += score; //general bonus for destroying a whole brick
          this.ballCount++;
          this.brickGrid[brick.row!][brick.col!] = undefined;
          GameEvents.dispatchEvent(
            new CustomEvent("scoreChanged", { detail: this.score }),
          );
        }
      },
    };
    this.brickGrid[row][col] = brick;
  }

  spawnBall() {
    const ball = this.add.circle(
      this.ballPosition![0],
      this.ballPosition![1],
      15,
      0xffffff,
    );
    this.physics.add.existing(ball);
    const body = ball.body as Phaser.Physics.Arcade.Body;
    body.setCircle(15);
    const ballSpeed = 500;
    body.setVelocity(
      this.shootVector.x * ballSpeed,
      this.shootVector.y * ballSpeed,
    );
    body.setCollideWorldBounds(true);
    this.physics.world.checkCollision.down = false;

    body.setBounce(1);
    this.balls.push(ball);

    for (const brick of this.brickGrid) {
      for (const b of brick) {
        if (!b || !b.rect || !b.damage) continue;
        this.physics.add.collider(ball, b.rect, () => {
          if (b.damage) b.damage();
        });
      }
    }
  }

  shootBalls() {
    this.mode = "playing";
    this.speedButton.setVisible(true);
    this.time.addEvent({
      delay: 100,
      callback: () => this.spawnBall(),
      repeat: this.ballCount - 1,
    });
  }

  initBallForShoot() {
    if (!this.ballPosition?.[0])
      this.ballPosition = [
        Math.floor(Math.random() * this.game.canvas.width),
        this.game.canvas.height - 20,
      ];
    this.initBall = this.add.circle(
      this.ballPosition[0],
      this.game.canvas.height - 20,
      15,
      0xffffff,
    );
  }

  update(time: number, delta: number): void {
    for (let i = this.balls.length; i >= 0; i--) {
      const ball = this.balls[i];
      if (!ball) continue;
      if (
        ball.body?.position &&
        ball.body.position.y > this.game.canvas.height - ball.radius - 20
      ) {
        ball.destroy();
        this.balls.splice(i, 1);
        if (!this.balls.length) {
          this.mode = "idle";
          this.ballPosition = [ball.x, this.game.canvas.height - 20];
          this.initBallForShoot();
          this.moveDownBricks();
          this.pushBrickRow();
          this.physics.world.timeScale = 1;
          this.speedButton.setVisible(false);
        }
      }
    }
  }
}
