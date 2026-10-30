import { Card } from "../Card";

export interface IHealable {
  heal: (amout: number, source: Card) => void;
}
