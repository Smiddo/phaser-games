export interface IDamageable {
  takeDamage(value: number, source: IAttacker): void;
}

export interface IAttacker {
  getAttack: () => number;
}

export function isAttacker(target: unknown): target is IAttacker {
  return (
    typeof target === "object" &&
    target !== null &&
    "getAttack" in target &&
    typeof target.getAttack === "function"
  );
}
