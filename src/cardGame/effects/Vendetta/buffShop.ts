import { Card } from "../../Card";
import { CardGameEvents } from "../../Game/CardGame";
import { IDamageable } from "../../combat/Damageable";
import { buffType, IEffect, IEffectContext, Keyword } from "../effect";

export class VendettaBuffShop implements IEffect {
  private type: buffType;
  private value: number;
  constructor(type: buffType, value: number) {
    this.type = type;
    this.value = value;
  }

  getKeyword(): Keyword {
    return "Vendetta";
  }
  getDescription(): string {
    return `Buff your future shop cards with +${this.value} ${this.type}`;
  }

  afterDeath(owner: Card, context: IEffectContext, target?: IDamageable): void {
    CardGameEvents.emit("buffShop", {
      source: owner,
      buff: this.type,
      value: this.value,
    });
    CardGameEvents.emit("effectTriggered", {
      keyword: "Vendetta",
      source: owner,
    });
  }
}
