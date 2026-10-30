import { useState } from "react";
import { resetScore } from "../game/score";
import { games, gamesArray } from "./games";

interface GameSelectProps {
  onGameChange: (game: games) => void;
  currentGame: games;
}

export function GameSelect({ onGameChange, currentGame }: GameSelectProps) {
  return (
    <div
      className="game-select"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <span>Change Game</span>
      <select
        onChange={(e) => {
          onGameChange(e.target.value as games);
          resetScore();
        }}
        defaultValue={currentGame}
      >
        {gamesArray.map((game) => (
          <option key={game} value={game} defaultValue={currentGame}>
            {game}
          </option>
        ))}
      </select>
    </div>
  );
}
