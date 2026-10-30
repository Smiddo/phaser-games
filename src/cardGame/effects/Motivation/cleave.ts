import { Card } from "../../Card";
import { IDamageable } from "../../combat/Damageable";
import { IEffect, IEffectContext, Keyword } from "../effect";

export type CleaveTarget = "random" | "randomNeighbour";

export class Cleave implements IEffect {
  constructor(private readonly target: CleaveTarget) {}
  getKeyword(): Keyword {
    return "Cleave";
  }
  getDescription(): string {
    return `Also damages a random ${this.target === "random" ? "minion" : "neighbour minion"}.`;
  }

  beforeAttack(
    owner: Card,
    target: IDamageable,
    context?: IEffectContext,
  ): void {
    if (!(target instanceof Card)) return;
    if (!context?.player.holdsCard(target)) return; // current hack to make sure its not a player card
    const cards = context?.player.getCardViews();
    if (!cards || !target) return;
    const index = cards.map((c) => c?.getCard()).indexOf(target);
    const filtered = cards.filter((c) => c?.getCard() !== target);
    const random =
      this.target === "random"
        ? Phaser.Math.Between(0, filtered.length - 1)
        : Phaser.Utils.Array.GetRandom(
            [index - 1, index + 1].filter((s) => filtered[s] !== undefined),
          );
    const neighbour = filtered[random];
    if (!neighbour) return;
    neighbour.getCard().takeDamage(owner.getAttack(), owner);
  }
}
