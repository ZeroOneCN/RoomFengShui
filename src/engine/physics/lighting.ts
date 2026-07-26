import type { Point, Wall, Window } from '@/types'

export interface LightingCell {
  x: number
  y: number
  intensity: number
  direction: number
}

const GRID_SIZE = 20

const SUN_AZIMUTH_BY_HOUR: Record<number, number> = {
  6: 90,
  7: 105,
  8: 120,
  9: 135,
  10: 150,
  11: 165,
  12: 180,
  13: 195,
  14: 210,
  15: 225,
  16: 240,
  17: 255,
  18: 270,
}

const SUN_ALTITUDE_BY_HOUR: Record<number, number> = {
  6: 0,
  7: 15,
  8: 30,
  9: 45,
  10: 60,
  11: 72,
  12: 80,
  13: 72,
  14: 60,
  15: 45,
  16: 30,
  17: 15,
  18: 0,
}

export const getSunPosition = (hour: number, orientation: number = 0) => {
  let azimuth = 180
  let altitude = 0
  if (hour >= 6 && hour <= 18) {
    const h = Math.floor(hour)
    const nextH = Math.min(h + 1, 18)
    const t = hour - h
    const az1 = SUN_AZIMUTH_BY_HOUR[h] || 180
    const az2 = SUN_AZIMUTH_BY_HOUR[nextH] || 180
    const alt1 = SUN_ALTITUDE_BY_HOUR[h] || 0
    const alt2 = SUN_ALTITUDE_BY_HOUR[nextH] || 0
    azimuth = az1 + (az2 - az1) * t
    altitude = alt1 + (alt2 - alt1) * t
  }
  azimuth = (azimuth + orientation + 360) % 360
  return { azimuth, altitude }
}

export const calculateLightingField = (
  walls: Wall[],
  windows: Window[],
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  hour: number = new Date().getHours(),
  orientation: number = 0
): LightingCell[][] => {
  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY
  const cellW = width / GRID_SIZE
  const cellH = height / GRID_SIZE
  const sun = getSunPosition(hour, orientation)
  const sunRad = ((sun.azimuth - 90) * Math.PI) / 180
  const sunDir = { x: Math.cos(sunRad), y: Math.sin(sunRad) }
  const baseIntensity = hour >= 6 && hour <= 18 ? Math.max(0, Math.sin((sun.altitude * Math.PI) / 180)) : 0
  const cells: LightingCell[][] = []
  for (let r = 0; r < GRID_SIZE; r++) {
    cells[r] = []
    for (let c = 0; c < GRID_SIZE; c++) {
      const x = bounds.minX + c * cellW + cellW / 2
      const y = bounds.minY + r * cellH + cellH / 2
      let intensity = baseIntensity * 0.1
      let nearestWindowDist = Infinity
      let lightFromWindow = 0
      for (const win of windows) {
        const d = Math.hypot(x - win.position.x, y - win.position.y)
        const winAngle = Math.atan2(y - win.position.y, x - win.position.x)
        const angleDiff = Math.abs(normalizeAngle(winAngle - (sun.azimuth * Math.PI) / 180))
        const windowFacing = win.orientation || 0
        const windowFacingRad = (windowFacing * Math.PI) / 180
        const facingMatch = Math.max(0, Math.cos(angleDiff - windowFacingRad))
        const range = win.type === 'floor-to-ceiling' ? win.width * 6 : win.width * 4
        const falloff = Math.max(0, 1 - d / range)
        const blocked = isLineBlocked({ x, y }, win.position, walls)
        if (!blocked && d < range) {
          const contribution = falloff * falloff * (0.6 + facingMatch * 0.4) * baseIntensity * (win.type === 'floor-to-ceiling' ? 1.3 : 1.0)
          lightFromWindow = Math.max(lightFromWindow, contribution)
        }
        nearestWindowDist = Math.min(nearestWindowDist, d)
      }
      intensity = Math.max(intensity, lightFromWindow)
      let shadowFactor = 1
      if (baseIntensity > 0.1) {
        const steps = 10
        const stepSize = Math.max(width, height) / steps
        for (let i = 1; i <= steps; i++) {
          const checkX = x + sunDir.x * stepSize * i
          const checkY = y + sunDir.y * stepSize * i
          for (const wall of walls) {
            if (distanceToSegment({ x: checkX, y: checkY }, wall.start, wall.end) < 20) {
              shadowFactor = Math.max(0.2, 1 - i / steps * 0.8)
              break
            }
          }
          if (shadowFactor < 1) break
        }
      }
      intensity *= shadowFactor
      intensity = Math.min(1, intensity)
      cells[r][c] = {
        x,
        y,
        intensity,
        direction: sun.azimuth,
      }
    }
  }
  return cells
}

const normalizeAngle = (angle: number): number => {
  while (angle > Math.PI) angle -= 2 * Math.PI
  while (angle < -Math.PI) angle += 2 * Math.PI
  return angle
}

const isLineBlocked = (from: Point, to: Point, walls: Wall[]): boolean => {
  const steps = 20
  for (let i = 1; i < steps; i++) {
    const t = i / steps
    const px = from.x + (to.x - from.x) * t
    const py = from.y + (to.y - from.y) * t
    for (const wall of walls) {
      if (distanceToSegment({ x: px, y: py }, wall.start, wall.end) < wall.thickness / 2 + 5) {
        return true
      }
    }
  }
  return false
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

export const calculateNaturalLightScore = (lightingCells: LightingCell[][]): number => {
  let total = 0
  let count = 0
  for (const row of lightingCells) {
    for (const cell of row) {
      total += cell.intensity
      count++
    }
  }
  return count > 0 ? total / count : 0
}
