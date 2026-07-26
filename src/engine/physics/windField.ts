import type { Point, Wall, Window, Door, WindField } from '@/types'

export interface WindCell {
  x: number
  y: number
  u: number
  v: number
  speed: number
  pressure: number
}

const GRID_SIZE = 20

export const calculateWindField = (
  walls: Wall[],
  windows: Window[],
  doors: Door[],
  windDirection: number = 0,
  windStrength: number = 0.5,
  bounds: { minX: number; minY: number; maxX: number; maxY: number }
): WindField & { cells: WindCell[][] } => {
  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY
  const cellW = width / GRID_SIZE
  const cellH = height / GRID_SIZE
  const windRad = (windDirection * Math.PI) / 180
  const baseU = Math.sin(windRad) * windStrength
  const baseV = -Math.cos(windRad) * windStrength
  const cells: WindCell[][] = []
  const inlets: Point[] = []
  const outlets: Point[] = []
  for (let r = 0; r < GRID_SIZE; r++) {
    cells[r] = []
    for (let c = 0; c < GRID_SIZE; c++) {
      const x = bounds.minX + c * cellW + cellW / 2
      const y = bounds.minY + r * cellH + cellH / 2
      let u = baseU
      let v = baseV
      let blocked = false
      for (const wall of walls) {
        if (pointNearWall({ x, y }, wall, Math.min(cellW, cellH) * 1.5)) {
          blocked = true
          const dist = distanceToSegment({ x, y }, wall.start, wall.end)
          const factor = Math.max(0, 1 - dist / (Math.min(cellW, cellH) * 2))
          u *= (1 - factor * 0.9)
          v *= (1 - factor * 0.9)
        }
      }
      for (const win of windows) {
        const d = Math.hypot(x - win.position.x, y - win.position.y)
        if (d < Math.max(win.width, 80)) {
          if (d < 40) {
            inlets.push({ x, y })
            u = baseU * 1.5
            v = baseV * 1.5
          }
          u += baseU * Math.max(0, 1 - d / Math.max(win.width, 80)) * 0.8
          v += baseV * Math.max(0, 1 - d / Math.max(win.width, 80)) * 0.8
        }
      }
      for (const door of doors) {
        const d = Math.hypot(x - door.position.x, y - door.position.y)
        if (d < door.width * 1.5) {
          if (d < 40) {
            inlets.push({ x, y })
            u = baseU * 1.2
            v = baseV * 1.2
          }
          u += baseU * Math.max(0, 1 - d / (door.width * 2)) * 0.6
          v += baseV * Math.max(0, 1 - d / (door.width * 2)) * 0.6
        }
      }
      if (blocked) {
        u *= 0.3
        v *= 0.3
      }
      for (let i = 0; i < 3; i++) {
        const du = getDiffusion(cells, r, c, 'u', GRID_SIZE)
        const dv = getDiffusion(cells, r, c, 'v', GRID_SIZE)
        u += du * 0.2
        v += dv * 0.2
      }
      const speed = Math.hypot(u, v)
      const pressure = Math.max(0, 1 - speed)
      cells[r][c] = { x, y, u, v, speed, pressure }
    }
  }
  if (inlets.length === 0) {
    const edgeInlet = {
      x: bounds.minX + width / 2,
      y: bounds.minY + height / 2,
    }
    inlets.push(edgeInlet)
  }
  return {
    grid: cells.map(row => row.map(c => c.speed)),
    vectors: cells.map(row => row.map(c => ({ x: c.u, y: c.v }))),
    inlets,
    outlets,
    cells,
  }
}

const getDiffusion = (cells: WindCell[][], r: number, c: number, prop: 'u' | 'v', size: number): number => {
  let sum = 0
  let count = 0
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = r + dr
      const nc = c + dc
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && cells[nr][nc]) {
        sum += prop === 'u' ? cells[nr][nc].u : cells[nr][nc].v
        count++
      }
    }
  }
  if (count === 0) return 0
  const avg = sum / count
  const current = prop === 'u' ? cells[r][c]?.u || 0 : cells[r][c]?.v || 0
  return (avg - current) * 0.1
}

const pointNearWall = (p: Point, wall: Wall, threshold: number): boolean => {
  return distanceToSegment(p, wall.start, wall.end) < threshold
}

const distanceToSegment = (p: Point, a: Point, b: Point): number => {
  const A = p.x - a.x
  const B = p.y - a.y
  const C = b.x - a.x
  const D = b.y - a.y
  const dot = A * C + B * D
  const lenSq = C * C + D * D
  let param = -1
  if (lenSq !== 0) param = dot / lenSq
  let xx, yy
  if (param < 0) {
    xx = a.x
    yy = a.y
  } else if (param > 1) {
    xx = b.x
    yy = b.y
  } else {
    xx = a.x + param * C
    yy = a.y + param * D
  }
  const dx = p.x - xx
  const dy = p.y - yy
  return Math.sqrt(dx * dx + dy * dy)
}

export const calculateEnergyFlow = (windCells: WindCell[][], fengshuiEnergy: number[][]): { x: number; y: number; energy: number; flow: { x: number; y: number } }[][] => {
  const rows = windCells.length
  const cols = windCells[0]?.length || 0
  const result: { x: number; y: number; energy: number; flow: { x: number; y: number } }[][] = []
  for (let r = 0; r < rows; r++) {
    result[r] = []
    for (let c = 0; c < cols; c++) {
      const cell = windCells[r][c]
      const fengshui = fengshuiEnergy[r % fengshuiEnergy.length]?.[c % fengshuiEnergy[0].length] || 0.5
      const energy = cell.speed * 0.4 + fengshui * 0.6
      result[r][c] = {
        x: cell.x,
        y: cell.y,
        energy,
        flow: { x: cell.u, y: cell.v },
      }
    }
  }
  return result
}
