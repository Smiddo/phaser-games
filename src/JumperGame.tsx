import { useEffect, useRef } from "react";
import { createGame } from "./jumpGame/Game/game.create";

export function JumperGame() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = createGame(containerRef.current);

    return () => game.destroy(true);
  }, []);

  return <div ref={containerRef} className="jumper-game" />;
}
