import { Board } from "../Board";
import { enemies, minions } from "../Cards/minions";
import { MyCardGameEvents } from "../combat/events";
import { dragState, isDragging, resetDragState, resetSwap } from "../drag";
import { Enemy } from "../Enemy";
import { Game } from "./Game";
import { Player } from "../Player/Player";
import { Shop } from "../Shop/Shop";
import { ShopBuffDebuff } from "../Shop/ShopBuffsDebuffs";
export const CardGameEvents = new MyCardGameEvents();

export class CardGameScene extends Phaser.Scene {
  gameState!: Game;
  preload() {
    [...minions, ...enemies].forEach((unit) =>
      this.load.image(unit.imageKey, unit.imagePath),
    );
    this.load.image("coins", "cardGame/Assets/Coins.png");
  }
  create() {
    this.registerGeneralListeners();
    this.showGameMenu();
  }
  update() {}

  showGameMenu() {
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
      this.startNewGame();
    });
  }

  restart() {
    this.cameras.main.fadeOut(2500, 155, 0, 0);
    const text = this.add
      .text(
        this.game.canvas.width / 2,
        this.game.canvas.height / 2,
        "YOU DIED",
        { fontSize: 48, color: "#f0efef" },
      )
      .setOrigin(0.5);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      text.destroy();
      this.scene.restart();
    });
  }

  private startNewGame() {
    CardGameEvents.removeAllListeners();
    const shop = new Shop(5, this);

    const enemy = new Enemy(1, this);
    enemy.hide();

    const board = new Board(5, this);
    const player = new Player({
      resource: 3,
      life: 30,
      name: "Smiddo",
      board,
      scene: this,
    });
    const shopBuffs = new ShopBuffDebuff();
    this.gameState = new Game(this, shop, shopBuffs, player, enemy);
  }

  registerGeneralListeners() {
    this.input.on(
      "dragstart",
      (
        _pointer: Phaser.Input.Pointer,
        target: Phaser.GameObjects.Container,
      ) => {
        if (isDragging()) return;
        const view = target.getData("cardView");
        if (!view) throw new Error("No cardView found");

        if (
          !this.gameState.player.canBuyCard(view) &&
          !view.getBoardSlot().getBoard().getOwner()
        ) {
          this.gameState.message.throwErrorText("Not enough resource!");
          resetSwap();
          resetDragState();
          return;
        }
        dragState.draggingCardView = view;
        dragState.dragStartPosition = {
          x: view.getPosition().x,
          y: view.getPosition().y,
        };
        dragState.sourceSlot = view.getBoardSlot();
      },
    );

    this.input.on(
      "drag",
      (
        _pointer: Phaser.Input.Pointer,
        _object: Phaser.GameObjects.Container,
        dragX: number,
        dragY: number,
      ) => {
        if (!isDragging()) {
          return;
        }
        dragState.draggingCardView?.moveTo(dragX, dragY);
      },
    );

    this.input.on(
      "dragend",
      (
        _pointer: Phaser.Input.Pointer,
        gameobject: Phaser.GameObjects.Container,
        dropped: boolean,
      ) => {
        dragState.draggingCardView = undefined;

        if (!dropped) {
          if (!dragState.dragStartPosition) return;
          const { x, y } = dragState.dragStartPosition;
          gameobject.getData("cardView").moveTo(x, y);
          resetDragState();
        }
      },
    );
  }
}
