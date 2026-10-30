import { Card } from "../Card";
import { buffType } from "../effects/effect";

export class ShopBuffDebuff {
  private attack: number;
  private health: number;

  constructor() {
    this.attack = 0;
    this.health = 0;
  }

  getName() {
    return "ShopBuffs";
  }

  private adjustShopAttack(value: number) {
    const result = this.attack + value;
    this.attack = result > 0 ? result : 0;
  }
  private adjustShopHealth(value: number) {
    const result = this.health + value;
    this.health = result > 0 ? result : 0;
  }

  adjust(type: buffType, value: number) {
    if (type === "attack") this.adjustShopAttack(value);
    if (type === "health") this.adjustShopHealth(value);
  }

  getShopAttackMod() {
    return this.attack;
  }
  getShopHealthMod() {
    return this.health;
  }

  applyBuffToCard(card: Card) {
    if (this.attack) {
      card.addAttack(this.attack);
    }
    if (this.health) {
      card.heal(this.health);
    }
  }
}
