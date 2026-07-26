import { useRef, useEffect, useCallback, useState } from 'react'
import type { Point } from '@/types'

interface CanvasState {
  offset: Point
  scale: number
}

interface UseCanvasOptions {
  minScale?: number
  maxScale?: number
  wheelSensitivity?: number
}

export const useCanvas = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: UseCanvasOptions = {}
) => {
  const { minScale = 0.1, maxScale = 5, wheelSensitivity = 0.001 } = options

  const [canvasState, setCanvasState] = useState<CanvasState>({
    offset: { x: 0, y: 0 },
    scale: 1,
  })

  const isDragging = useRef(false)
  const lastMousePos = useRef<Point>({ x: 0, y: 0 })
  const isSpacePressed = useRef(false)

  const screenToWorld = useCallback(
    (screenX: number, screenY: number): Point => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      const x = (screenX - rect.left - canvasState.offset.x) / canvasState.scale
      const y = (screenY - rect.top - canvasState.offset.y) / canvasState.scale
      return { x, y }
    },
    [canvasState.offset, canvasState.scale, canvasRef]
  )

  const worldToScreen = useCallback(
    (worldX: number, worldY: number): Point => {
      const x = worldX * canvasState.scale + canvasState.offset.x
      const y = worldY * canvasState.scale + canvasState.offset.y
      return { x, y }
    },
    [canvasState.offset, canvasState.scale]
  )

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const delta = -e.deltaY * wheelSensitivity
      const newScale = Math.max(minScale, Math.min(maxScale, canvasState.scale * (1 + delta)))

      const scaleRatio = newScale / canvasState.scale
      const newOffsetX = mouseX - (mouseX - canvasState.offset.x) * scaleRatio
      const newOffsetY = mouseY - (mouseY - canvasState.offset.y) * scaleRatio

      setCanvasState({
        offset: { x: newOffsetX, y: newOffsetY },
        scale: newScale,
      })
    },
    [canvasState, minScale, maxScale, wheelSensitivity, canvasRef]
  )

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (isSpacePressed.current || e.button === 1) {
        isDragging.current = true
        lastMousePos.current = { x: e.clientX, y: e.clientY }
        e.preventDefault()
      }
    },
    []
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging.current) {
        const dx = e.clientX - lastMousePos.current.x
        const dy = e.clientY - lastMousePos.current.y
        setCanvasState((prev) => ({
          ...prev,
          offset: { x: prev.offset.x + dx, y: prev.offset.y + dy },
        }))
        lastMousePos.current = { x: e.clientX, y: e.clientY }
      }
    },
    []
  )

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      isSpacePressed.current = true
    }
  }, [])

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      isSpacePressed.current = false
    }
  }, [])

  const resetView = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    setCanvasState({
      offset: { x: 0, y: 0 },
      scale: 1,
    })
  }, [canvasRef])

  const fitToView = useCallback(
    (width: number, height: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const canvasWidth = canvas.width
      const canvasHeight = canvas.height
      const scale = Math.min(canvasWidth / width, canvasHeight / height) * 0.9
      const offsetX = (canvasWidth - width * scale) / 2
      const offsetY = (canvasHeight - height * scale) / 2
      setCanvasState({
        offset: { x: offsetX, y: offsetY },
        scale,
      })
    },
    [canvasRef]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [canvasRef, handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleKeyDown, handleKeyUp])

  return {
    canvasState,
    screenToWorld,
    worldToScreen,
    resetView,
    fitToView,
  }
}
