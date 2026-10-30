import { BoardSlot } from "./Board";
import { Card } from "./Card";
import { CardGameEvents, CardGameScene } from "./Game/CardGame";
import { config } from "./config";

export class CardView {
  private card: Card;
  private width = config.cardWidth;
  private height = config.cardHeight;
  private padding = 15;
  private healthText!: Phaser.GameObjects.Text;
  private attackText!: Phaser.GameObjects.Text;
  private cardContainer!: Phaser.GameObjects.Container;
  private costContainer!: Phaser.GameObjects.Container;
  private valueContainer!: Phaser.GameObjects.Container;
  private damageOverlay!: Phaser.GameObjects.Rectangle;
  private boardSlot: BoardSlot;
  private scene: CardGameScene;
  constructor(card: Card, scene: CardGameScene, slot: BoardSlot) {
    this.scene = scene;
    this.card = card;
    this.boardSlot = slot;

    this.createCardContainer();
    this.update();
    this.initializeListeners();
  }

  moveTo(x: number, y: number) {
    this.cardContainer.setPosition(x, y);
  }

  update() {
    if (this.card.isDead()) {
      this.boardSlot.removeCardView();
      this.destroy();
      return;
    }
    this.attackText.text = String(this.card.getAttack());
    this.healthText.text = String(this.card.getHealth());
    this.costContainer.setVisible(
      this.boardSlot.getBoard()?.getBoardType() === "shop",
    );
    this.valueContainer.setVisible(
      this.boardSlot.getBoard()?.getBoardType() === "player",
    );
  }

  destroy(playTween: boolean = true) {
    if (!playTween) {
      this.cardContainer.destroy();
      return;
    }
    this.scene.tweens.add({
      targets: this.cardContainer,
      y: "+= 100",
      ease: "Bounce",
      duration: 500,
      repeat: 0,
      yoyo: false,
      onComplete: () => this.cardContainer.destroy(),
    });
  }

  getPosition() {
    return { x: this.cardContainer.x, y: this.cardContainer.y };
  }
  getCard() {
    return this.card;
  }
  show() {
    this.cardContainer.setVisible(true);
  }
  hide() {
    this.cardContainer.setVisible(false);
  }
  showCost() {
    this.costContainer.setVisible(true);
  }
  hideCost() {
    this.costContainer.setVisible(false);
  }
  showValue() {
    this.valueContainer.setVisible(true);
  }
  hideValue() {
    this.valueContainer.setVisible(false);
  }

  getBoardSlot() {
    return this.boardSlot;
  }
  setBoardSlot(slot: BoardSlot) {
    this.boardSlot = slot;
  }

  setDraggable(bool: boolean) {
    if (!this.cardContainer) return;
    this.scene.input.setDraggable(this.cardContainer, bool);
  }

  animateDamage() {
    this.damageOverlay.setVisible(true).setAlpha(0);
    this.scene.tweens.add({
      targets: this.damageOverlay,
      alpha: 1,
      duration: 80,
      yoyo: true,
      onComplete: () => {
        this.damageOverlay.setVisible(false);
      },
    });
  }

  animateAttack(
    targetPosition: { x: number; y: number },
    onAttackStart: () => void,
    onImpact: () => void,
  ) {
    return new Promise((res) => {
      let attackStartTriggered = false;
      this.scene.tweens.add({
        targets: this.cardContainer,
        x: targetPosition.x,
        y: targetPosition.y,
        duration: 1000,
        ease: "cubic.in",
        yoyo: true,
        onUpdate: (tween) => {
          if (!attackStartTriggered && tween.progress >= 0.25) {
            attackStartTriggered = true;
            onAttackStart();
          }
        },
        onYoyo: (_tween, _target, key) => {
          if (key === "x") {
            onImpact();
          }
        },
        onComplete: () => res("done"),
      });
    });
  }

  animateHealed(amount: number) {
    const text = this.scene.add
      .text(
        this.cardContainer.getWorldPoint().x + this.width / 2,
        this.cardContainer.getWorldPoint().y,
        `+${amount}`,
      )
      .setOrigin(0.5);
    this.scene.tweens.add({
      targets: text,
      delay: 0,
      duration: 2000,
      y: "-= 200",
      onComplete: () => {
        text.destroy();
      },
    });
  }

