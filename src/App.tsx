import { useCallback, useMemo, useState } from 'react'

const N = 12
type Cell = '.' | '#' | 'R' | 'G'

function bfs(grid: Cell[][], start: [number, number], goal: [number, number]): [number, number][] {
  const [sr, sc] = start
  const [gr, gc] = goal
  const q: [number, number][] = [[sr, sc]]
  const prev = new Map<string, string | null>()
  const key = (r: number, c: number) => `${r},${c}`
  prev.set(key(sr, sc), null)
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]
  while (q.length) {
    const [r, c] = q.shift()!
    if (r === gr && c === gc) break
    for (const [dr, dc] of dirs) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nc < 0 || nr >= N || nc >= N) continue
      if (grid[nr][nc] === '#') continue
      const k = key(nr, nc)
      if (prev.has(k)) continue
      prev.set(k, key(r, c))
      q.push([nr, nc])
    }
  }
  if (!prev.has(key(gr, gc))) return []
  const path: [number, number][] = []
  let cur: string | null = key(gr, gc)
  while (cur) {
    const [r, c] = cur.split(',').map(Number) as [number, number]
    path.push([r, c])
    cur = prev.get(cur) ?? null
  }
  path.reverse()
  return path
}

function makeGrid(seed: number): { grid: Cell[][]; start: [number, number]; goal: [number, number] } {
  const rnd = (() => {
    let s = seed % 2147483647
    if (s <= 0) s += 2147483646
    return () => (s = (s * 16807) % 2147483647) / 2147483647
  })()
  const grid: Cell[][] = Array.from({ length: N }, () => Array(N).fill('.'))
  for (let i = 0; i < 28; i++) {
    const r = Math.floor(rnd() * N)
    const c = Math.floor(rnd() * N)
    grid[r][c] = '#'
  }
  const start: [number, number] = [1, 1]
  const goal: [number, number] = [N - 2, N - 2]
  grid[start[0]][start[1]] = '.'
  grid[goal[0]][goal[1]] = '.'
  return { grid, start, goal }
}

function copilotExplain(pathLen: number, obstacles: number): string {
  if (pathLen === 0) return 'No path: add random seed or clear obstacles between R and G.'
  if (pathLen < 8) return 'Short path: grid is easy; try raising obstacle count in code or smaller N.'
  return `BFS guarantees shortest steps in an unweighted grid (${pathLen} steps, ${obstacles} obstacles). In real robots, add kinematics + dynamics constraints.`
}

export default function App() {
  const [seed, setSeed] = useState(42)
  const { grid: base, start, goal } = useMemo(() => makeGrid(seed), [seed])
  const grid = useMemo(() => {
    const g = base.map((row) => [...row])
    g[start[0]][start[1]] = 'R'
    g[goal[0]][goal[1]] = 'G'
    return g
  }, [base, start, goal])

  const path = useMemo(() => {
    const walkable = base.map((row) => row.map((c) => (c === '#' ? '#' : '.'))) as Cell[][]
    return bfs(walkable, start, goal)
  }, [base, start, goal])

  const obs = base.flat().filter((c) => c === '#').length
  const tip = useMemo(() => copilotExplain(path.length, obs), [path.length, obs])

  const [step, setStep] = useState(0)
  const pos = path[step] ?? start

  const resetAnim = useCallback(() => setStep(0), [])

  return (
    <div style={{ width: '100%', maxWidth: 720, margin: '0 auto', padding: 'clamp(0.75rem, 3vw, 1.25rem)' }}>
      <h1 style={{ marginTop: 0 }}>AI Robotics Lab (grid sim)</h1>
      <p style={{ color: '#6ee7b7', lineHeight: 1.5 }}>
        2D occupancy grid, <strong>BFS shortest path</strong>, step animation. “Copilot” panel = transparent heuristics
        (swap for LLM with tool-calling later).
      </p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <label>
          Seed{' '}
          <input
            type="number"
            value={seed}
            onChange={(e) => {
              setSeed(Number(e.target.value) || 1)
              setStep(0)
            }}
            style={{ width: 100, padding: 6, borderRadius: 6, border: '1px solid #065f46', background: '#022c22', color: '#ecfdf5' }}
          />
        </label>
        <button
          type="button"
          onClick={() => setStep((s) => Math.min(s + 1, Math.max(path.length - 1, 0)))}
          style={{ padding: '10px 16px', minHeight: 44, borderRadius: 8, border: 'none', background: '#059669', color: '#fff', cursor: 'pointer', fontSize: 16 }}
        >
          Step +
        </button>
        <button
          type="button"
          onClick={resetAnim}
          style={{ padding: '10px 16px', minHeight: 44, borderRadius: 8, border: '1px solid #047857', background: 'transparent', color: '#a7f3d0', cursor: 'pointer', fontSize: 16 }}
        >
          Reset anim
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${N}, 1fr)`,
          gap: 2,
          maxWidth: 'min(100%, 440px)',
          width: '100%',
          aspectRatio: '1',
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const onPath = path.some(([pr, pc], i) => pr === r && pc === c && i <= step)
            const isRobot = pos[0] === r && pos[1] === c
            let bg = '#064e3b'
            if (cell === '#') bg = '#14532d'
            if (cell === 'G') bg = '#854d0e'
            if (onPath && cell !== '#') bg = '#0f766e'
            if (isRobot) bg = '#2563eb'
            return (
              <div
                key={`${r}-${c}`}
                title={`${r},${c}`}
                style={{
                  background: bg,
                  borderRadius: 4,
                  fontSize: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ecfdf5',
                }}
              >
                {cell === '#' ? '█' : cell === 'G' ? 'G' : isRobot ? 'R' : ''}
              </div>
            )
          }),
        )}
      </div>

      <section style={{ marginTop: 16, padding: 12, background: '#022c22', borderRadius: 10, border: '1px solid #065f46' }}>
        <h2 style={{ marginTop: 0, fontSize: 14 }}>Copilot (heuristic)</h2>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{tip}</p>
      </section>
    </div>
  )
}
