import { Card } from "../Card";
import { CardGameEvents, CardGameScene } from "./CardGame";
import { CardView } from "../CardView";
import { IDamageable } from "../combat/Damageable";
import { IHealable } from "../combat/Healable";
import { config } from "../config";
import { isDragging } from "../drag";
import { IEffectContext } from "../effects/effect";
import { Enemy } from "../Enemy";
import { GameMessage } from "../GameMessage";
import { Player } from "../Player/Player";
import { Shop } from "../Shop/Shop";
import { ShopBuffDebuff } from "../Shop/ShopBuffsDebuffs";
import { GameStatistics } from "./GameStatistics";

const phase = ["shop", "fight"] as const;
export type Phase = (typeof phase)[number];

export class Game {
  scene: CardGameScene;
  phase: Phase;
  shop: Shop;
  player: Player;
  enemy: Enemy;
  message!: GameMessage;
  endShopButton!: Phaser.GameObjects.Container;
  round: number;
  context: IEffectContext;
  shopBuffs: ShopBuffDebuff;
  statistics: GameStatistics;

  constructor(
    scene: CardGameScene,
    shop: Shop,
    shopBuffs: ShopBuffDebuff,
    player: Player,
    enemy: Enemy,
  ) {
    this.scene = scene;
    this.phase = "shop";
    this.shop = shop;
    this.player = player;
    this.enemy = enemy;
    this.message = new GameMessage(scene);
    this.round = 1;
    this.shopBuffs = shopBuffs;
    this.statistics = new GameStatistics();
    this.context = {
      board: this.player.getBoard(),
      shopBoard: this.shop,
      player,
      shopBuffs: this.shopBuffs,
      statistics: this.statistics,
    };
    this.createEndShopButton(scene);
    this.registerListeners(this.context);
    this.startShop();
  }

  changePhase(phase: Phase) {
    this.phase = phase;
    CardGameEvents.emit("phaseChanged", phase);
  }

  startShop() {
    this.changePhase("shop");
    this.shop.show();
    this.enemy.update(this.context);
    this.enemy.hide();
    this.endShopButton.setVisible(true);
    this.shop.clearShop();
    this.shop.fillShop(this.player.getTier(), this.shopBuffs, this.context);
    this.player.addResource(2);
  }
  startFight() {
    this.changePhase("fight");
    this.shop.hide();
    this.enemy.show();
    this.endShopButton.setVisible(false);
    this.playFight();
  }

  createEndShopButton(scene: CardGameScene) {
    const endShopContainer = scene.add.container(0, 0);
    const rect = scene.add
      .rectangle(0, 0, 100, 50)
      .setStrokeStyle(2, 0xffffff)
      .setOrigin(0.5)
      .setRounded(35);
    rect.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, rect.width, rect.height),
      Phaser.Geom.Rectangle.Contains,
    );

    const text = scene.add
      .text(0, 0, "Fight!", { fontSize: 18, fontStyle: "bold" })
      .setOrigin(0.5);
    rect.on("pointerover", () => {
      rect.setFillStyle(0xffffff, 0.5);
      text.setStyle({ ...text.style, color: "black" });
    });
    rect.on("pointerout", () => {
      rect.setFillStyle(0xffffff, 0);
      text.setStyle({ ...text.style, color: "white" });
    });
    rect.on("pointerdown", () => {
      this.startFight();
    });

    endShopContainer
      .add([rect, text])
      .setPosition(
        scene.game.canvas.width - rect.width / 2 - config.boardPadding,
        scene.game.canvas.height / 2 - rect.height / 2,
      );
    this.endShopButton = endShopContainer;
  }

  async playFight() {
    const playerCardViews = this.player.getCardViews();
    for (const card of playerCardViews) {
      const e = this.enemy.getCardViews()[0];
      if (!e || card?.getCard().isDead()) continue;

      await card?.animateAttack(
        { x: e.getPosition().x, y: e.getPosition().y },
        () => card.getCard().attackStart(this.context),
        () => {
          card.getCard().attackTarget(e.getCard(), this.context);
          card.update();

          if (e.getCard().isDead())
            this.player.addResource(e.getCard().getValue());
          e.update();
          this.enemy.updateText();
        },
      );
      if (e.getCard().getType() === "Boss" && !e.getCard().isDead()) {
        const boss = e.getCard();
        const playerCards = this.player
          .getCardViews()
          .filter((c) => !c?.getCard().isDead());
        console.log("cards", playerCards);
        if (!playerCards.length) continue;
        const random = Phaser.Math.Between(0, playerCards.length - 1);
        const targetMinion = playerCards[random];
        if (!targetMinion) continue;
        await e?.animateAttack(
          { x: targetMinion.getPosition().x, y: targetMinion.getPosition().y },
          () => boss.attackStart(this.context),
          () => {
            boss.attackTarget(targetMinion.getCard(), this.context);
            targetMinion.update();
            e.update();
          },
        );
      }
    }
    const e = this.enemy.getCardViews()[0];
    if (e && !e.getCard().isDead()) {
      const card = e.getCard();
      await e?.animateAttack(
        { x: config.boardPadding, y: this.scene.game.canvas.height / 2 },
        () => card.attackStart(this.context),
        () => {
          card.attackTarget(this.player, this.context);
        },
      );
    }

    [...this.enemy.getCardViews(), ...playerCardViews].forEach((view) => {
      const card = view?.getCard();
      card?.effects.forEach((effect) => {
        effect.afterSurvive?.(card, this.context);
      });
    });

    this.startShop();
    this.enemy.hide();
    this.round++;
  }

  findCardView(card: IHealable | IDamageable | Card): CardView | undefined {
    return [...this.enemy.getCardViews(), ...this.player.getCardViews()].find(
      (view) => view?.getCard() === card,
    );
  }

  getRound(): number {
    return this.round;
  }

  registerListeners(context: IEffectContext) {
    CardGameEvents.on("healed", (event) => {
      const view = this.findCardView(event.target);
      if (view) {
        view.update();
        view.animateHealed(event.amount);
        return;
      }
    });
    CardGameEvents.on("takeDamage", (event) => {
      const view = this.findCardView(event.target);
      if (!view) return;
      view.animateDamage();
      view.update();
    });
    CardGameEvents.on("gameMessage", (e) => {
      this.message.throwErrorText(e);
    });
    CardGameEvents.on("cardDied", (event) => {
      if (event.card.getType() === "Boss") {
        this.player.increaseTier();
      }
      event.card.effects.forEach((effect) => {
        effect.afterDeath?.(event.card, context);
      });
    });
    CardGameEvents.on("attackAdded", (event) => {
      const view = this.findCardView(event.target);
      view?.update();
    });

    CardGameEvents.on("cardHovered", (event) => {
      if (isDragging()) return;
      this.message.showCard(event);
    });
    CardGameEvents.on("cardHoverOut", () => {
      this.message.hide();
    });
    CardGameEvents.on("buffShop", (event) => {
      this.shopBuffs.adjust(event.buff, event.value);
    });
    CardGameEvents.on("effectTriggered", (event) => {
      this.statistics.triggerKeyword(event.keyword, 1);
    });
    CardGameEvents.on("cardBought", (card) => {
      card.onBuy(context);
    });
    CardGameEvents.on("gameOver", () => {
      this.scene.restart();
    });
  }
}
