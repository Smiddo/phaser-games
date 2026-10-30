import { Card } from "../../Card";
import { buffType, IEffect, IEffectContext, Keyword } from "../effect";

export class EmpoweredGainPerKeywordTriggered implements IEffect {
  value: number;
  constructor(
    value: number,
    private readonly buffType: buffType,
    private readonly keyword: Keyword,
  ) {
    this.value = value;
  }
  getKeyword(): Keyword {
    return "Empowered";
  }
  getDescription(): string {
    return `Has +${this.value} health for each ${this.keyword} triggered this game when bought.`;
  }
  onShopSpawn(owner: Card, context: IEffectContext): void {
    if (this.buffType === "health")
      owner.heal(
        this.value * context.statistics.getKeywordTriggers(this.keyword),
      );
    else
      owner.addAttack(
        this.value * context.statistics.getKeywordTriggers(this.keyword),
      );
  }
}
