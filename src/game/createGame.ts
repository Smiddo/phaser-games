import Phaser from "phaser";
import { GameScene } from "./GameScene";

export function createGame(parent: HTMLElement) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 1024,
    height: 1024,
    backgroundColor: "#1d2433",
    physics: {
      default: "arcade",
      //arcade: { gravity: { y: 500, x: 0 }, debug: true },
    },
    scene: [GameScene],
    disableContextMenu: true,
    loader: { baseURL: import.meta.env.BASE_URL },
  });
}
