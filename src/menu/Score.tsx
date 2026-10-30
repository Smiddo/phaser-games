import { useEffect, useState } from "react";
import { GameEvents } from "../Events/gameEvents";

export function ScoreContainer() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const handleScore = (event: Event) => {
      const scoreEvent = event as CustomEvent<number>;
      setScore(scoreEvent.detail);
    };
    GameEvents.addEventListener("scoreChanged", handleScore);

    return () => {
      GameEvents.removeEventListener("scoreChanged", handleScore);
    };
  }, []);

  return (
    <div className="score-container">
      <span>{`Current score: ${score}`}</span>
    </div>
  );
}
