# AI Robotics Lab

Browser **occupancy-grid** simulator + **BFS** path planning + step-through animation.

## Why admissions readers care

- Shows **classical planning** (not only neural nets).
- Clear upgrade path: A*, DWA, or export paths to a ROS 2 teach pendant mock.

## Run

```bash
npm install && npm run dev
```

Responsive layout, **PWA manifest** (`public/manifest.webmanifest`), safe-area padding. **`MOBILE.md`** — Expo path and extracting planning logic.

## Ideas for v2

- Penalty for turns (non-holonomic hint).
- Multi-goal TSP heuristic.
- “Explain this step” via optional LLM with **grid snapshot JSON** as tool input.

MIT — portfolio.
