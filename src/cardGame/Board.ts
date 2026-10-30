import { CardGameEvents, CardGameScene } from "./Game/CardGame";
import { CardView } from "./CardView";
import { config } from "./config";
import { dragState, resetDragState, resetSwap, swapPreview } from "./drag";
import { Player } from "./Player/Player";

export class BoardSlot {
  private backgroundStyle = {
    default: { color: 0x0a56ed, alpha: 0.1 },
    highlight: { color: 0xffffff, alpha: 0.5 },
  };
  private width: number = config.cardWidth;
  private height: number = config.cardHeight;
  private board?: Board;
  private cardView?: CardView;

  private background: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    this.background = scene.add
      .rectangle(0, 0, this.width, this.height, 0x0a56ed, 0.1)
      .setOrigin(0, 0)
      .setRounded(15)
      .setInteractive({ dropZone: true });
  }

  setBoard(board: Board) {
    this.board = board;
  }
  getBoard() {
    return this.board;
  }
  getGameObject() {
    return this.background;
  }
  placeCard(card: CardView) {
    if (!card) return;
    this.cardView = card;
    card.setBoardSlot(this);
    const pos = this.background.getWorldPoint();
    card.moveTo(pos.x, pos.y);
  }

  getCard() {
    return this.cardView?.getCard();
  }
  setCardView(cardView: CardView | undefined) {
    this.cardView = cardView;
  }
  removeCardView() {
    this.cardView = undefined;
  }
  getCardView() {
    return this.cardView;
  }
  isOccupied() {
    return this.cardView?.getCard() !== undefined;
  }

  highlightBackground() {
    this.background.setFillStyle(
      this.backgroundStyle.highlight.color,
      this.backgroundStyle.highlight.alpha,
    );
  }
  setDefaultBackground() {
    this.background.setFillStyle(
      this.backgroundStyle.default.color,
      this.backgroundStyle.default.alpha,
    );
  }
}

