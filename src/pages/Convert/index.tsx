import { Layout } from 'antd'

const { Content } = Layout

const ConvertPage = () => {
  return (
    <Layout style={{ height: '100vh' }}>
      <Content style={{ background: '#16213e', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#00d9ff',
            fontSize: 24,
          }}
        >
          户型图转换 - 开发中
        </div>
      </Content>
    </Layout>
  )
}

export default ConvertPage
