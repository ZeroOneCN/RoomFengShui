import { useEffect, useState } from 'react'
import { Space, Tag, Tooltip, Typography, Slider, Switch } from 'antd'
import {
  ClockCircleOutlined,
  MoonOutlined,
  ThunderboltOutlined,
  StarOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import { useAppStore } from '@/store'
import { getAstronomyData, getCurrentPeriod, SHICHEN_LIST } from '@/engine'
import { SHICHEN_NAMES } from '@/types'
import type { ShiChen } from '@/types'

const { Text } = Typography

const InfoBar = () => {
  const { currentTime, autoTime, isPlaying, demoSpeed, manualShichen, setCurrentTime, setAutoTime, setPlaying, setDemoSpeed, setManualShichen } = useAppStore()
  const [astroData, setAstroData] = useState(getAstronomyData(currentTime))

  useEffect(() => {
    setAstroData(getAstronomyData(currentTime))
  }, [currentTime])

  useEffect(() => {
    if (!autoTime || !isPlaying) return
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [autoTime, isPlaying, setCurrentTime])

  const displayShichen = manualShichen || astroData.shichen
  const period = getCurrentPeriod(currentTime.getFullYear())

  const getMoonIcon = () => {
    const illum = Math.round(astroData.moonIllumination * 100)
    return (
      <Tooltip title={`${astroData.moonPhaseName} (亮度${illum}%)`}>
        <Space size={4}>
          <MoonOutlined />
          <Text style={{ color: '#d4af37' }}>{illum}%</Text>
        </Space>
      </Tooltip>
    )
  }

  const getTideColor = (level: number) => {
    if (level > 0.7) return '#52c41a'
    if (level > 0.4) return '#faad14'
    return '#ff4d4f'
  }

  const handleShichenClick = (shichen: ShiChen) => {
    if (manualShichen === shichen) {
      setManualShichen(null)
      setAutoTime(true)
    } else {
      setManualShichen(shichen)
      setAutoTime(false)
      const [startHour] = astroData.timeRange
      const newDate = new Date(currentTime)
      newDate.setHours(startHour === 23 ? 0 : startHour)
      setCurrentTime(newDate)
    }
  }

  return (
    <div
      style={{
        height: 56,
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        justifyContent: 'space-between',
      }}
    >
      <Space size="large" align="center">
        <Space size={8}>
          <StarOutlined style={{ color: '#d4af37', fontSize: 18 }} />
          <Text strong style={{ color: '#d4af37', fontSize: 16 }}>
            第{['一', '二', '三', '四', '五', '六', '七', '八', '九'][period - 1]}运
          </Text>
        </Space>

        <Divider style={{ height: 24 }} />

        <Space direction="vertical" size={0} style={{ minWidth: 200 }}>
          <Space size={8}>
            <ClockCircleOutlined style={{ color: '#8c9eff' }} />
            <Tooltip title={astroData.lunarDate}>
              <Text style={{ color: '#e8e8e8' }}>
                {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Tooltip>
            <Tag color="purple" style={{ margin: 0, fontWeight: 'bold' }}>
              {SHICHEN_NAMES[displayShichen]}时
            </Tag>
          </Space>
          <Space size={4} style={{ marginTop: 2 }}>
            {SHICHEN_LIST.map((sc) => (
              <div
                key={sc}
                onClick={() => handleShichenClick(sc)}
                style={{
                  width: 18,
                  height: 16,
                  fontSize: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  borderRadius: 2,
                  background: displayShichen === sc ? 'rgba(212,175,55,0.4)' : 'transparent',
                  color: displayShichen === sc ? '#d4af37' : 'rgba(255,255,255,0.5)',
                  border: displayShichen === sc ? '1px solid #d4af37' : '1px solid transparent',
                }}
              >
                {SHICHEN_NAMES[sc]}
              </div>
            ))}
          </Space>
        </Space>

        <Divider style={{ height: 24 }} />

        <Space size={12}>
          {getMoonIcon()}
          <Tooltip title={`潮汐强度: ${Math.round(astroData.tideLevel * 100)}%`}>
            <Space size={4}>
              <ThunderboltOutlined style={{ color: getTideColor(astroData.tideLevel) }} />
              <div
                style={{
                  width: 40,
                  height: 6,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${astroData.tideLevel * 100}%`,
                    height: '100%',
                    background: getTideColor(astroData.tideLevel),
                    transition: 'width 0.5s',
                  }}
                />
              </div>
            </Space>
          </Tooltip>
          <Tooltip title={`月球方位: ${Math.round(astroData.moonAzimuth)}°`}>
            <Space size={4}>
              <EnvironmentOutlined style={{ color: '#8c9eff', transform: `rotate(${astroData.moonAzimuth}deg)` }} />
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                {Math.round(astroData.moonAzimuth)}°
              </Text>
            </Space>
          </Tooltip>
        </Space>
      </Space>

      <Space size="middle" align="center">
        <Space size={8}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>自动时间</Text>
          <Switch size="small" checked={autoTime} onChange={setAutoTime} />
        </Space>

        <Tooltip title={isPlaying ? '暂停' : '播放'}>
          <div
            onClick={() => setPlaying(!isPlaying)}
            style={{ cursor: 'pointer', fontSize: 22, color: isPlaying ? '#52c41a' : '#d4af37' }}
          >
            {isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
          </div>
        </Tooltip>

        <Space size={8} style={{ width: 120 }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>速度</Text>
          <Slider
            min={0.5}
            max={10}
            step={0.5}
            value={demoSpeed}
            onChange={setDemoSpeed}
            style={{ flex: 1, margin: 0 }}
            tooltip={{ formatter: (v) => `${v}x` }}
          />
        </Space>

        <Divider style={{ height: 24 }} />

        <Space size={8}>
          <Tag color="blue">值年: {astroData.yearStar}白</Tag>
          <Tag color="cyan">值月: {astroData.monthStar}白</Tag>
          <Tag color="geekblue">值日: {astroData.dayStar}白</Tag>
          <Tag color="gold">值时: {astroData.timeStar}白</Tag>
        </Space>
      </Space>
    </div>
  )
}

const Divider = ({ style }: { style?: React.CSSProperties }) => (
  <div style={{ width: 1, height: 24, background: 'rgba(212,175,55,0.3)', ...style }} />
)

export default InfoBar