export class Board {
  protected slots: BoardSlot[] = [];
  protected container: Phaser.GameObjects.Container;
  protected owner?: Player;
  protected boardType?: BoardType;
  protected scene: CardGameScene;
  constructor(slotCount: number, scene: CardGameScene) {
    this.scene = scene;
    const canvas = {
      width: scene.game.canvas.width,
      height: scene.game.canvas.height,
    };
    const boardWidth = canvas.width - 2 * config.boardPadding;
    const boardHeight = config.cardHeight + config.boardPadding * 2;
    this.setBoardType("player");

    const container = scene.add.container(0, 0);

    for (let i = 0; i < slotCount; i++) {
      const slot = new BoardSlot(scene);
      this.slots.push(slot);
      slot.setBoard(this);
      container.add(
        slot
          .getGameObject()
          .setPosition(
            i * config.cardWidth + i * config.boardPadding,
            config.boardPadding,
          ),
      );
    }
    scene.input.on(
      "drop",
      (
        _pointer: Phaser.Input.Pointer,
        _gameObject: Phaser.GameObjects.Container,
        dropZone: Phaser.GameObjects.GameObject,
      ) => {
        const slot = this.slots.find(
          (slot) => slot.getGameObject() === dropZone,
        );
        if (!slot) {
          return;
        }
        slot.setDefaultBackground();

        if (!dragState.draggingCardView) return;
        const cardView: CardView = dragState.draggingCardView;
        if (!cardView)
          throw new Error("dragged object does not contain a cardView");
        dragState.sourceBoard = cardView.getBoardSlot().getBoard();
        dragState.targetBoard = this;

        if (
          dragState.sourceBoard?.getOwner() !==
            dragState.targetBoard?.getOwner() &&
          dragState.draggingCardView
        ) {
          const sourceOwner = dragState.sourceBoard?.getOwner();
          const targetOwner = dragState.targetBoard?.getOwner();

          if (!sourceOwner && !targetOwner) throw new Error("no player found");
          // sell card
          if (!targetOwner && sourceOwner) {
            if (slot.isOccupied()) {
              CardGameEvents.emit(
                "gameMessage",
                "Use an empty slot to sell the card!",
              );
              resetSwap();
              resetDragState();
              return;
            }
            dragState.sourceSlot?.setCardView(undefined);
            placeCardView(slot, cardView);
            sourceOwner.sellCard(dragState.draggingCardView);

            resetDragState();
            return;
          }
          //buy card
          if (targetOwner && !sourceOwner) {
            if (slot.isOccupied()) {
              CardGameEvents.emit(
                "gameMessage",
                "Use an empty slot to buy the card!",
              );
              resetSwap();
              resetDragState();
              return;
            } else {
              if (targetOwner.canBuyCard(dragState.draggingCardView)) {
                placeCardView(slot, cardView);
                targetOwner.buyCard(dragState.draggingCardView);
              } else {
                resetSwap();
                resetDragState();
                return;
              }
            }
          }
        }
        placeCardView(slot, cardView);
        if (dragState.sourceSlot !== slot)
          dragState.sourceSlot?.setCardView(undefined);

        if (dragState.sourceSlot && dragState.displaceCardView) {
          placeCardView(dragState.sourceSlot, dragState.displaceCardView);
        }

        resetDragState();
      },
    );
    scene.input.on(
      "dragover",
      (
        _pointer: Phaser.Input.Pointer,
        _gameObject: Phaser.GameObjects.Container,
        dropZone: Phaser.GameObjects.GameObject,
      ) => {
        const slot = this.slots.find(
          (slot) => slot.getGameObject() === dropZone,
        );
        if (!slot) return;
        slot.highlightBackground();

        if (
          slot.isOccupied() &&
          slot.getCardView() !== dragState.draggingCardView &&
          dragState.draggingCardView
        ) {
          const targetCardView = slot.getCardView();
          if (!dragState.draggingCardView || !targetCardView)
            throw new Error("One cardView is missing");
          dragState.displaceCardView = targetCardView;
          dragState.previewSlot = slot;
          swapPreview();
        }
      },
    );
    scene.input.on(
      "dragleave",
      (
        _pointer: Phaser.Input.Pointer,
        _gameObject: Phaser.GameObjects.Container,
        dropZone: Phaser.GameObjects.GameObject,
      ) => {
        const slot = this.slots.find(
          (slot) => slot.getGameObject() === dropZone,
        );
        if (!slot) return;
        slot.setDefaultBackground();
        resetSwap();
      },
    );

    CardGameEvents.on("phaseChanged", (phase) => {
      for (const slot of this.slots) {
        slot.getCardView()?.setDraggable(phase === "shop");
      }
    });

    container
      .setPosition(
        (scene.game.canvas.width -
          (config.cardWidth * this.slots.length +
            (this.slots.length - 1) * config.boardPadding)) /
          2,
        canvas.height - boardHeight - config.boardPadding,
      )
      .setDepth(config.DEPTH.BOARD);
    this.container = container;
  }
  setPosition({ x, y }: { x?: number; y?: number }) {
    this.container.setPosition(x ?? this.container.x, y ?? this.container.y);
  }
  setOwner(player: Player) {
    this.owner = player;
  }
  getOwner() {
    return this.owner;
  }
  setBoardType(type: BoardType) {
    this.boardType = type;
  }
  getBoardType() {
    return this.boardType;
  }

  hide() {
    this.container.setVisible(false);
    for (const slot of this.slots) {
      slot.getGameObject().setInteractive(false);
      slot.getCardView()?.hide();
    }
  }
  show() {
    this.container.setVisible(true);
    for (const slot of this.slots) {
      slot.getGameObject().setInteractive(true);
      slot.getCardView()?.show();
    }
  }

  getCardViews() {
    return this.slots.map((slot) => slot.getCardView()).filter(Boolean);
  }
}

function placeCardView(slot: BoardSlot, view: CardView) {
  slot.placeCard(view);
  view.setBoardSlot(slot);
}

type BoardType = "shop" | "player" | "enemy";
