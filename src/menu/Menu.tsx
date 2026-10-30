import { GameSelect } from "./GameSelect";
import { ScoreContainer } from "./Score";
import { games } from "./games";

interface MenuProps {
  onGameChange: (game: games) => void;
  currentGame: games;
}

export function Menu({ onGameChange, currentGame }: MenuProps) {
  return (
    <div className="main-menu">
      <GameSelect onGameChange={onGameChange} currentGame={currentGame} />
      <ScoreContainer />
    </div>
  );
}
