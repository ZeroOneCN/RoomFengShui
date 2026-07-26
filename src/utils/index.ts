export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11)
}

export const distance = (p1: { x: number; y: number }, p2: { x: number; y: number }): number => {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2)
}

export const distanceToSegment = (
  p: { x: number; y: number },
  v: { x: number; y: number },
  w: { x: number; y: number }
): number => {
  const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2
  if (l2 === 0) return distance(p, v)
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2
  t = Math.max(0, Math.min(1, t))
  return distance(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) })
}

export const pointToLineDistance = (
  point: { x: number; y: number },
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number },
  threshold: number = 10
): { distance: number; point: { x: number; y: number }; t: number } | null => {
  const dx = lineEnd.x - lineStart.x
  const dy = lineEnd.y - lineStart.y
  const lenSq = dx * dx + dy * dy

  if (lenSq === 0) {
    const d = distance(point, lineStart)
    return d <= threshold ? { distance: d, point: lineStart, t: 0 } : null
  }

  let t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))

  const closest = {
    x: lineStart.x + t * dx,
    y: lineStart.y + t * dy,
  }

  const d = distance(point, closest)
  return d <= threshold ? { distance: d, point: closest, t } : null
}

export const snapToGrid = (value: number, gridSize: number = 10): number => {
  return Math.round(value / gridSize) * gridSize
}

export const snapPointToGrid = (
  point: { x: number; y: number },
  gridSize: number = 10
): { x: number; y: number } => ({
  x: snapToGrid(point.x, gridSize),
  y: snapToGrid(point.y, gridSize),
})

export const degreesToRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180)
}

export const radiansToDegrees = (radians: number): number => {
  return radians * (180 / Math.PI)
}

export { createDefaultFloorPlan, createEmptyFloorPlan } from './defaultPlan'
