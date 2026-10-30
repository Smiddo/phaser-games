import { Card } from "../../Card";
import { CardGameEvents } from "../../Game/CardGame";
import { buffType, IEffect, IEffectContext, Keyword } from "../effect";
import { AllyTarget } from "../Vendetta/buffAllyAttack";

export type targetBoard = "player" | "shop";

export class Inspire implements IEffect {
  constructor(
    private readonly targets: AllyTarget,
    private readonly bufftype: buffType,
    private readonly amount: number,
    private readonly board: targetBoard,
  ) {}
  getKeyword(): Keyword {
    return "Inspire";
  }
  getDescription(): string {
    return `Gives ${this.targets === "allAllies" ? "allied Minions" : this.targets === "player" ? "yourself" : "an allied minion"} ${this.amount > 0 ? "+" : ""}${this.amount} ${this.bufftype}`;
  }

  onBuy(owner: Card, context: IEffectContext): void {
    if (this.board === "player") {
      const boardCards = context.player
        .getCardViews()
        .filter((c) => c?.getCard() !== owner)
        .map((s) => s?.getCard());
      if (this.targets === "allAllies") {
        boardCards.forEach((card) => {
          if (!card) return;
          this.bufftype === "attack"
            ? card.addAttack(this.amount)
            : card.heal(this.amount);
        });
      } else if (this.targets === "player") {
        if (this.bufftype === "health") context.player.heal(this.amount);
        else context.player.takeDamage(this.amount);
      } else {
        const random = Phaser.Math.Between(0, boardCards.length - 1);
        const card = boardCards[random];
        this.bufftype === "attack"
          ? card?.addAttack(this.amount)
          : card?.heal(this.amount);
      }
    } else {
      const boardCards = context.board.getCardViews().map((s) => s?.getCard());
      boardCards.forEach((card) => {
        if (!card) return;
        this.bufftype === "attack"
          ? card.addAttack(this.amount)
          : card.heal(this.amount);
      });
    }
    CardGameEvents.emit("effectTriggered", {
      keyword: "Inspire",
      source: owner,
    });
  }
}
