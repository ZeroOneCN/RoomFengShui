import { useEffect, useRef, useState, useCallback } from 'react'
import { Layout, Card, Typography, Space, Button, Slider, Switch, Select, Tag, Divider } from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ThunderboltOutlined,
  CloudOutlined,
  BulbOutlined,
  CompassOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Content } = Layout
const { Title, Text, Paragraph } = Typography

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  type: 'wind' | 'energy' | 'light'
  color: string
  size: number
}

const wallLines = [
  { x1: 100, y1: 80, x2: 700, y2: 80 },
  { x1: 700, y1: 80, x2: 700, y2: 520 },
  { x1: 700, y1: 520, x2: 100, y2: 520 },
  { x1: 100, y1: 520, x2: 100, y2: 80 },
  { x1: 400, y1: 80, x2: 400, y2: 250 },
  { x1: 400, y1: 350, x2: 400, y2: 520 },
  { x1: 100, y1: 300, x2: 200, y2: 300 },
  { x1: 280, y1: 300, x2: 400, y2: 300 },
  { x1: 200, y1: 80, x2: 200, y2: 220 },
]

const windowPositions = [
  { x: 300, y: 74, w: 100, h: 12, orientation: 0 },
  { x: 706, y: 250, w: 12, h: 100, orientation: 90 },
]

const doorPositions = [
  { x: 360, y: 300, w: 80, h: 15, orientation: 90 },
]

type DemoMode = 'wind' | 'energy' | 'light' | 'all'

