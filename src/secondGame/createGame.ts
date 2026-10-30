import { SecondGameScene } from "./SecondGame";
import Phaser from "phaser";

export function CreateSecondGame(parent: HTMLDivElement) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 768,
    height: 1024,
    backgroundColor: "#141414",
    physics: {
      default: "arcade",
      arcade: { gravity: { y: 0, x: 0 }, debug: false },
    },
    scene: [SecondGameScene],
    disableContextMenu: true,
    loader: { baseURL: import.meta.env.BASE_URL },
  });
}
