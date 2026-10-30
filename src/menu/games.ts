import { PhaserGame } from "../PhaserGame";
import { SecondGame } from "../SecondGame";

export const gamesArray = ["blocks", "ballistics", "card", "Jumper"] as const;
export type games = (typeof gamesArray)[number];