const DemoPage = () => {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)
  const timeRef = useRef(0)

  const [isPlaying, setIsPlaying] = useState(true)
  const [demoMode, setDemoMode] = useState<DemoMode>('all')
  const [windDir, setWindDir] = useState(0)
  const [windSpeed, setWindSpeed] = useState(0.6)
  const [particleCount, setParticleCount] = useState(300)
  const [showWalls, setShowWalls] = useState(true)
  const [showNinePalace, setShowNinePalace] = useState(true)
  const [energyLevel, setEnergyLevel] = useState(0.7)
  const [stats, setStats] = useState({ avgSpeed: 0, energyPoints: 0, time: 0 })

  const isInWall = useCallback((x: number, y: number, margin: number = 8): boolean => {
    for (const w of wallLines) {
      const dx = w.x2 - w.x1
      const dy = w.y2 - w.y1
      const lenSq = dx * dx + dy * dy
      if (lenSq === 0) continue
      let t = ((x - w.x1) * dx + (y - w.y1) * dy) / lenSq
      t = Math.max(0, Math.min(1, t))
      const px = w.x1 + t * dx
      const py = w.y1 + t * dy
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2)
      if (dist < margin) return true
    }
    return false
  }, [])

  const isInBounds = (x: number, y: number): boolean => {
    return x > 90 && x < 710 && y > 70 && y < 530
  }

  const spawnParticle = useCallback((): Particle => {
    const angle = (windDir * Math.PI) / 180
    const rand = Math.random()
    let type: Particle['type'] = 'wind'
    let color = '#64b5f6'
    let size = 2 + Math.random() * 2

    if (demoMode === 'energy' || (demoMode === 'all' && rand < 0.3)) {
      type = 'energy'
      const colors = ['#d4af37', '#ffd700', '#ffb347', '#ff6b6b', '#4ecdc4']
      color = colors[Math.floor(Math.random() * colors.length)]
      size = 3 + Math.random() * 3
    } else if (demoMode === 'light' || (demoMode === 'all' && rand < 0.15)) {
      type = 'light'
      color = 'rgba(255, 230, 150, 0.8)'
      size = 4 + Math.random() * 4
    }

    let x = 0, y = 0, vx = 0, vy = 0
    if (type === 'wind') {
      if (windDir < 90 || windDir > 270) {
        x = 95
        y = 100 + Math.random() * 400
      } else {
        x = 695
        y = 100 + Math.random() * 400
      }
      vx = Math.sin(angle) * windSpeed * 2
      vy = -Math.cos(angle) * windSpeed * 2
    } else if (type === 'light') {
      x = windowPositions[0].x + Math.random() * windowPositions[0].w
      y = 85 + Math.random() * 20
      vx = (Math.random() - 0.5) * 0.5
      vy = 0.3 + Math.random() * 0.8
    } else {
      const palaces = [
        { x: 250, y: 180 },
        { x: 550, y: 180 },
        { x: 250, y: 420 },
        { x: 550, y: 420 },
        { x: 400, y: 300 },
      ]
      const p = palaces[Math.floor(Math.random() * palaces.length)]
      x = p.x + (Math.random() - 0.5) * 80
      y = p.y + (Math.random() - 0.5) * 80
      const a = Math.random() * Math.PI * 2
      vx = Math.cos(a) * 0.3
      vy = Math.sin(a) * 0.3
    }

    return {
      x, y, vx, vy,
      life: 0,
      maxLife: type === 'energy' ? 200 + Math.random() * 200 : 300 + Math.random() * 300,
      type, color, size,
    }
  }, [windDir, windSpeed, demoMode])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let lastTime = performance.now()
    particlesRef.current = []

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.67, 3)
      lastTime = now
      timeRef.current += dt

      if (isPlaying) {
        const targetCount = demoMode === 'all' ? particleCount : Math.floor(particleCount * 0.7)
        while (particlesRef.current.length < targetCount) {
          particlesRef.current.push(spawnParticle())
        }

        let speedSum = 0
        let energyCount = 0

        particlesRef.current = particlesRef.current
          .map((p) => {
            p.life += dt

            if (p.type === 'wind') {
              const wa = (windDir * Math.PI) / 180
              p.vx += Math.sin(wa) * 0.05 * windSpeed * dt
              p.vy += -Math.cos(wa) * 0.05 * windSpeed * dt
              p.vx *= 0.98
              p.vy *= 0.98

              if (isInWall(p.x, p.y, 6)) {
                p.vx *= -0.3
                p.vy *= -0.3
                p.x += p.vx * 3
                p.y += p.vy * 3
              }
            } else if (p.type === 'energy') {
              const cx = 400, cy = 300
              const dx = cx - p.x
              const dy = cy - p.y
              const dist = Math.sqrt(dx * dx + dy * dy) + 0.1
              const pull = energyLevel * 0.02
              p.vx += (dx / dist) * pull * dt
              p.vy += (dy / dist) * pull * dt
              p.vx += (Math.random() - 0.5) * 0.3
              p.vy += (Math.random() - 0.5) * 0.3
              p.vx *= 0.95
              p.vy *= 0.95
              energyCount++
              if (dist < 20) {
                p.life = p.maxLife
              }
            } else if (p.type === 'light') {
              p.vy += 0.01 * dt
              p.vy = Math.min(p.vy, 1.5)
              if (isInWall(p.x, p.y, 4)) {
                p.life = p.maxLife
              }
            }

            p.x += p.vx * dt
            p.y += p.vy * dt
            speedSum += Math.sqrt(p.vx * p.vx + p.vy * p.vy)

            return p
          })
          .filter((p) => p.life < p.maxLife && isInBounds(p.x, p.y))

        if (Math.floor(timeRef.current) % 30 === 0) {
          setStats({
            avgSpeed: Math.round((speedSum / Math.max(particlesRef.current.length, 1)) * 50),
            energyPoints: energyCount,
            time: Math.floor(timeRef.current / 60),
          })
        }
      }

      ctx.fillStyle = 'rgba(10, 10, 26, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (showNinePalace) {
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.12)'
        ctx.lineWidth = 1
        for (let i = 1; i < 3; i++) {
          ctx.beginPath()
          ctx.moveTo(100 + i * 200, 80)
          ctx.lineTo(100 + i * 200, 520)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(100, 80 + i * 147)
          ctx.lineTo(700, 80 + i * 147)
          ctx.stroke()
        }
        const palaceNames = ['巽', '离', '坤', '震', '中', '兑', '艮', '坎', '乾']
        const starNums = [4, 9, 2, 3, 5, 7, 8, 1, 6]
        ctx.font = '14px serif'
        ctx.textAlign = 'center'
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const idx = r * 3 + c
            const cx = 200 + c * 200
            const cy = 153 + r * 147
            const pulse = Math.sin(timeRef.current * 0.05 + idx) * 0.3 + 0.7
            ctx.fillStyle = `rgba(212, 175, 55, ${0.1 + pulse * 0.15})`
            ctx.fillText(palaceNames[idx], cx, cy - 8)
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + pulse * 0.3})`
            ctx.font = '20px serif'
            ctx.fillText(String(starNums[idx]), cx, cy + 16)
            ctx.font = '14px serif'
          }
        }
      }

      if (showWalls) {
        ctx.strokeStyle = 'rgba(180, 180, 200, 0.6)'
        ctx.lineWidth = 8
        ctx.lineCap = 'round'
        wallLines.forEach((w) => {
          ctx.beginPath()
          ctx.moveTo(w.x1, w.y1)
          ctx.lineTo(w.x2, w.y2)
          ctx.stroke()
        })
        ctx.fillStyle = 'rgba(100, 180, 255, 0.4)'
        windowPositions.forEach((w) => {
          ctx.fillRect(w.x, w.y, w.w, w.h)
        })
        ctx.fillStyle = 'rgba(200, 150, 100, 0.5)'
        doorPositions.forEach((d) => {
          ctx.fillRect(d.x, d.y, d.w, d.h)
        })
      }

      particlesRef.current.forEach((p) => {
        const alpha = 1 - p.life / p.maxLife
        const pulse = p.type === 'energy' ? 0.7 + Math.sin(timeRef.current * 0.1 + p.x) * 0.3 : 1
        ctx.globalAlpha = alpha * pulse
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * (p.type === 'energy' ? pulse : 1), 0, Math.PI * 2)
        ctx.fill()
        if (p.type === 'wind') {
          ctx.strokeStyle = p.color
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x - p.vx * 5, p.y - p.vy * 5)
          ctx.stroke()
        }
        if (p.type === 'light') {
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
          grd.addColorStop(0, 'rgba(255, 240, 200, 0.3)')
          grd.addColorStop(1, 'rgba(255, 240, 200, 0)')
          ctx.fillStyle = grd
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
          ctx.fill()
        }
      })
      ctx.globalAlpha = 1

      if (demoMode === 'energy' || demoMode === 'all') {
        const cx = 400, cy = 300
        for (let r = 20; r < 150; r += 25) {
          ctx.strokeStyle = `rgba(212, 175, 55, ${0.15 - r / 1500})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(cx, cy, r + Math.sin(timeRef.current * 0.05 + r) * 5, 0, Math.PI * 2)
          ctx.stroke()
        }
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80)
        glow.addColorStop(0, 'rgba(255, 215, 0, 0.15)')
        glow.addColorStop(1, 'rgba(255, 215, 0, 0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(cx, cy, 80, 0, Math.PI * 2)
        ctx.fill()
      }

      const dirAngle = (windDir * Math.PI) / 180
      ctx.save()
      ctx.translate(750, 480)
      ctx.rotate(dirAngle)
      ctx.fillStyle = '#64b5f6'
      ctx.beginPath()
      ctx.moveTo(0, -20)
      ctx.lineTo(-8, 5)
      ctx.lineTo(8, 5)
      ctx.closePath()
      ctx.fill()
      ctx.restore()

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [isPlaying, demoMode, windDir, windSpeed, particleCount, energyLevel, showWalls, showNinePalace, isInWall, spawnParticle])

  const modeLabels: Record<DemoMode, { label: string; color: string; icon: React.ReactNode }> = {
    wind: { label: '风场流体', color: '#64b5f6', icon: <CloudOutlined /> },
    energy: { label: '能量环聚', color: '#d4af37', icon: <ThunderboltOutlined /> },
    light: { label: '光波采光', color: '#ffe696', icon: <BulbOutlined /> },
    all: { label: '综合演示', color: '#4ecdc4', icon: <PlayCircleOutlined /> },
  }

  return (
    <Layout style={{ height: '100vh', background: '#0a0a1a' }}>
      <div
        style={{
          height: 50,
          background: 'rgba(20,20,40,0.9)',
          borderBottom: '1px solid rgba(212,175,55,0.3)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 16,
        }}
      >
        <Button icon={<HomeOutlined />} onClick={() => navigate('/')} style={{ marginRight: 'auto' }}>
          返回首页
        </Button>
        <Title level={5} style={{ color: '#d4af37', margin: 0 }}>
          <ThunderboltOutlined /> 风水能量场动态演示
        </Title>
        <Space>
          <Tag color={modeLabels[demoMode].color} style={{ marginLeft: 'auto' }}>
            {modeLabels[demoMode].icon} {modeLabels[demoMode].label}
          </Tag>
          <Tag>粒子: {particlesRef.current.length}</Tag>
          <Tag color="blue">风速: {stats.avgSpeed}</Tag>
          <Tag color="gold">能量点: {stats.energyPoints}</Tag>
          <Tag>时间: {stats.time}s</Tag>
        </Space>
      </div>
      <Layout>
        <Content style={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              borderRadius: 8,
              border: '1px solid rgba(212,175,55,0.3)',
              background: '#0a0a1a',
            }}
          />
        </Content>
        <div
          style={{
            width: 280,
            background: 'rgba(20,20,40,0.95)',
            borderLeft: '1px solid rgba(212,175,55,0.2)',
            padding: 16,
            overflowY: 'auto',
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size={16}>
            <Card size="small" style={{ background: 'rgba(255,255,255,0.03)', border: 'none' }}>
              <Button
                type={isPlaying ? 'default' : 'primary'}
                icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={() => setIsPlaying(!isPlaying)}
                block
                style={{ marginBottom: 8 }}
              >
                {isPlaying ? '暂停演示' : '开始演示'}
              </Button>
              <Select
                value={demoMode}
                onChange={(v) => setDemoMode(v)}
                style={{ width: '100%' }}
                options={[
                  { value: 'all', label: '🏠 综合演示' },
                  { value: 'wind', label: '💨 风场流体' },
                  { value: 'energy', label: '⚡ 能量环聚' },
                  { value: 'light', label: '☀️ 光波采光' },
                ]}
              />
            </Card>

            <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />

            <div>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                <CompassOutlined /> 风向
              </Text>
              <Slider value={windDir} min={0} max={360} onChange={setWindDir}
                tooltip={{ formatter: (v) => `${v}°` }} />
            </div>

            <div>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                <CloudOutlined /> 风速强度
              </Text>
              <Slider value={windSpeed} min={0.1} max={1.5} step={0.1} onChange={setWindSpeed} />
            </div>

            {(demoMode === 'energy' || demoMode === 'all') && (
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                  <ThunderboltOutlined /> 能量聚集强度
                </Text>
                <Slider value={energyLevel} min={0} max={2} step={0.1} onChange={setEnergyLevel} />
              </div>
            )}

            <div>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>粒子数量</Text>
              <Slider value={particleCount} min={50} max={800} step={50} onChange={setParticleCount} />
            </div>

            <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />

            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>显示墙体</Text>
                <Switch checked={showWalls} onChange={setShowWalls} size="small" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>九宫飞星</Text>
                <Switch checked={showNinePalace} onChange={setShowNinePalace} size="small" />
              </div>
            </Space>

            <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />

            <Card size="small" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <Paragraph style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, margin: 0 }}>
                <b style={{ color: '#d4af37' }}>演示说明：</b>
                <br />• <span style={{ color: '#64b5f6' }}>蓝色粒子</span>表示风流，遇墙反弹
                <br />• <span style={{ color: '#d4af37' }}>金色粒子</span>表示能量，向中宫聚集
                <br />• <span style={{ color: '#ffe696' }}>黄色粒子</span>表示光线，从窗户射入
                <br />• 环聚波纹象征藏风聚气
              </Paragraph>
            </Card>
          </Space>
        </div>
      </Layout>
    </Layout>
  )
}

export default DemoPage
