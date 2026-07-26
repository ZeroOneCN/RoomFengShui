import { Button, Space, Tooltip, Divider } from 'antd'
import {
  HomeOutlined,
  SelectOutlined,
  BorderOutlined,
  ColumnWidthOutlined,
  WindowsOutlined,
  DeleteOutlined,
  UndoOutlined,
  RedoOutlined,
  PlayCircleOutlined,
  CloudUploadOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useAppStore } from '@/store'
import { useNavigate } from 'react-router-dom'
import type { ToolType } from '@/types'

const tools: { type: ToolType; icon: React.ReactNode; label: string }[] = [
  { type: 'select', icon: <SelectOutlined />, label: '选择' },
  { type: 'wall', icon: <BorderOutlined />, label: '绘制墙体' },
  { type: 'door', icon: <ColumnWidthOutlined />, label: '添加门' },
  { type: 'window', icon: <WindowsOutlined />, label: '添加窗户' },
  { type: 'erase', icon: <DeleteOutlined />, label: '删除' },
]

interface ToolbarProps {
  onUndo: () => void
  onRedo: () => void
  onReset: () => void
  canUndo: boolean
  canRedo: boolean
}

const Toolbar = ({ onUndo, onRedo, onReset, canUndo, canRedo }: ToolbarProps) => {
  const { currentTool, setCurrentTool } = useAppStore()
  const navigate = useNavigate()

  return (
    <div
      style={{
        position: 'absolute',
        left: 20,
        top: 20,
        background: 'rgba(20, 20, 40, 0.9)',
        borderRadius: 8,
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        border: '1px solid rgba(212, 175, 55, 0.3)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
      }}
    >
      <Space direction="vertical" size={4}>
        <Tooltip title="返回首页" placement="right">
          <Button
            type="text"
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
            style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </Tooltip>

        <Divider style={{ margin: '8px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

        {tools.map((tool) => (
          <Tooltip key={tool.type} title={tool.label} placement="right">
            <Button
              type={currentTool === tool.type ? 'primary' : 'text'}
              icon={tool.icon}
              onClick={() => setCurrentTool(tool.type)}
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          </Tooltip>
        ))}

        <Divider style={{ margin: '8px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

        <Tooltip title="撤销 (Ctrl+Z)" placement="right">
          <Button
            type="text"
            icon={<UndoOutlined />}
            onClick={onUndo}
            disabled={!canUndo}
            style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </Tooltip>

        <Tooltip title="重做 (Ctrl+Y)" placement="right">
          <Button
            type="text"
            icon={<RedoOutlined />}
            onClick={onRedo}
            disabled={!canRedo}
            style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </Tooltip>

        <Tooltip title="重置" placement="right">
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={onReset}
            style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </Tooltip>

        <Divider style={{ margin: '8px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

        <Tooltip title="导入户型图" placement="right">
          <Button
            type="text"
            icon={<CloudUploadOutlined />}
            onClick={() => navigate('/convert')}
            style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </Tooltip>

        <Tooltip title="演示模式" placement="right">
          <Button
            type="text"
            icon={<PlayCircleOutlined />}
            onClick={() => navigate('/demo')}
            style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </Tooltip>
      </Space>
    </div>
  )
}

export default Toolbar
