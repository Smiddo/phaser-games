import { useEffect, useRef } from "react";
import { CreateSecondGame } from "./secondGame/createGame";

export function SecondGame() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = CreateSecondGame(containerRef.current);

    return () => game.destroy(true);
  }, []);

  return <div ref={containerRef} className="second-game" />;
}
