import { useEffect, useRef } from "react";
import { createGame } from "./cardGame/createGame";

export function CardGame() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = createGame(containerRef.current);

    return () => game.destroy(true);
  }, []);

  return <div ref={containerRef} className="card-game" />;
}
