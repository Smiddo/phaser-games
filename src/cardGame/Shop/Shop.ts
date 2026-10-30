import { Board } from "../Board";
import { CardGameScene } from "../Game/CardGame";
import { createCard, minions } from "../Cards/minions";
import { CardView } from "../CardView";
import { ShopBuffDebuff } from "./ShopBuffsDebuffs";
import { IEffectContext } from "../effects/effect";

export class Shop extends Board {
  constructor(slotCount: number, scene: CardGameScene) {
    super(slotCount, scene);
    this.setPosition({ y: 20 });
    this.scene = scene;
    this.setBoardType("shop");
  }

  fillShop(tier: number, buffs: ShopBuffDebuff, context: IEffectContext) {
    const availableMinions = minions.filter((minion) => minion.tier <= tier);

    for (const slot of this.slots) {
      const rdm = Phaser.Math.Between(0, availableMinions.length - 1);
      const card = createCard(availableMinions[rdm].id);
      card.onShopSpawn?.(context);
      buffs.applyBuffToCard(card);
      const pos = slot.getGameObject().getWorldPoint();
      const view = new CardView(card, this.scene, slot);
      view.moveTo(pos.x, pos.y);
      slot.setCardView(view);
    }
  }
  clearShop() {
    for (const slot of this.slots) {
      slot.getCardView()?.destroy(false);
      slot.setCardView(undefined);
    }
  }
}
