import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Typography, Button, Space, Upload, message, Modal, Steps, Divider } from 'antd'
import { UploadOutlined, PlusOutlined, AppstoreOutlined, HomeOutlined, ThunderboltOutlined, CompassOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { createDefaultFloorPlan, createEmptyFloorPlan } from '@/utils/defaultPlan'
import { TraceCanvas } from '@/components/Import/TraceCanvas'
import { useAppStore } from '@/store'
import type { Wall, Window, Door } from '@/types'

const { Title, Paragraph, Text } = Typography

const templates = [
  { id: '1b1', name: '一室一厅', desc: '约50-70㎡，适合单身/情侣', image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: '2b1', name: '两室一厅', desc: '约70-90㎡，适合小家庭', image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: '2b2', name: '两室两厅', desc: '约90-110㎡，主流户型', image: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: '3b2', name: '三室两厅', desc: '约110-140㎡，改善户型', image: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
]

const Home = () => {
  const navigate = useNavigate()
  const { setFloorPlan } = useAppStore()
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [importStep, setImportStep] = useState(0)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  const handleNewPlan = () => {
    const plan = createDefaultFloorPlan()
    setFloorPlan(plan)
    navigate('/editor')
  }

  const handleUseTemplate = (templateId: string) => {
    const plan = createDefaultFloorPlan(templateId)
    setFloorPlan(plan)
    navigate('/editor')
  }

  const handleUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string)
      setImportStep(1)
      message.success('图片上传成功，请设置比例尺')
    }
    reader.readAsDataURL(file)
    return false
  }

  const handleTraceComplete = (walls: Wall[], _windows: Window[], _doors: Door[]) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    walls.forEach((w) => {
      minX = Math.min(minX, w.start.x, w.end.x)
      minY = Math.min(minY, w.start.y, w.end.y)
      maxX = Math.max(maxX, w.start.x, w.end.x)
      maxY = Math.max(maxY, w.start.y, w.end.y)
    })
    const padding = 100
    const plan = createEmptyFloorPlan()
    plan.walls = walls.map((w) => ({
      ...w,
      start: { x: w.start.x - minX + padding, y: w.start.y - minY + padding },
      end: { x: w.end.x - minX + padding, y: w.end.y - minY + padding },
    }))
    plan.center = { x: (maxX - minX) / 2 + padding, y: (maxY - minY) / 2 + padding }
    setFloorPlan(plan)
    message.success(`户型描边完成，共 ${walls.length} 面墙`)
    setImportModalVisible(false)
    setImportStep(2)
    navigate('/editor')
  }

  const features = [
    { icon: <CompassOutlined />, title: '玄空飞星排盘', desc: '基于三元九运，自动计算山星向星旺衰' },
    { icon: <ThunderboltOutlined />, title: '能量场可视化', desc: '风水能量、风场流线、采光阴影实时渲染' },
    { icon: <HomeOutlined />, title: '户型自由编辑', desc: '拖拽绘制墙体，自动识别门窗位置' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <Title level={1} style={{ color: '#d4af37', fontSize: 48, marginBottom: 12, textShadow: '0 0 20px rgba(212,175,55,0.3)' }}>
            🏠 户型风水分析
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
            基于玄空飞星理论，结合物理模拟（风场/采光/能量），为您的房屋提供专业风水分析
          </Paragraph>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 48 }}>
          {features.map((f, i) => (
            <Card
              key={i}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(212,175,55,0.2)',
                borderRadius: 12,
                textAlign: 'center',
              }}
              styles={{ body: { padding: 24 } }}
            >
              <div style={{ fontSize: 36, color: '#d4af37', marginBottom: 12 }}>{f.icon}</div>
              <Title level={4} style={{ color: '#e8e8e8', margin: '0 0 8px' }}>{f.title}</Title>
              <Text style={{ color: 'rgba(255,255,255,0.5)' }}>{f.desc}</Text>
            </Card>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 40 }}>
          <Card
            hoverable
            style={{
              background: 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.15) 100%)',
              border: '1px solid rgba(102,126,234,0.3)',
              borderRadius: 12,
              cursor: 'pointer',
            }}
            onClick={handleNewPlan}
            styles={{ body: { padding: 32, textAlign: 'center' } }}
          >
            <PlusOutlined style={{ fontSize: 48, color: '#667eea', marginBottom: 16 }} />
            <Title level={3} style={{ color: '#e8e8e8', margin: '0 0 8px' }}>新建空白户型</Title>
            <Text style={{ color: 'rgba(255,255,255,0.5)' }}>从零开始绘制您的户型图</Text>
          </Card>

          <Card
            hoverable
            style={{
              background: 'linear-gradient(135deg, rgba(79,172,254,0.15) 0%, rgba(0,242,254,0.15) 100%)',
              border: '1px solid rgba(79,172,254,0.3)',
              borderRadius: 12,
              cursor: 'pointer',
            }}
            onClick={() => setImportModalVisible(true)}
            styles={{ body: { padding: 32, textAlign: 'center' } }}
          >
            <UploadOutlined style={{ fontSize: 48, color: '#4facfe', marginBottom: 16 }} />
            <Title level={3} style={{ color: '#e8e8e8', margin: '0 0 8px' }}>导入户型图</Title>
            <Text style={{ color: 'rgba(255,255,255,0.5)' }}>上传图片，半自动描边生成户型</Text>
          </Card>

          <Card
            style={{
              background: 'linear-gradient(135deg, rgba(67,233,123,0.15) 0%, rgba(56,249,215,0.15) 100%)',
              border: '1px solid rgba(67,233,123,0.3)',
              borderRadius: 12,
            }}
            styles={{ body: { padding: 32, textAlign: 'center' } }}
          >
            <AppstoreOutlined style={{ fontSize: 48, color: '#43e97b', marginBottom: 16 }} />
            <Title level={3} style={{ color: '#e8e8e8', margin: '0 0 8px' }}>选择模板</Title>
            <Text style={{ color: 'rgba(255,255,255,0.5)' }}>从预设户型模板快速开始</Text>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {templates.map((tpl) => (
            <Card
              key={tpl.id}
              hoverable
              onClick={() => handleUseTemplate(tpl.id)}
              style={{ borderRadius: 8, cursor: 'pointer', overflow: 'hidden' }}
              styles={{ body: { padding: 0 } }}
            >
              <div style={{ height: 100, background: tpl.image, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HomeOutlined style={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 600, color: '#1a1a2e', marginBottom: 4 }}>{tpl.name}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>{tpl.desc}</Text>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal
        title={<span style={{ color: '#d4af37' }}>导入户型图</span>}
        open={importModalVisible}
        onCancel={() => { setImportModalVisible(false); setImportStep(0); setUploadedImage(null) }}
        footer={null}
        width={700}
        styles={{ content: { background: '#1a1a2e', border: '1px solid rgba(212,175,55,0.3)' }, header: { borderBottom: '1px solid rgba(212,175,55,0.2)' } }}
      >
        <Steps
          current={importStep}
          items={[{ title: '上传图片' }, { title: '设置比例' }, { title: '描边墙体' }]}
          style={{ marginBottom: 24 }}
        />
        <Divider style={{ borderColor: 'rgba(212,175,55,0.2)' }} />
        {importStep === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Upload.Dragger
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleUpload}
              style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(212,175,55,0.4)', borderRadius: 8 }}
            >
              <p style={{ fontSize: 48, color: '#d4af37', marginBottom: 16 }}>
                <UploadOutlined />
              </p>
              <p style={{ color: '#e8e8e8', fontSize: 16 }}>点击或拖拽户型图片到此区域上传</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>支持 JPG / PNG / BMP 格式</p>
            </Upload.Dragger>
          </div>
        )}
        {importStep >= 1 && uploadedImage && (
          <div style={{ maxHeight: 600, overflowY: 'auto' }}>
            {importStep === 2 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
                <Title level={4} style={{ color: '#e8e8e8' }}>导入成功！正在跳转到编辑器...</Title>
              </div>
            ) : (
              <TraceCanvas imageUrl={uploadedImage} onComplete={handleTraceComplete} />
            )}
            {importStep === 1 && (
              <Space style={{ marginTop: 12 }}>
                <Button onClick={() => { setImportStep(0); setUploadedImage(null) }}>重新上传</Button>
              </Space>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Home
