import { Layout } from 'antd'

const { Content } = Layout

const EditorPage = () => {
  return (
    <Layout style={{ height: '100vh' }}>
      <Content style={{ background: '#1a1a2e', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff',
            fontSize: 24,
          }}
        >
          户型编辑器 - 开发中
        </div>
      </Content>
    </Layout>
  )
}

export default EditorPage
