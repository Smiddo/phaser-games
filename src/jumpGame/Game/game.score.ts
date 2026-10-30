import { GameEvents } from "../../Events/gameEvents";

export class JumpScore {
  private score: number = 0;
  constructor(private events: Phaser.Events.EventEmitter) {
    this.events.on("bump", (impactSpeed: number) => {
      this.bumpScore(impactSpeed);
      GameEvents.dispatchEvent(
        new CustomEvent("scoreChanged", {
          detail: this.score,
        }),
      );
    });
    this.events.on("platformSpawn", () => {
      this.platformScore();
      GameEvents.dispatchEvent(
        new CustomEvent("scoreChanged", { detail: this.score }),
      );
    });
  }

  bumpScore(impactSpeed: number) {
    let score = 0;
    if (impactSpeed > 1000) score = 500;
    else if (impactSpeed > 500) score = 250;
    else if (impactSpeed > 150) score = 50;
    this.score += score;
  }

  platformScore() {
    this.score += 10;
  }
}
