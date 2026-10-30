import { Board } from "./Board";
import { Card } from "./Card";
import { CardGameEvents, CardGameScene } from "./Game/CardGame";
import { enemies, createEnemy } from "./Cards/minions";
import { CardView } from "./CardView";
import { config } from "./config";
import { GameStatistics } from "./Game/GameStatistics";
import { IEffectContext } from "./effects/effect";

export class Enemy extends Board {
  private bosses: Card[] = [];
  private text: Phaser.GameObjects.Text;
  private currentView!: CardView;
  constructor(slotCount: number, scene: CardGameScene) {
    super(slotCount, scene);
    this.scene = scene;
    this.setBoardType("enemy");
    for (const enemy of enemies) {
      this.bosses.push(createEnemy(enemy.id));
    }
    this.bosses.sort((a, b) => a.getTier() - b.getTier());
    this.setPosition({ y: 20 });
    this.createEnemy();
    const enemy = this.currentView.getCard();
    this.text = scene.add
      .text(
        0,
        0,
        `Current enemy: ${enemy.getName()} - ${enemy.getAttack()} Attack, ${enemy.getHealth()} Health`,
        { ...config.text.textBaseStyle, align: "center" },
      )
      .setOrigin(0.5)
      .setPosition(scene.game.canvas.width / 2, 25);
  }

  updateText() {
    const enemy = this.currentView.getCard();
    this.text.text = `Current enemy: ${enemy.getName()} - ${enemy.getAttack()} Attack, ${enemy.getHealth()} Health`;
  }

  createEnemy(context?: IEffectContext) {
    this.slots.forEach((slot) => {
      const card = this.bosses[0];
      if (context) card.onShopSpawn(context);
      const boss = new CardView(card, this.scene, slot);
      this.currentView = boss;
      slot.setCardView(boss);
      boss.moveTo(
        slot.getGameObject().getWorldPoint().x,
        slot.getGameObject().getWorldPoint().y,
      );

      this.bosses.shift();
    });
  }

  update(context: IEffectContext) {
    if (!this.bosses.length || !this.currentView) {
      CardGameEvents.emit("gameMessage", "You won!");
      console.log("you beat all enemies");
      return;
    }
    if (!this.getCardViews().length) {
      this.createEnemy(context);
    }
    this.updateText();
  }
}
