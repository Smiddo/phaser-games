import { useState } from "react";
import { PhaserGame } from "./PhaserGame";
import { SecondGame } from "./SecondGame";
import { Menu } from "./menu/Menu";
import { games } from "./menu/games";
import { CardGame } from "./CardGame";
import { JumperGame } from "./JumperGame";

export default function App() {
  const [currentGame, setCurrentGame] = useState<games>("Jumper");
  return (
    <main>
      <Menu onGameChange={setCurrentGame} currentGame={currentGame} />
      {currentGame === "blocks" && <PhaserGame />}
      {currentGame === "ballistics" && <SecondGame />}
      {currentGame === "card" && <CardGame />}
      {currentGame === "Jumper" && <JumperGame />}
    </main>
  );
}
