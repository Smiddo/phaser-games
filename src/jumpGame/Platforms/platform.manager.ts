import { JumpGameScene } from "../Game/game.playscene";
import { Player } from "../Player/player";

export class PlatformManager {
  private highestPlatformY = 0;
  private platforms: Phaser.GameObjects.Rectangle[] = [];
  constructor(
    private readonly scene: JumpGameScene,
    private readonly player: Player,
  ) {
    this.createInitialPlatforms();
  }

  update(difficulty: number) {
    const camera = this.scene.cameras.main;
    const cameraTop = camera.worldView.top;
    const spawnAhead = 300;
    while (this.highestPlatformY > cameraTop - spawnAhead) {
      this.spawnNextPlatform(difficulty);
    }
    this.clearPlatforms();
  }

  createPlatform({
    x,
    y,
    width,
    height,
    color = 0xffffff,
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    color?: number;
  }) {
    const platform = this.scene.add
      .rectangle(0, 0, width, height, color, 0.8)
      .setRounded(15)
      .setOrigin(0, 0)
      .setPosition(x, y);

    this.scene.physics.add.existing(platform, true);
    this.scene.physics.add.collider(
      this.player.getBody(),
      platform,
      () => this.player.landed(),
      () =>
        this.player.getBody().velocity.y > 50 &&
        this.player.getBody().bottom > platform.y,
    );
    this.platforms.push(platform);
  }
  private createBasePlatform() {
    this.createPlatform({
      x: 0,
      y: this.scene.game.canvas.height - 25,
      width: this.scene.game.canvas.width,
      height: 25,
    });
  }

  private clearPlatforms() {
    const camera = this.scene.cameras.main;
    const camerabottom = camera.worldView.bottom;
    this.platforms = this.platforms.filter((platform) => {
      if (platform.y > camerabottom + 100) {
        platform.destroy();
        return false;
      }
      return true;
    });
  }

  private createInitialPlatforms() {
    this.createBasePlatform();
    const steps = Math.floor(this.scene.cameras.main.height / 100);
    const spacingY = 100;
    for (let i = 0; i < steps; i++) {
      const width = Phaser.Math.Between(500, 700);
      const x = Phaser.Math.Between(0, this.scene.game.canvas.width - width);
      this.createPlatform({ x, y: i * spacingY, width, height: 25 });
    }
  }

  private spawnNextPlatform(difficulty: number) {
    const spawnChance = Phaser.Math.Linear(1.0, 0.65, difficulty);
    const rdm = Phaser.Math.FloatBetween(0, 1);

    const spacing = 100;
    this.highestPlatformY -= spacing;

    if (rdm > spawnChance) {
      console.log(rdm, spawnChance);
      return;
    }
    const minWidth = Phaser.Math.Linear(500, 150, difficulty);
    const maxWidth = Phaser.Math.Linear(700, 300, difficulty);
    const width = Phaser.Math.Between(minWidth, maxWidth);
    const x = Phaser.Math.Between(0, this.scene.game.canvas.width - width);

    this.createPlatform({
      x,
      y: this.highestPlatformY,
      width,
      height: 25,
      color: this.getPlatformColor(difficulty),
    });

    this.scene.gameEvents.emit("platformSpawn");
  }

  private getPlatformColor(difficulty: number) {
    if (difficulty < 0.1) return 0xffffff;
    if (difficulty < 0.2) return 0xb1b1b1;
    if (difficulty < 0.3) return 0x325499;
    if (difficulty < 0.4) return 0x996232;
    if (difficulty < 0.5) return 0x4a9932;
    if (difficulty < 0.6) return 0xa705a1;
  }
}
