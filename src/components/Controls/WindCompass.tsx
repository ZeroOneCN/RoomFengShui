import { useRef, useState, useCallback } from 'react'

interface WindCompassProps {
  direction: number
  onChange: (deg: number) => void
  size?: number
}

export const WindDirectionCompass = ({ direction, onChange, size = 100 }: WindCompassProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    updateAngle(e.clientX, e.clientY)
  }, [])

  const updateAngle = (clientX: number, clientY: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = clientX - centerX
    const dy = clientY - centerY
    let angle = Math.atan2(dx, -dy) * (180 / Math.PI)
    angle = ((angle % 360) + 360) % 360
    onChange(Math.round(angle))
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        updateAngle(e.clientX, e.clientY)
      }
    },
    [isDragging]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useRef(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  })

  if (isDragging) {
    window.onmousemove = handleMouseMove
    window.onmouseup = () => {
      setIsDragging(false)
      window.onmousemove = null
      window.onmouseup = null
    }
  }

  const center = size / 2
  const radius = size / 2 - 5

  return (
    <div ref={containerRef} style={{ width: size, height: size, position: 'relative', cursor: 'pointer' }} onMouseDown={handleMouseDown}>
      <svg width={size} height={size}>
        <circle cx={center} cy={center} r={radius} fill="rgba(30,30,60,0.8)" stroke="rgba(100,180,255,0.5)" strokeWidth={1} />
        <circle cx={center} cy={center} r={radius * 0.3} fill="rgba(100,180,255,0.2)" stroke="rgba(100,180,255,0.4)" strokeWidth={1} />
        {['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].map((dir, i) => {
          const angle = (i * 45 - 90) * (Math.PI / 180)
          const x1 = center + Math.cos(angle) * radius * 0.8
          const y1 = center + Math.sin(angle) * radius * 0.8
          return (
            <text
              key={dir}
              x={x1}
              y={y1}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={i === 0 ? '#ff6b6b' : 'rgba(255,255,255,0.6)'}
              fontSize={i % 2 === 0 ? 10 : 7}
              fontWeight={i % 2 === 0 ? 'bold' : 'normal'}
            >
              {dir}
            </text>
          )
        })}
        {[0, 90, 180, 270].map((deg) => {
          const angle = (deg - 90) * (Math.PI / 180)
          const x1 = center + Math.cos(angle) * radius * 0.9
          const y1 = center + Math.sin(angle) * radius * 0.9
          const x2 = center + Math.cos(angle) * radius
          const y2 = center + Math.sin(angle) * radius
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(100,180,255,0.3)" strokeWidth={1} />
        })}
        <g transform={`rotate(${direction} ${center} ${center})`}>
          <path
            d={`M ${center} ${center - radius * 0.7} L ${center - 5} ${center} L ${center + 5} ${center} Z`}
            fill="#64b5f6"
            stroke="#2196f3"
            strokeWidth={1}
          />
          <line x1={center} y1={center} x2={center} y2={center + radius * 0.6} stroke="#64b5f6" strokeWidth={2} />
          <circle cx={center} cy={center} r={4} fill="#2196f3" />
        </g>
      </svg>
      <div style={{ position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: 'rgba(100,180,255,0.8)' }}>
        风向 {direction}°
      </div>
    </div>
  )
}
