import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { useAppStore } from '@/store'
import { useCanvas } from '@/hooks/useCanvas'
import type { FloorPlan, Wall, Window, Door, Point } from '@/types'
import { generateId, distance, pointToLineDistance, snapPointToGrid } from '@/utils'
import { calculateWindField, calculateLightingField, generateFlyingStarChart, calculateCellEnergy, getTideLevel, getStarStatus, NINE_STAR_COLORS, getStarStatusName } from '@/engine'

const GRID_SIZE = 20
const WALL_THICKNESS = 15
const DOOR_WIDTH = 80
const WINDOW_WIDTH = 100
const SNAP_THRESHOLD = 15

interface FloorPlanCanvasProps {
  historyState: FloorPlan
  setHistory: (plan: FloorPlan) => void
  selectedId: string | null
  setSelectedId: (id: string | null) => void
}

const FloorPlanCanvas = ({ historyState, setHistory, selectedId, setSelectedId }: FloorPlanCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)

  const { currentTool, setFloorPlan, showWindField, showEnergy, showLighting, showNineStars, currentTime, manualShichen, windDirection, windStrength } = useAppStore()
  const { canvasState, screenToWorld } = useCanvas(canvasRef)

  const worldBounds = useMemo(() => {
    const allPoints: Point[] = []
    historyState.walls.forEach(w => { allPoints.push(w.start, w.end) })
    historyState.windows.forEach(w => allPoints.push(w.position))
    historyState.doors.forEach(d => allPoints.push(d.position))
    if (allPoints.length === 0) {
      return { minX: 0, minY: 0, maxX: 800, maxY: 600 }
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const p of allPoints) {
      minX = Math.min(minX, p.x)
      minY = Math.min(minY, p.y)
      maxX = Math.max(maxX, p.x)
      maxY = Math.max(maxY, p.y)
    }
    const padding = 200
    return {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding,
    }
  }, [historyState])

  const hour = useMemo(() => currentTime.getHours() + currentTime.getMinutes() / 60, [currentTime])

  const windData = useMemo(() => {
    if (!showWindField && !showEnergy) return null
    if (historyState.walls.length === 0) return null
    return calculateWindField(historyState.walls, historyState.windows, historyState.doors, windDirection, windStrength, worldBounds)
  }, [historyState, windDirection, windStrength, worldBounds, showWindField, showEnergy])

  const lightData = useMemo(() => {
    if (!showLighting) return null
    if (historyState.walls.length === 0) return null
    return calculateLightingField(historyState.walls, historyState.windows, worldBounds, hour, historyState.orientation)
  }, [historyState, worldBounds, hour, showLighting, historyState.orientation])

  const fsChart = useMemo(() => {
    if (!showNineStars && !showEnergy) return null
    return generateFlyingStarChart(historyState.orientation)
  }, [historyState.orientation, showNineStars, showEnergy])

  const tide = useMemo(() => getTideLevel(currentTime), [currentTime])

  const fsEnergy = useMemo(() => {
    if (!fsChart) return null
    if (!showEnergy && !showNineStars) return null
    return calculateCellEnergy(fsChart, currentTime, manualShichen, tide)
  }, [fsChart, currentTime, manualShichen, tide, showEnergy, showNineStars])

  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<Point | null>(null)
  const [currentMouse, setCurrentMouse] = useState<Point | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 })
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  useEffect(() => {
    setFloorPlan(historyState)
  }, [historyState, setFloorPlan])

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setCanvasSize({ width: rect.width, height: rect.height })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const findNearestWall = useCallback(
    (point: Point): { wall: Wall; closest: Point; t: number } | null => {
      let nearest: { wall: Wall; closest: Point; t: number; dist: number } | null = null
      for (const wall of historyState.walls) {
        const result = pointToLineDistance(point, wall.start, wall.end, SNAP_THRESHOLD / canvasState.scale)
        if (result && (!nearest || result.distance < nearest.dist)) {
          nearest = { wall, closest: result.point, t: result.t, dist: result.distance }
        }
      }
      return nearest ? { wall: nearest.wall, closest: nearest.closest, t: nearest.t } : null
    },
    [historyState.walls, canvasState.scale]
  )

  const findEndpoint = useCallback(
    (point: Point): Point | null => {
      const threshold = SNAP_THRESHOLD / canvasState.scale
      for (const wall of historyState.walls) {
        if (distance(point, wall.start) < threshold) return wall.start
        if (distance(point, wall.end) < threshold) return wall.end
      }
      return null
    },
    [historyState.walls, canvasState.scale]
  )

  const getSnappedPoint = useCallback(
    (point: Point): Point => {
      const endpoint = findEndpoint(point)
      if (endpoint) return endpoint
      return snapPointToGrid(point, GRID_SIZE)
    },
    [findEndpoint]
  )

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return

    const worldPos = screenToWorld(e.clientX, e.clientY)

    if (currentTool === 'select') {
      let found = false
      for (const wall of historyState.walls) {
        const result = pointToLineDistance(worldPos, wall.start, wall.end, WALL_THICKNESS / 2 + 5)
        if (result) {
          setSelectedId(wall.id)
          setIsDragging(true)
          setDragOffset({ x: worldPos.x - wall.start.x, y: worldPos.y - wall.start.y })
          found = true
          break
        }
      }
      if (!found) {
        for (const win of historyState.windows) {
          if (distance(worldPos, win.position) < 30) {
            setSelectedId(win.id)
            setIsDragging(true)
            setDragOffset({ x: worldPos.x - win.position.x, y: worldPos.y - win.position.y })
            found = true
            break
          }
        }
      }
      if (!found) {
        for (const door of historyState.doors) {
          if (distance(worldPos, door.position) < 30) {
            setSelectedId(door.id)
            setIsDragging(true)
            setDragOffset({ x: worldPos.x - door.position.x, y: worldPos.y - door.position.y })
            found = true
            break
          }
        }
      }
      if (!found) {
        setSelectedId(null)
      }
      return
    }

    if (currentTool === 'erase') {
      const newPlan = { ...historyState }
      newPlan.walls = newPlan.walls.filter((w) => {
        const result = pointToLineDistance(worldPos, w.start, w.end, WALL_THICKNESS / 2 + 5)
        return !result
      })
      newPlan.windows = newPlan.windows.filter((w) => distance(worldPos, w.position) > 30)
      newPlan.doors = newPlan.doors.filter((d) => distance(worldPos, d.position) > 30)
      setHistory(newPlan)
      return
    }

    setIsDrawing(true)
    setDrawStart(getSnappedPoint(worldPos))
    setCurrentMouse(worldPos)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const worldPos = screenToWorld(e.clientX, e.clientY)
    setCurrentMouse(worldPos)

    if (isDragging && selectedId) {
      const newPlan = { ...historyState }
      const newPos = { x: worldPos.x - dragOffset.x, y: worldPos.y - dragOffset.y }
      for (const wall of newPlan.walls) {
        if (wall.id === selectedId) {
          const dx = wall.end.x - wall.start.x
          const dy = wall.end.y - wall.start.y
          wall.start = newPos
          wall.end = { x: newPos.x + dx, y: newPos.y + dy }
        }
      }
      for (const win of newPlan.windows) {
        if (win.id === selectedId) {
          win.position = newPos
        }
      }
      for (const door of newPlan.doors) {
        if (door.id === selectedId) {
          door.position = newPos
        }
      }
      setHistory(newPlan)
    }
  }

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
      return
    }

    if (!isDrawing || !drawStart || !currentMouse) {
      setIsDrawing(false)
      setDrawStart(null)
      return
    }

    const endPos = getSnappedPoint(currentMouse)
    const newPlan = { ...historyState }

    if (currentTool === 'wall') {
      if (distance(drawStart, endPos) > GRID_SIZE / 2) {
        const wall: Wall = {
          id: generateId(),
          start: drawStart,
          end: endPos,
          thickness: WALL_THICKNESS,
        }
        newPlan.walls = [...newPlan.walls, wall]
        setHistory(newPlan)
      }
    } else if (currentTool === 'door' || currentTool === 'window') {
      const nearestWall = findNearestWall(currentMouse)
      if (nearestWall) {
        if (currentTool === 'door') {
          const door: Door = {
            id: generateId(),
            position: nearestWall.closest,
            width: DOOR_WIDTH,
            orientation: Math.atan2(
              nearestWall.wall.end.y - nearestWall.wall.start.y,
              nearestWall.wall.end.x - nearestWall.wall.start.x
            ),
            isOpen: true,
          }
          newPlan.doors = [...newPlan.doors, door]
        } else {
          const win: Window = {
            id: generateId(),
            position: nearestWall.closest,
            width: WINDOW_WIDTH,
            height: 120,
            type: 'window',
            orientation: Math.atan2(
              nearestWall.wall.end.y - nearestWall.wall.start.y,
              nearestWall.wall.end.x - nearestWall.wall.start.x
            ),
          }
          newPlan.windows = [...newPlan.windows, win]
        }
        setHistory(newPlan)
      }
    }

    setIsDrawing(false)
    setDrawStart(null)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const palaceNames = ['巽', '离', '坤', '震', '中', '兑', '艮', '坎', '乾']

    const render = () => {
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)

      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

      ctx.save()
      ctx.translate(canvasState.offset.x, canvasState.offset.y)
      ctx.scale(canvasState.scale, canvasState.scale)

      if (showLighting && lightData) {
        for (const row of lightData) {
          for (const cell of row) {
            const cellSize = (worldBounds.maxX - worldBounds.minX) / 20
            const intensity = cell.intensity
            ctx.fillStyle = `rgba(255, ${Math.round(220 + 35 * intensity)}, ${Math.round(150 + 50 * intensity)}, ${intensity * 0.3})`
            ctx.fillRect(cell.x - cellSize/2, cell.y - cellSize/2, cellSize, cellSize)
          }
        }
      }

      if (showEnergy && windData && fsEnergy) {
        const gridSize = 20
        const cellW = (worldBounds.maxX - worldBounds.minX) / gridSize
        const cellH = (worldBounds.maxY - worldBounds.minY) / gridSize
        for (let r = 0; r < gridSize; r++) {
          for (let c = 0; c < gridSize; c++) {
            const cell = windData.cells[r][c]
            const fengR = Math.min(2, Math.floor(r / (gridSize / 3)))
            const fengC = Math.min(2, Math.floor(c / (gridSize / 3)))
            const fengIdx = fengR * 3 + fengC
            const fengE = fsEnergy[fengIdx]?.finalEnergy || 0.5
            const total = cell.speed * 0.4 + fengE * 0.6
            const hue = 120 - total * 120
            ctx.fillStyle = `hsla(${hue}, 80%, 50%, ${total * 0.25})`
            ctx.fillRect(cell.x - cellW/2, cell.y - cellH/2, cellW, cellH)
          }
        }
      }

      if (showWindField && windData) {
        ctx.strokeStyle = 'rgba(100, 180, 255, 0.5)'
        ctx.lineWidth = 1.5 / canvasState.scale
        for (let r = 0; r < windData.cells.length; r += 2) {
          for (let c = 0; c < windData.cells[r].length; c += 2) {
            const cell = windData.cells[r][c]
            const speed = Math.hypot(cell.u, cell.v)
            if (speed < 0.05) continue
            const len = Math.min(30 / canvasState.scale, speed * 40 / canvasState.scale)
            const angle = Math.atan2(cell.v, cell.u)
            ctx.beginPath()
            ctx.moveTo(cell.x, cell.y)
            ctx.lineTo(cell.x + Math.cos(angle) * len, cell.y + Math.sin(angle) * len)
            ctx.stroke()
            const arrowLen = len * 0.3
            const arrowAngle = 0.5
            ctx.beginPath()
            const ex = cell.x + Math.cos(angle) * len
            const ey = cell.y + Math.sin(angle) * len
            ctx.moveTo(ex, ey)
            ctx.lineTo(ex - Math.cos(angle - arrowAngle) * arrowLen, ey - Math.sin(angle - arrowAngle) * arrowLen)
            ctx.moveTo(ex, ey)
            ctx.lineTo(ex - Math.cos(angle + arrowAngle) * arrowLen, ey - Math.sin(angle + arrowAngle) * arrowLen)
            ctx.stroke()
          }
        }
      }

      if (showNineStars && fsChart && fsEnergy) {
        const palaceW = (worldBounds.maxX - worldBounds.minX) / 3
        const palaceH = (worldBounds.maxY - worldBounds.minY) / 3
        ctx.font = `${16 / canvasState.scale}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const idx = r * 3 + c
            const px = worldBounds.minX + c * palaceW + palaceW / 2
            const py = worldBounds.minY + r * palaceH + palaceH / 2
            const [mStar, fStar] = fsChart.grid[r][c]
            const energy = fsEnergy[idx]
            ctx.strokeStyle = `rgba(212, 175, 55, ${0.15 + energy.finalEnergy * 0.2})`
            ctx.lineWidth = 1 / canvasState.scale
            ctx.strokeRect(worldBounds.minX + c * palaceW, worldBounds.minY + r * palaceH, palaceW, palaceH)
            ctx.fillStyle = `rgba(212, 175, 55, ${energy.finalEnergy * 0.15})`
            ctx.fillRect(worldBounds.minX + c * palaceW, worldBounds.minY + r * palaceH, palaceW, palaceH)
            ctx.fillStyle = 'rgba(255,255,255,0.4)'
            ctx.font = `${10 / canvasState.scale}px sans-serif`
            ctx.fillText(`${palaceNames[idx]}宫`, worldBounds.minX + c * palaceW + 30 / canvasState.scale, worldBounds.minY + r * palaceH + 20 / canvasState.scale)
            ctx.fillStyle = NINE_STAR_COLORS[mStar]
            ctx.font = `bold ${20 / canvasState.scale}px sans-serif`
            ctx.fillText(String(mStar), px - 15 / canvasState.scale, py)
            ctx.fillStyle = 'rgba(255,255,255,0.3)'
            ctx.font = `${8 / canvasState.scale}px sans-serif`
            ctx.fillText(getStarStatusName(getStarStatus(mStar, fsChart.period)), px - 15 / canvasState.scale, py + 18 / canvasState.scale)
            ctx.fillStyle = NINE_STAR_COLORS[fStar]
            ctx.font = `bold ${20 / canvasState.scale}px sans-serif`
            ctx.fillText(String(fStar), px + 15 / canvasState.scale, py)
            ctx.fillStyle = 'rgba(255,255,255,0.3)'
            ctx.font = `${8 / canvasState.scale}px sans-serif`
            ctx.fillText(getStarStatusName(getStarStatus(fStar, fsChart.period)), px + 15 / canvasState.scale, py + 18 / canvasState.scale)
            ctx.fillStyle = `rgba(212,175,55,${0.5 + energy.finalEnergy * 0.5})`
            ctx.font = `${10 / canvasState.scale}px sans-serif`
            ctx.fillText(`${Math.round(energy.finalEnergy * 100)}`, worldBounds.minX + (c + 1) * palaceW - 20 / canvasState.scale, worldBounds.minY + (r + 1) * palaceH - 15 / canvasState.scale)
          }
        }
      }

      const gridSize = GRID_SIZE
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.lineWidth = 1 / canvasState.scale

      const startX = Math.floor(-canvasState.offset.x / canvasState.scale / gridSize) * gridSize
      const startY = Math.floor(-canvasState.offset.y / canvasState.scale / gridSize) * gridSize
      const endX = startX + canvasSize.width / canvasState.scale + gridSize * 2
      const endY = startY + canvasSize.height / canvasState.scale + gridSize * 2

      for (let x = startX; x < endX; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, startY)
        ctx.lineTo(x, endY)
        ctx.stroke()
      }
      for (let y = startY; y < endY; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(startX, y)
        ctx.lineTo(endX, y)
        ctx.stroke()
      }

      ctx.strokeStyle = 'rgba(255, 215, 0, 0.1)'
      ctx.lineWidth = 1 / canvasState.scale
      for (let x = startX; x < endX; x += gridSize * 5) {
        ctx.beginPath()
        ctx.moveTo(x, startY)
        ctx.lineTo(x, endY)
        ctx.stroke()
      }
      for (let y = startY; y < endY; y += gridSize * 5) {
        ctx.beginPath()
        ctx.moveTo(startX, y)
        ctx.lineTo(endX, y)
        ctx.stroke()
      }

      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      for (const wall of historyState.walls) {
        ctx.beginPath()
        ctx.moveTo(wall.start.x, wall.start.y)
        ctx.lineTo(wall.end.x, wall.end.y)
        ctx.strokeStyle = selectedId === wall.id ? '#ffd700' : '#8b7355'
        ctx.lineWidth = WALL_THICKNESS
        ctx.stroke()
      }

      for (const win of historyState.windows) {
        ctx.save()
        ctx.translate(win.position.x, win.position.y)
        ctx.rotate(win.orientation)
        ctx.fillStyle = selectedId === win.id ? '#ffd700' : '#87ceeb'
        ctx.fillRect(-win.width / 2, -WALL_THICKNESS / 2 - 5, win.width, WALL_THICKNESS + 10)
        ctx.strokeStyle = '#4a90d9'
        ctx.lineWidth = 2
        ctx.strokeRect(-win.width / 2, -WALL_THICKNESS / 2 - 5, win.width, WALL_THICKNESS + 10)
        ctx.beginPath()
        ctx.moveTo(-win.width / 4, -WALL_THICKNESS / 2 - 5)
        ctx.lineTo(-win.width / 4, WALL_THICKNESS / 2 + 5)
        ctx.moveTo(win.width / 4, -WALL_THICKNESS / 2 - 5)
        ctx.lineTo(win.width / 4, WALL_THICKNESS / 2 + 5)
        ctx.stroke()
        ctx.restore()
      }

      for (const door of historyState.doors) {
        ctx.save()
        ctx.translate(door.position.x, door.position.y)
        ctx.rotate(door.orientation)
        ctx.fillStyle = selectedId === door.id ? '#ffd700' : '#deb887'
        ctx.fillRect(-door.width / 2, -WALL_THICKNESS / 2, door.width / 2, WALL_THICKNESS)
        ctx.strokeStyle = '#8b4513'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(-door.width / 2, 0, door.width, 0, Math.PI / 2)
        ctx.stroke()
        ctx.restore()
      }

      if (isDrawing && drawStart && currentMouse) {
        const endPos = getSnappedPoint(currentMouse)
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)'
        ctx.lineWidth = WALL_THICKNESS
        ctx.setLineDash([10, 10])
        ctx.beginPath()
        ctx.moveTo(drawStart.x, drawStart.y)
        ctx.lineTo(endPos.x, endPos.y)
        ctx.stroke()
        ctx.setLineDash([])
      }

      ctx.restore()

      animationRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [canvasSize, canvasState, historyState, isDrawing, drawStart, currentMouse, selectedId, getSnappedPoint, showWindField, showEnergy, showLighting, showNineStars, windDirection, windStrength, currentTime, manualShichen, worldBounds])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: currentTool === 'select' ? (isDragging ? 'grabbing' : 'default') : 'crosshair',
          display: 'block',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          color: 'rgba(255,255,255,0.6)',
          fontSize: 12,
          pointerEvents: 'none',
        }}
      >
        缩放: {Math.round(canvasState.scale * 100)}% | 空格+拖拽平移 | 滚轮缩放 | Ctrl+Z 撤销 | Delete 删除选中
      </div>
    </div>
  )
}

export default FloorPlanCanvas
