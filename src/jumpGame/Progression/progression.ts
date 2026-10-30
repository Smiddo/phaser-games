import { JumpGameScene } from "../Game/game.playscene";

export class Progression {
  constructor(private readonly scene: JumpGameScene) {}

  getProgression() {
    const camera = this.scene.cameras.main;
    const cameraTop = Math.abs(camera.scrollY);
    return Phaser.Math.Clamp(cameraTop / 50_000, 0, 1);
  }
}
