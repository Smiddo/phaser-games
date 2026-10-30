# Vite + React + TypeScript + Phaser

```bash
npm install
npm run dev
```

React rendert in `App.tsx` nur `PhaserGame` und stellt dessen `div` bereit. Nach dem Mounten erzeugt `PhaserGame` in einem `useEffect` die Phaser-Instanz mit diesem Element als `parent`; beim Unmounten wird die Instanz wieder zerstört. Die eigentliche Spielfl\u00e4che und alle k\u00fcnftige Spiellogik liegen damit in Phaser, aktuell in der bewusst leeren `src/game/GameScene.ts`.
