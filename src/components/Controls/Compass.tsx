import { useState, useEffect, useRef } from 'react'
import { InputNumber, Slider } from 'antd'

interface CompassProps {
  orientation: number
  onChange: (degrees: number) => void
}

const DIRECTIONS = [
  { name: '北', abbr: 'N', angle: 0 },
  { name: '东北', abbr: 'NE', angle: 45 },
  { name: '东', abbr: 'E', angle: 90 },
  { name: '东南', abbr: 'SE', angle: 135 },
  { name: '南', abbr: 'S', angle: 180 },
  { name: '西南', abbr: 'SW', angle: 225 },
  { name: '西', abbr: 'W', angle: 270 },
  { name: '西北', abbr: 'NW', angle: 315 },
]

const TWENTY_FOUR_MOUNTAINS = [
  { name: '壬', angle: 337.5 },
  { name: '子', angle: 352.5 },
  { name: '癸', angle: 7.5 },
  { name: '丑', angle: 22.5 },
  { name: '艮', angle: 37.5 },
  { name: '寅', angle: 52.5 },
  { name: '甲', angle: 67.5 },
  { name: '卯', angle: 82.5 },
  { name: '乙', angle: 97.5 },
  { name: '辰', angle: 112.5 },
  { name: '巽', angle: 127.5 },
  { name: '巳', angle: 142.5 },
  { name: '丙', angle: 157.5 },
  { name: '午', angle: 172.5 },
  { name: '丁', angle: 187.5 },
  { name: '未', angle: 202.5 },
  { name: '坤', angle: 217.5 },
  { name: '申', angle: 232.5 },
  { name: '庚', angle: 247.5 },
  { name: '酉', angle: 262.5 },
  { name: '辛', angle: 277.5 },
  { name: '戌', angle: 292.5 },
  { name: '乾', angle: 307.5 },
  { name: '亥', angle: 322.5 },
]

const Compass = ({ orientation, onChange }: CompassProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 160
    const center = size / 2
    const radius = size / 2 - 10

    ctx.clearRect(0, 0, size, size)

    ctx.save()
    ctx.translate(center, center)
    ctx.rotate((orientation * Math.PI) / 180)

    ctx.beginPath()
    ctx.arc(0, 0, radius, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(30, 30, 50, 0.9)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(0, 0, radius - 20, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)'
    ctx.lineWidth = 1
    ctx.stroke()

    for (const dir of DIRECTIONS) {
      const angle = (dir.angle * Math.PI) / 180
      const x1 = Math.sin(angle) * (radius - 3)
      const y1 = -Math.cos(angle) * (radius - 3)
      const x2 = Math.sin(angle) * (radius - 15)
      const y2 = -Math.cos(angle) * (radius - 15)
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.lineWidth = dir.angle % 90 === 0 ? 2 : 1
      ctx.stroke()
    }

    ctx.rotate(-Math.PI / 2)
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (const dir of DIRECTIONS) {
      const angle = (dir.angle * Math.PI) / 180
      const x = Math.cos(angle) * (radius - 30)
      const y = Math.sin(angle) * (radius - 30)
      ctx.fillStyle = dir.angle % 180 === 0 ? '#ff6b6b' : '#ffffff'
      ctx.fillText(dir.abbr, x, y)
    }

    ctx.restore()

    ctx.save()
    ctx.translate(center, center)
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'

    for (const mountain of TWENTY_FOUR_MOUNTAINS) {
      const angle = ((mountain.angle + orientation) * Math.PI) / 180
      const x = Math.sin(angle) * (radius - 40)
      const y = -Math.cos(angle) * (radius - 40)
      ctx.fillText(mountain.name, x, y)
    }

    ctx.restore()

    ctx.save()
    ctx.translate(center, center)
    ctx.beginPath()
    ctx.moveTo(0, -radius + 5)
    ctx.lineTo(-8, radius - 40)
    ctx.lineTo(0, radius - 30)
    ctx.lineTo(8, radius - 40)
    ctx.closePath()
    ctx.fillStyle = '#ff4444'
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.restore()

    ctx.beginPath()
    ctx.arc(center, center, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#ffd700'
    ctx.fill()
  }, [orientation])

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const x = e.clientX - rect.left - centerX
    const y = e.clientY - rect.top - centerY

    let angle = Math.atan2(x, -y) * (180 / Math.PI)
    if (angle < 0) angle += 360
    onChange(Math.round(angle))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas
        ref={canvasRef}
        width={160}
        height={160}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab', margin: '0 auto', display: 'block' }}
      />
      <div style={{ marginTop: 8 }}>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>朝向: </span>
        <InputNumber
          size="small"
          min={0}
          max={359}
          value={orientation}
          onChange={(value) => onChange(value ?? 0)}
          style={{ width: 80 }}
          suffix="°"
        />
      </div>
      <Slider
        min={0}
        max={359}
        value={orientation}
        onChange={onChange}
        style={{ marginTop: 8 }}
      />
    </div>
  )
}

export default Compass
