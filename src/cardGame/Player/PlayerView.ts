import { CardGameScene } from "../Game/CardGame";
import { config } from "../config";
import { Player } from "./Player";

export class PlayerView {
  private player: Player;

  private healthText!: Phaser.GameObjects.Text;
  healthBar!: Phaser.GameObjects.Rectangle;
  private resourceText!: Phaser.GameObjects.Text;

  constructor(player: Player, scene: CardGameScene) {
    this.player = player;
    this.createPlayerDisplay(scene);
  }

  createPlayerDisplay(scene: CardGameScene) {
    const container = scene.add.container(0, 0);
    const health = this.createHealthDisplay(scene).setPosition(0, 0);
    const resource = this.createResourceDisplay(scene).setPosition(100, 15);
    container
      .add([health, resource])
      .setPosition(config.boardPadding, scene.game.canvas.height / 2 - 75);
  }

  createResourceDisplay(scene: CardGameScene) {
    const container = scene.add.container(0, 0);
    const coins = scene.add.image(0, 0, "coins").setOrigin(0, 0);
    this.resourceText = scene.add
      .text(
        coins.width / 2 + 30,
        coins.height / 2 - 15,
        String(this.player.getResource() ?? 0),
        {
          fontSize: 26,
          fontStyle: "bold",
          shadow: { offsetX: 2, offsetY: 2, stroke: true, fill: true },
        },
      )
      .setOrigin(0.5);
    container.add([coins, this.resourceText]);
    return container;
  }

  createHealthDisplay(scene: CardGameScene) {
    const container = scene.add.container(0, 0);
    const heartShape = scene.add.graphics();
    heartShape.lineStyle(2, 0xff0000, 0.7);
    heartShape.beginPath();

    const path = new Phaser.Curves.Path(50, 90);
    path.cubicBezierTo(25, 20, 10, 60, 0, 30);
    path.cubicBezierTo(50, 30, 40, 15, 50, 30);

    path.cubicBezierTo(75, 20, 50, 30, 60, 15);
    path.cubicBezierTo(50, 90, 100, 30, 90, 60);

    path.draw(heartShape);

    const maskShape = scene.make
      .graphics()
      .setPosition(0, 0)
      .setPosition(config.boardPadding, scene.game.canvas.height / 2 - 75);
    const points = path.getPoints(64);
    maskShape.fillStyle(0xffffff);
    maskShape.fillPoints(points, true);

    const mask = maskShape.createGeometryMask();
    const redRect = scene.add
      .rectangle(0, 0, 100, 100, 0xff0000)
      .setOrigin(0, 0);
    redRect.setMask(mask);

    const text = scene.add
      .text(50, 50, String(this.player.getLife()), {
        fontSize: 26,
        fontStyle: "bold",
        shadow: { offsetX: 2, offsetY: 2, stroke: true, fill: true },
      })
      .setOrigin(0.5);
    this.healthText = text;

    this.healthBar = redRect;
    container.add([heartShape, redRect, text]);
    return container;
  }

  updateHealthDisplay() {
    this.healthText.text = String(this.player.getLife());
    const missingHealthPercent = 1 - this.player.getLife() / config.player.life;
    const offset = 75 * missingHealthPercent;
    this.healthBar.setY(15 + offset);
  }

  updateResourceDisplay(value: number) {
    this.resourceText.text = String(value);
  }
}
