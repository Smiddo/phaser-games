import { useEffect, useRef } from "react";
import { createGame } from "./game/createGame";
import { CardGameEvents } from "./cardGame/Game/CardGame";

export function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = createGame(containerRef.current);

    return () => {
      CardGameEvents.removeAllListeners();
      game.destroy(true);
    };
  }, []);

  return <div ref={containerRef} className="game-container" />;
}
