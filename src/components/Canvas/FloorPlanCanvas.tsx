import { useRef, useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/store'
import { useCanvas } from '@/hooks/useCanvas'
import type { FloorPlan, Wall, Window, Door, Point } from '@/types'
import { generateId, distance, pointToLineDistance, snapPointToGrid } from '@/utils'

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

  const { currentTool, setFloorPlan } = useAppStore()
  const { canvasState, screenToWorld } = useCanvas(canvasRef)

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

    const render = () => {
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)

      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

      ctx.save()
      ctx.translate(canvasState.offset.x, canvasState.offset.y)
      ctx.scale(canvasState.scale, canvasState.scale)

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
  }, [canvasSize, canvasState, historyState, isDrawing, drawStart, currentMouse, selectedId, getSnappedPoint])

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
