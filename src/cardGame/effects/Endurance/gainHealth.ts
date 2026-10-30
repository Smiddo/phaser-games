import { Card } from "../../Card";
import { IEffect, IEffectContext, Keyword } from "../effect";

export class EnduranceGainHealth implements IEffect {
  private healthValue: number;
  constructor(value: number) {
    this.healthValue = value;
  }
  getKeyword(): Keyword {
    return "Endurance";
  }
  getDescription(): string {
    return `Gains +${this.healthValue} health.`;
  }

  afterSurvive(owner: Card, context?: IEffectContext): void {
    owner.heal(this.healthValue);
  }
}