  // UI
  private createCardCore(): Phaser.GameObjects.Container {
    const image = this.scene.add
      .image(0, 0, this.card.getImageKey())
      .setOrigin(0.5, 0);
    const name = this.scene.add
      .text(0, 0, this.card.getName(), {
        ...config.text.textBaseStyle,
        align: "center",
        fontSize: this.card.getName().length > 10 ? 16 : 22,
      })
      .setOrigin(0.5, 0);

    const description = this.scene.add
      .text(0, 0, this.card.getDescription() ?? "", {
        ...config.text.textBaseStyle,
        ...config.text.keywords,
        wordWrap: { width: this.width - this.padding * 2 },
        align: "center",
        fontSize: 18,
      })
      .setOrigin(0.5, 0);

    const coreContainer = this.scene.add.container(0, 0);
    image.setPosition(this.width / 2, 15);
    name.setPosition(this.width / 2, image.height + 20);
    description.setPosition(this.width / 2, image.height + 45);
    coreContainer.add([image, name, description]);
    return coreContainer;
  }

  private createCostContainer(): Phaser.GameObjects.Container {
    const costContainer = this.scene.add.container(0, 0);
    const costBg = this.scene.add
      .circle(0, 0, 15, 0xffe200, 0.8)
      .setOrigin(0, 0);
    const costText = this.scene.add
      .text(0, 0, String(this.card.getCost()), { color: "black" })
      .setOrigin(0.5)
      .setPosition(costBg.radius, costBg.radius);
    costContainer.add([costBg, costText]);
    this.costContainer = costContainer;
    return costContainer;
  }
  private createValueContainer(): Phaser.GameObjects.Container {
    const valueContainer = this.scene.add.container(0, 0);
    const radius = 15;
    const valueBg = this.scene.add
      .circle(config.cardWidth - radius, radius, radius, 0x19ff00, 0.8)
      .setOrigin(0.5);
    const valueText = this.scene.add
      .text(0, 0, String(this.card.getValue()), { color: "black" })
      .setOrigin(0.5)
      .setPosition(config.cardWidth - radius, radius);
    valueContainer.add([valueBg, valueText]);
    this.valueContainer = valueContainer;
    return valueContainer;
  }

  private createStatsContainer(): Phaser.GameObjects.Container {
    this.healthText = this.scene.add
      .text(
        this.width - this.padding,
        this.height - this.padding,
        String(this.card.getHealth()),
      )
      .setOrigin(1, 1);
    this.attackText = this.scene.add
      .text(
        this.padding,
        this.height - this.padding,
        String(this.card.getAttack()),
      )
      .setOrigin(0, 1);
    const statsContainer = this.scene.add.container(0, 0);
    statsContainer.add([this.attackText, this.healthText]);
    return statsContainer;
  }

  private createCardContainer() {
    const cardContainer = this.scene.add.container(0, 0);
    const background = this.scene.add
      .rectangle(0, 0, this.width, this.height, 0x0a56ed, 0.5)
      .setOrigin(0, 0)
      .setRounded(15);

    this.damageOverlay = this.scene.add
      .rectangle(0, 0, this.width, this.height, 0xb50d0d, 1)
      .setOrigin(0, 0)
      .setRounded(15)
      .setVisible(false);

    const costContainer = this.createCostContainer();
    const unitContainer = this.createCardCore();
    const statsContainer = this.createStatsContainer();
    const valueContainer = this.createValueContainer();

    cardContainer.add([
      background,
      this.damageOverlay,
      costContainer,
      valueContainer,
      unitContainer,
      statsContainer,
    ]);

    cardContainer
      .setInteractive(
        new Phaser.Geom.Rectangle(0, 0, this.width, this.height),
        Phaser.Geom.Rectangle.Contains,
      )
      .setDepth(config.DEPTH.CARD);
    this.scene.input.setDraggable(cardContainer, true);

    cardContainer.setData("cardView", this);
    this.cardContainer = cardContainer;
  }

  initializeListeners() {
    this.cardContainer.on("pointerover", () => {
      if (!this.card.effects.length) return;
      CardGameEvents.emit("cardHovered", this.card);
    });
    this.cardContainer.on("pointerout", () => {
      CardGameEvents.emit("cardHoverOut", undefined);
    });
  }
}
