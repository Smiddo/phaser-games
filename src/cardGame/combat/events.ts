import { Card } from "../Card";
import { IEffect, Keyword } from "../effects/effect";
import { ShopBuffDebuff } from "../Shop/ShopBuffsDebuffs";
import { IAttacker, IDamageable } from "./Damageable";
import { IHealable } from "./Healable";

export interface IAttackEvent {
  source: IAttacker;
  target: IDamageable;
  amount: number;
  killingBlow: boolean;
}

export interface IDieEvent {
  card: Card;
  source?: Card;
}

export interface IAttackAddedEvent {
  target: Card;
  trigger?: Keyword;
}
export interface IHealEvent {
  target: IHealable;
  amount: number;
}

interface IBuffShopEvent {
  buff: "attack" | "health";
  source: Card;
  value: number;
}

interface IEffectTriggerEvent {
  source: Card;
  keyword: Keyword;
}

type EventsMap = {
  healed: IHealEvent;
  gameMessage: string;
  cardDied: IDieEvent;
  attackAdded: IAttackAddedEvent;
  takeDamage: IAttackEvent;
  phaseChanged: string;
  cardHovered: Card;
  cardHoverOut: void;
  buffShop: IBuffShopEvent;
  effectTriggered: IEffectTriggerEvent;
  cardBought: Card;
  gameOver: boolean;
};

export class MyCardGameEvents {
  private emitter = new Phaser.Events.EventEmitter();
  constructor() {}
  emit<K extends keyof EventsMap>(type: K, payload: EventsMap[K]): void {
    this.emitter.emit(type, payload);
  }
  on<K extends keyof EventsMap>(
    type: K,
    func: (e: EventsMap[K]) => void,
  ): void {
    this.emitter.on(type, func);
  }

  removeAllListeners() {
    this.emitter.removeAllListeners();
  }
}
