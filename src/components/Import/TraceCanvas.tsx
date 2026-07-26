import { useRef, useEffect, useState, useCallback } from 'react'
import { Space, Button, InputNumber, Typography, message } from 'antd'
import { CheckOutlined, UndoOutlined, DeleteOutlined } from '@ant-design/icons'
import type { Point, Wall, Window, Door } from '@/types'

const { Text } = Typography

interface TraceCanvasProps {
  imageUrl: string
  onComplete: (walls: Wall[], windows: Window[], doors: Door[]) => void
}

type TraceMode = 'scale' | 'wall' | 'door' | 'window'

export const TraceCanvas = ({ imageUrl, onComplete }: TraceCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [mode, setMode] = useState<TraceMode>('scale')
  const [scalePoints, setScalePoints] = useState<Point[]>([])
  const [scaleRealLength, setScaleRealLength] = useState<number>(300)
  const [pixelPerCm, setPixelPerCm] = useState<number>(1)
  const [walls, setWalls] = useState<Wall[]>([])
  const [windows, setWindows] = useState<Window[]>([])
  const [doors, setDoors] = useState<Door[]>([])
  const [currentWallStart, setCurrentWallStart] = useState<Point | null>(null)
  const [mousePos, setMousePos] = useState<Point | null>(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 })

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      const maxW = 800
      const maxH = 550
      let w = img.width
      let h = img.height
      if (w > maxW) {
        h = (maxW / w) * h
        w = maxW
      }
      if (h > maxH) {
        w = (maxH / h) * w
        h = maxH
      }
      setCanvasSize({ w, h })
      setImgLoaded(true)
    }
    img.src = imageUrl
  }, [imageUrl])

  const getCanvasPoint = useCallback((e: React.MouseEvent): Point => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const p = getCanvasPoint(e)
      if (mode === 'scale') {
        if (scalePoints.length < 2) {
          const newPoints = [...scalePoints, p]
          setScalePoints(newPoints)
          if (newPoints.length === 2) {
            const dx = newPoints[1].x - newPoints[0].x
            const dy = newPoints[1].y - newPoints[0].y
            const dist = Math.sqrt(dx * dx + dy * dy)
            setPixelPerCm(dist / scaleRealLength)
            message.success(`比例尺已设置：${Math.round(dist)}像素 = ${scaleRealLength}cm`)
          }
        } else {
          setScalePoints([p])
        }
      } else if (mode === 'wall') {
        if (!currentWallStart) {
          setCurrentWallStart(p)
        } else {
          const dx = Math.abs(p.x - currentWallStart.x)
          const dy = Math.abs(p.y - currentWallStart.y)
          const isHorizontal = dy < dx
          const snapEnd = isHorizontal ? { x: p.x, y: currentWallStart.y } : { x: currentWallStart.x, y: p.y }
          const newWall: Wall = {
            id: `wall-trace-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            start: { x: currentWallStart.x * 10, y: currentWallStart.y * 10 },
            end: { x: snapEnd.x * 10, y: snapEnd.y * 10 },
            thickness: 15,
          }
          setWalls([...walls, newWall])
          setCurrentWallStart(null)
        }
      }
    },
    [mode, scalePoints, scaleRealLength, currentWallStart, walls, getCanvasPoint]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      setMousePos(getCanvasPoint(e))
    },
    [getCanvasPoint]
  )

  const undoLast = () => {
    if (mode === 'scale') {
      setScalePoints(scalePoints.slice(0, -1))
    } else if (mode === 'wall' && walls.length > 0) {
      setWalls(walls.slice(0, -1))
      setCurrentWallStart(null)
    }
  }

  const clearAll = () => {
    setWalls([])
    setWindows([])
    setDoors([])
    setScalePoints([])
    setCurrentWallStart(null)
    message.info('已清空所有描边')
  }

  const handleComplete = () => {
    if (walls.length === 0) {
      message.warning('请至少描一条墙体')
      return
    }
    onComplete(walls, windows, doors)
  }

  useEffect(() => {
    if (!canvasRef.current || !imgLoaded || !imgRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvasSize.w, canvasSize.h)
    ctx.drawImage(imgRef.current, 0, 0, canvasSize.w, canvasSize.h)

    ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)'
    ctx.lineWidth = 2
    walls.forEach((w) => {
      ctx.beginPath()
      ctx.moveTo(w.start.x / 10, w.start.y / 10)
      ctx.lineTo(w.end.x / 10, w.end.y / 10)
      ctx.stroke()
    })

    if (scalePoints.length === 1 && mousePos && mode === 'scale') {
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)'
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(scalePoints[0].x, scalePoints[0].y)
      ctx.lineTo(mousePos.x, mousePos.y)
      ctx.stroke()
      ctx.setLineDash([])
    }
    if (scalePoints.length === 2) {
      ctx.strokeStyle = '#00ffff'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(scalePoints[0].x, scalePoints[0].y)
      ctx.lineTo(scalePoints[1].x, scalePoints[1].y)
      ctx.stroke()
      ctx.fillStyle = '#00ffff'
      scalePoints.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
        ctx.fill()
      })
    }
    if (scalePoints.length === 1 && mode === 'scale') {
      ctx.fillStyle = '#00ffff'
      ctx.beginPath()
      ctx.arc(scalePoints[0].x, scalePoints[0].y, 5, 0, Math.PI * 2)
      ctx.fill()
    }

    if (currentWallStart && mousePos && mode === 'wall') {
      const dx = Math.abs(mousePos.x - currentWallStart.x)
      const dy = Math.abs(mousePos.y - currentWallStart.y)
      const isHor = dy < dx
      const snapEnd = isHor ? { x: mousePos.x, y: currentWallStart.y } : { x: currentWallStart.x, y: mousePos.y }
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)'
      ctx.setLineDash([8, 4])
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(currentWallStart.x, currentWallStart.y)
      ctx.lineTo(snapEnd.x, snapEnd.y)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#ffd700'
      ctx.beginPath()
      ctx.arc(currentWallStart.x, currentWallStart.y, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [canvasSize, imgLoaded, walls, scalePoints, currentWallStart, mousePos, mode])

  return (
    <div>
      <Space style={{ marginBottom: 12 }} size={8} wrap>
        <Button type={mode === 'scale' ? 'primary' : 'default'} onClick={() => setMode('scale')} size="small">
          1. 设置比例尺
        </Button>
        <Button type={mode === 'wall' ? 'primary' : 'default'} onClick={() => setMode('wall')} size="small" disabled={scalePoints.length < 2}>
          2. 描边墙体
        </Button>
        <Button type={mode === 'door' ? 'primary' : 'default'} size="small" disabled>
          3. 标记门
        </Button>
        <Button type={mode === 'window' ? 'primary' : 'default'} size="small" disabled>
          4. 标记窗
        </Button>
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', height: 24, margin: '0 4px' }} />
        <Button icon={<UndoOutlined />} size="small" onClick={undoLast}>撤销</Button>
        <Button icon={<DeleteOutlined />} size="small" danger onClick={clearAll}>清空</Button>
        <Button type="primary" icon={<CheckOutlined />} size="small" onClick={handleComplete} style={{ background: '#d4af37', borderColor: '#d4af37' }}>
          完成描边
        </Button>
      </Space>

      {mode === 'scale' && scalePoints.length < 2 && (
        <div style={{ marginBottom: 12 }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', marginRight: 8 }}>
            请在图片上点击两点（如墙体两端、门宽等已知长度），然后输入实际长度(cm)：
          </Text>
          <InputNumber
            min={10}
            max={2000}
            value={scaleRealLength}
            onChange={(v) => v && setScaleRealLength(v)}
            addonAfter="cm"
            size="small"
            style={{ width: 140 }}
          />
        </div>
      )}

      <div style={{ background: '#000', borderRadius: 8, overflow: 'hidden', textAlign: 'center' }}>
        <canvas
          ref={canvasRef}
          width={canvasSize.w}
          height={canvasSize.h}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          style={{ cursor: 'crosshair', maxWidth: '100%' }}
        />
      </div>

      <div style={{ marginTop: 8 }}>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
          已描墙体: {walls.length} 条 | 比例尺: {pixelPerCm > 0 ? `${(10 / pixelPerCm).toFixed(1)}px = 10cm` : '未设置'}
        </Text>
      </div>
    </div>
  )
}
