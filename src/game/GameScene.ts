import Phaser from "phaser";
import { addScore, getCurrentScore } from "./score";

const bricks = {
  red: 0xff0000,
  blue: 0x0029ff,
  yellow: 0xedff00,
};
const brickScoreValue = 5;
const snowflakes: Snowflake[] = [];
type Snowflake = {
  object: Phaser.GameObjects.Image;
  phase: number;
  swingSpeed: number;
};
type Brick = {
  color: number;
  object?: Phaser.GameObjects.Rectangle;
  scoreValue: number;
};
export class GameScene extends Phaser.Scene {
  private board: (Brick | undefined)[][] = [];
  constructor() {
    super("GameScene");
  }
  preload() {
    this.load.image("bg1", "game/z-image-turbo_00029_.png");
    this.load.image("bg2", "game/z-image-turbo_00030_.png");
    this.load.image("bg3", "game/z-image-turbo_00007_.png");
    this.load.image("bg4", "game/z-image-turbo_00009_.png");
    this.load.image("snowflake", "game/z-image-turbo_00041_.png");
  }
  create() {
    this.game.events.on(Phaser.Core.Events.BLUR, () => {
      this.scene.pause();
    });
    this.game.events.on(Phaser.Core.Events.FOCUS, () => {
      this.scene.resume();
    });

    (this.add
      .image(0, 0, `bg${Math.floor(Math.random() * 4) + 1}`)
      .setOrigin(0, 0),
      this.createBoard());
    this.drawBoard();
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(Math.random() * this.game.canvas.width);
      const y = Math.floor(Math.random() * this.game.canvas.height);
      const flake = {
        object: this.add.image(x, y, "snowflake"),
        phase: Math.random() * Math.PI * 2,
        swingSpeed: 0.002 + 0.5 * 0.009,
      };
      flake.object.depth = 10;
      snowflakes.push(flake);
    }
    const letter = this.add.text(14, this.game.canvas.height - 33, "A", {
      color: "#ff00c6",
      fontSize: "36px",
      align: "center",
      stroke: "#030303",
      strokeThickness: 1,
    });
    letter.depth = 1;
  }
  update(time: number, delta: number): void {
    snowflakes.forEach((flake) => {
      flake.object.x += Math.sin(time * flake.swingSpeed + flake.phase);
      flake.object.y += delta * 0.2;
      if (flake.object.y >= this.game.canvas.height) {
        flake.object.y = -flake.object.height;
      }
    });
  }

  createBoard() {
    for (let i = 0; i < 23; i++) {
      const row = [];
      for (let y = 0; y < 23; y++) {
        const rdm = Math.round(Math.random() * 3);
        switch (rdm) {
          case 1:
            row.push({ color: bricks.red });
            break;
          case 2:
            row.push({ color: bricks.blue });
            break;
          default:
            row.push({ color: bricks.yellow });
            break;
        }
      }
      this.board.push(row.map((r) => ({ ...r, scoreValue: brickScoreValue })));
    }
  }
  drawBoard() {
    const spacing = 2;
    const size = 45;
    let x = size / 2;
    let y = this.game.canvas.height - size / 2;

    this.board.forEach((row, rowIndex) => {
      row.forEach((brick, colIndex) => {
        if (!brick || !this.board[rowIndex][colIndex]) {
          x += size + spacing;
          return;
        }
        brick.object?.destroy();
        const object = this.add.rectangle(x, y, size, size, brick.color);
        object.depth = 2;
        this.board[rowIndex][colIndex].object = object;
        object.setInteractive();
        object.on("pointerdown", () => {
          const connected: number[][] = [];
          this.findConnected([rowIndex, colIndex], connected);
          if (connected.length < 3) return;
          const objects = connected
            .map(([row, col]) => this.board[row][col]?.object)
            .filter((obj) => obj !== undefined);
          this.tweens.add({
            targets: objects,
            scale: 0.9,
            angle: 90,
            duration: 500,

            onComplete: () => {
              connected.forEach(([rowIndex, colIndex]) => {
                const brick = this.board[rowIndex][colIndex];
                if (!brick) return;
                if (connected.length < 5) addScore(brick.scoreValue);
                this.board[rowIndex][colIndex]?.object?.destroy();
                this.board[rowIndex][colIndex] = undefined;
              });

              if (connected.length >= 5 && connected.length < 10)
                addScore(connected.length * brickScoreValue * 1.5);
              else if (connected.length >= 10 && connected.length < 15)
                addScore(connected.length * brickScoreValue * 1.8);
              else if (connected.length >= 15 && connected.length < 20)
                addScore(connected.length * brickScoreValue * 2);
              else addScore(connected.length * brickScoreValue * 2.5);
              this.resortBoard();
            },
          });
        });
        x += size + spacing;
      });
      x = size / 2;
      y -= size + spacing;
    });
  }

  findConnected([rowindex, colindex]: number[], connected: number[][]): void {
    if (!this.board[rowindex][colindex]?.object) return;
    const alreadyVisited = connected.some(
      ([row, col]) => row === rowindex && col === colindex,
    );

    if (alreadyVisited) return;
    connected.push([rowindex, colindex]);
    const currentColor = this.board[rowindex][colindex].color;

    if (this.board[rowindex]?.[colindex - 1]?.color === currentColor)
      this.findConnected([rowindex, colindex - 1], connected);
    if (this.board[rowindex]?.[colindex + 1]?.color === currentColor)
      this.findConnected([rowindex, colindex + 1], connected);
    if (this.board[rowindex - 1]?.[colindex]?.color === currentColor)
      this.findConnected([rowindex - 1, colindex], connected);
    if (this.board[rowindex + 1]?.[colindex]?.color === currentColor)
      this.findConnected([rowindex + 1, colindex], connected);
  }

  resortBoard() {
    for (let col = this.board[0].length - 1; col >= 0; col--) {
      const column = [];
      for (let row = 0; row < this.board.length; row++) {
        column.push(this.board[row]?.[col]);
      }
      const filtered = column.filter((c) => c !== undefined);
      for (let row = 0; row < this.board.length; row++) {
        this.board[row][col] = filtered[row];
      }

      if (!filtered.length) {
        this.board.forEach((row, rowindex) => {
          row.splice(col, 1);
        });
      }
    }
    this.drawBoard();
    console.log(getCurrentScore());
  }
}
