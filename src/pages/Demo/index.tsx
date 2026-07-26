import { Layout } from 'antd'

const { Content } = Layout

const DemoPage = () => {
  return (
    <Layout style={{ height: '100vh' }}>
      <Content style={{ background: '#0f0f23', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#ffd700',
            fontSize: 24,
          }}
        >
          演示模式 - 开发中
        </div>
      </Content>
    </Layout>
  )
}

export default DemoPage
