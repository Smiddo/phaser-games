import { Card } from "../../Card";
import { CardGameEvents } from "../../Game/CardGame";
import { buffType, IEffect, IEffectContext, Keyword } from "../effect";

export type AllyTarget = "randomAlly" | "allAllies" | "player";

export class VendettaBuffAlly implements IEffect {
  private keyword: Keyword;
  constructor(
    private readonly value: number,
    private readonly targetMode: AllyTarget,
    private readonly buffType: buffType,
  ) {
    this.keyword = "Vendetta";
  }

  getKeyword(): Keyword {
    return this.keyword;
  }
  getDescription(): string {
    if (this.targetMode === "randomAlly")
      return `Grants an allied minion +${this.value} ${this.buffType}.`;
    else
      return `Grants all other allied minions +${this.value} ${this.buffType}.`;
  }

  afterDeath(owner: Card, context: IEffectContext): void {
    if (this.targetMode === "randomAlly") {
      const playerCards = context.player
        .getCardViews()
        .filter((view) => view?.getCard() !== owner);
      if (!playerCards.length) return;
      const rdm = Phaser.Math.Between(0, playerCards.length - 1);
      const cardView = playerCards[rdm];
      if (!cardView) return;
      const card = cardView.getCard();
      if (this.buffType === "attack") {
        card.addAttack(this.value);
      } else {
        card.heal(this.value);
      }
    } else {
      const allyCards = context.player
        .getCardViews()
        .filter((view) => view?.getCard() !== owner);
      allyCards.forEach((target) => {
        const card = target?.getCard();
        if (!card) return;
        if (this.buffType === "attack") {
          card.addAttack(this.value);
        } else {
          card.heal(this.value);
        }
      });
    }
    CardGameEvents.emit("effectTriggered", {
      source: owner,
      keyword: this.keyword,
    });
  }
}
