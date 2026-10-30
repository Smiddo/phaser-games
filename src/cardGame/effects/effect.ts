import { Board } from "../Board";
import { Card } from "../Card";
import { CardGameEvents } from "../Game/CardGame";
import { IDamageable } from "../combat/Damageable";
import { IHealable } from "../combat/Healable";
import { Player } from "../Player/Player";
import { ShopBuffDebuff } from "../Shop/ShopBuffsDebuffs";
import { EnduranceGainHealth } from "./Endurance/gainHealth";
import { FrenzyGain } from "./Frenzy/frenzyGain";
import { HealAlly } from "./Motivation/healAlly";
import { AllyTarget, VendettaBuffAlly } from "./Vendetta/buffAllyAttack";
import { VendettaBuffShop } from "./Vendetta/buffShop";
import { GameStatistics } from "../Game/GameStatistics";
import { EmpoweredGainPerKeywordTriggered } from "./Empowered/gainPerKeywordTriggered";
import { Inspire, targetBoard } from "./Inspire/inspire";
import { Cleave, CleaveTarget } from "./Motivation/cleave";

const keywords = [
  "Frenzy",
  "Empowered",
  "Vendetta",
  "Motivation",
  "Endurance",
  "Inspire",
  "Cleave",
  "Any",
] as const;
export type Keyword = (typeof keywords)[number];

const healTargets = ["player", "targetAlly", "self"] as const;
export type HealTarget = (typeof healTargets)[number];

export type buffType = "attack" | "health";

export interface IEffectContext {
  board: Board;
  shopBoard: Board;
  player: Player;
  shopBuffs: ShopBuffDebuff;
  statistics: GameStatistics;
}

export interface IEffect {
  getDescription(): string;
  getKeyword(): Keyword;
  beforeAttack?(
    owner: Card,
    target: IDamageable | IHealable,
    context?: IEffectContext,
  ): void;
  afterAttack?(
    owner: Card,
    target: IDamageable,
    context?: IEffectContext,
  ): void;
  beforeDeath?(owner: Card, target: IDamageable): void;
  afterDeath?(owner: Card, context: IEffectContext, target?: IDamageable): void;
  onAttackStart?(owner: Card, context: IEffectContext): void;
  afterSurvive?(owner: Card, context: IEffectContext): void;
  onShopSpawn?(owner: Card, context: IEffectContext): void;
  onBuy?(owner: Card, context: IEffectContext): void;
}
export type EffectDefinition =
  | { type: "frenzyGain"; value: number; buffType: buffType }
  | { type: "healAlly"; healValue: number; target: HealTarget }
  | { type: "cleave"; targets: CleaveTarget }
  //Vendetta
  | {
      type: "vendettaBuffAlly";
      attackValue: number;
      targetMode: AllyTarget;
      buffType: buffType;
    }
  | { type: "vendettaBuffShop"; value: number; buffType: buffType }
  //Empowered
  | {
      type: "EmpoweredGainPerKeywordTriggered";
      healValue: number;
      buffType: buffType;
      keyword: Keyword;
    }
  //Endurance
  | { type: "enduranceGainHealth"; healValue: number }
  //Inspire
  | {
      type: "inspire";
      targets: AllyTarget;
      value: number;
      buffType: buffType;
      board: targetBoard;
    };

export function createEffect(definition: EffectDefinition): IEffect {
  switch (definition.type) {
    case "frenzyGain":
      return new FrenzyGain(definition.value, definition.buffType);
    case "healAlly":
      return new HealAlly(definition.healValue, definition.target);
    case "vendettaBuffAlly":
      return new VendettaBuffAlly(
        definition.attackValue,
        definition.targetMode,
        definition.buffType,
      );
    case "vendettaBuffShop":
      return new VendettaBuffShop(definition.buffType, definition.value);
    case "EmpoweredGainPerKeywordTriggered":
      return new EmpoweredGainPerKeywordTriggered(
        definition.healValue,
        definition.buffType,
        definition.keyword,
      );
    case "enduranceGainHealth":
      return new EnduranceGainHealth(definition.healValue);
    case "inspire":
      return new Inspire(
        definition.targets,
        definition.buffType,
        definition.value,
        definition.board,
      );
    case "cleave":
      return new Cleave(definition.targets);
  }
}

export function triggerEffect(owner: Card, effect: Keyword) {
  CardGameEvents.emit("effectTriggered", {
    source: owner,
    keyword: effect,
  });
}
