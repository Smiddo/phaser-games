import { CardGameEvents } from "./Game/CardGame";
import { IAttacker, IDamageable, isAttacker } from "./combat/Damageable";
import { IHealEvent } from "./combat/events";
import { IHealable } from "./combat/Healable";
import { IEffect, IEffectContext, Keyword } from "./effects/effect";
import { ShopBuffDebuff } from "./Shop/ShopBuffsDebuffs";

const cardTypes = ["Minion", "Spell", "Item", "Boss"] as const;
export type cardType = (typeof cardTypes)[number];

export class Card implements IDamageable, IAttacker, IHealable {
  private name: string;
  private attack: number;
  private health: number;
  private description: string | undefined;
  private imageKey: string;
  readonly effects: IEffect[] = [];
  private cost: number;
  private tier: number;
  private type: cardType;
  private value: number;

  constructor(
    name: string,
    attack: number,
    health: number,
    description: string | undefined,
    imageKey: string,
    effects: IEffect[],
    type: cardType,
    cost: number,
    tier: number,
    value: number,
  ) {
    this.name = name;
    this.attack = attack;
    this.health = health;
    this.description = description;
    this.imageKey = imageKey;
    this.type = type;
    this.effects = effects;
    this.cost = cost;
    this.tier = tier;
    this.value = value;
    if (this.effects.length) {
      const keywords: Keyword[] = this.effects.map((e) => e.getKeyword());
      this.description = `${keywords.join("\n")}`;
    }
  }

  attackTarget(target: IDamageable, context: IEffectContext) {
    this.effects.forEach((effect) =>
      effect.beforeAttack?.(this, target, context),
    );
    target.takeDamage(this.attack, this);
    if (isAttacker(target)) this.takeDamage(target.getAttack(), target);
    this.effects.forEach((effect) =>
      effect.afterAttack?.(this, target, context),
    );
  }
  takeDamage(amount: number, source: IAttacker) {
    this.health -= amount;
    if (this.health <= 0) this.die();
    CardGameEvents.emit("takeDamage", {
      source: source,
      target: this,
      amount: amount,
      killingBlow: this.health <= 0,
    });
  }
  die() {
    CardGameEvents.emit("cardDied", {
      card: this,
    });
  }
  attackStart(context: IEffectContext) {
    this.effects.forEach((effect) => effect.onAttackStart?.(this, context));
  }
  onShopSpawn(context: IEffectContext) {
    this.effects.forEach((effect) => effect?.onShopSpawn?.(this, context));
  }
  onBuy(context: IEffectContext) {
    this.effects.forEach((effect) => effect?.onBuy?.(this, context));
  }

  getDescription() {
    return this.description;
  }
  getName() {
    return this.name;
  }
  getTier() {
    return this.tier;
  }
  getType() {
    return this.type;
  }

  getHealth() {
    return this.health <= 0 ? 0 : this.health;
  }
  heal(amount: number) {
    this.health += amount;
    CardGameEvents.emit("healed", {
      target: this,
      amount: amount,
    } satisfies IHealEvent);
  }
  getAttack() {
    return this.attack;
  }
  addAttack(value: number) {
    this.attack += value;
    CardGameEvents.emit("attackAdded", {
      target: this,
    });
  }
  getImageKey() {
    return this.imageKey;
  }
  getCost() {
    return this.cost ?? 0;
  }
  isDead() {
    return this.health <= 0;
  }
  getValue() {
    return this.value;
  }

  getEffect<T extends IEffect>(
    effectType: new (...args: any[]) => T,
  ): T | undefined {
    return this.effects.find((effect) => effect instanceof effectType) as
      | T
      | undefined;
  }
}
