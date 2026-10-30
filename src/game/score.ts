import { GameEvents } from "../Events/gameEvents";

let score = 0;

export function getCurrentScore() {
  return score;
}

export function addScore(value: number): void {
  score += value;
  GameEvents.dispatchEvent(new CustomEvent("scoreChanged", { detail: score }));
}

export function resetScore() {
  score = 0;
  GameEvents.dispatchEvent(new CustomEvent("scoreChanged", { detail: 0 }));
}
