import { Card } from "../../Card";
import { CardGameEvents } from "../../Game/CardGame";
import { HealTarget, IEffect, IEffectContext, Keyword } from "../effect";

export class HealAlly implements IEffect {
  private keyword: Keyword = "Motivation";
  private healValue: number;
  constructor(
    value: number,
    private readonly healTarget: HealTarget,
  ) {
    this.healValue = value;
  }

  getKeyword(): Keyword {
    return this.keyword;
  }
  getDescription(): string {
    const value = Math.abs(this.healValue);
    const prefix = this.healValue >= 0 ? "+" : "-";
    const valueString = prefix + value;
    switch (this.healTarget) {
      case "targetAlly":
        return `Grants an allied minion ${valueString} health.`;
      case "self":
        return `Grants itself ${valueString} health`;
      case "player":
        return `Heals the player by ${valueString}`;
    }
  }

  onAttackStart(owner: Card, context: IEffectContext): void {
    if (this.healTarget === "targetAlly") {
      const cards = context.player
        .getCardViews()
        ?.map((v) => v?.getCard())
        .filter(Boolean);
      const card = cards[Phaser.Math.Between(0, cards.length - 1)];
      if (!card) throw new Error("no cardview found");
      card;
      card.heal(this.healValue);
    } else if (this.healTarget === "self") {
      owner.heal(this.healValue);
    } else if (this.healTarget === "player") {
      context.player.heal(this.healValue);
    }

    CardGameEvents.emit("effectTriggered", {
      source: owner,
      keyword: this.keyword,
    });
  }
}
