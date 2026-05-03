# Web → native mobile

Responsive grid UI in React. Pathfinding logic in `src/App.tsx` today — when you add **Expo**, move BFS + grid types into **`src/lib/robotics.ts`** and keep only rendering in RN `View` / `Pressable`.

Expo can render the grid with `FlatList` or absolute-positioned cells; pass the same `path` array from shared logic.
