import { Card, Switch, Space, Typography, Divider, Statistic } from 'antd'
import { useAppStore } from '@/store'
import Compass from '@/components/Controls/Compass'

const { Title, Text } = Typography

const PropertiesPanel = () => {
  const {
    floorPlan,
    setFloorPlan,
    showWindField,
    showEnergy,
    showLighting,
    showNineStars,
    toggleWindField,
    toggleEnergy,
    toggleLighting,
    toggleNineStars,
  } = useAppStore()

  return (
    <div
      style={{
        position: 'absolute',
        right: 20,
        top: 20,
        width: 240,
        background: 'rgba(20, 20, 40, 0.9)',
        borderRadius: 8,
        padding: 16,
        border: '1px solid rgba(255, 215, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto',
      }}
    >
      <Title level={5} style={{ color: '#ffd700', margin: '0 0 16px 0' }}>
        房屋风水分析
      </Title>

      <Card size="small" style={{ background: 'rgba(255,255,255,0.05)', border: 'none', marginBottom: 16 }}>
        <Compass
          orientation={floorPlan.orientation}
          onChange={(deg) => setFloorPlan({ orientation: deg })}
        />
      </Card>

      <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />

      <Title level={5} style={{ color: '#fff', margin: '0 0 12px 0', fontSize: 14 }}>
        图层显示
      </Title>

      <Space direction="vertical" style={{ width: '100%' }} size={8}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>九星旺衰</Text>
          <Switch size="small" checked={showNineStars} onChange={toggleNineStars} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>能量分布</Text>
          <Switch size="small" checked={showEnergy} onChange={toggleEnergy} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>风速强度</Text>
          <Switch size="small" checked={showWindField} onChange={toggleWindField} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>光波采光</Text>
          <Switch size="small" checked={showLighting} onChange={toggleLighting} />
        </div>
      </Space>

      <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />

      <Title level={5} style={{ color: '#fff', margin: '0 0 12px 0', fontSize: 14 }}>
        户型统计
      </Title>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Statistic
          title={<span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>墙体</span>}
          value={floorPlan.walls.length}
          valueStyle={{ color: '#fff', fontSize: 18 }}
        />
        <Statistic
          title={<span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>门</span>}
          value={floorPlan.doors.length}
          valueStyle={{ color: '#deb887', fontSize: 18 }}
        />
        <Statistic
          title={<span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>窗户</span>}
          value={floorPlan.windows.length}
          valueStyle={{ color: '#87ceeb', fontSize: 18 }}
        />
        <Statistic
          title={<span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>房间</span>}
          value={floorPlan.rooms.length}
          valueStyle={{ color: '#98fb98', fontSize: 18 }}
        />
      </div>

      <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />

      <div style={{ padding: '8px 0', textAlign: 'center' }}>
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
          提示：按住空格拖拽平移视图<br />
          滚轮缩放视图
        </Text>
      </div>
    </div>
  )
}

export default PropertiesPanel
