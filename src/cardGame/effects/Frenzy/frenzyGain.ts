import { Card } from "../../Card";
import { IDamageable } from "../../combat/Damageable";
import { CardGameEvents } from "../../Game/CardGame";
import { buffType, IEffect, IEffectContext, Keyword } from "../effect";

export class FrenzyGain implements IEffect {
  constructor(
    private value: number,
    private readonly buffType: buffType,
  ) {}

  setAttackValue(amount: number) {
    this.value = amount;
  }

  afterAttack(owner: Card, target: IDamageable, context: IEffectContext): void {
    if (this.buffType === "attack") {
      owner.addAttack(this.value);
    } else {
      owner.heal(this.value);
    }
    CardGameEvents.emit("effectTriggered", {
      keyword: "Frenzy",
      source: owner,
    });
  }
  getDescription(): string {
    return `Gains +${this.value} ${this.buffType}.`;
  }

  getKeyword(): Keyword {
    return "Frenzy";
  }
}
