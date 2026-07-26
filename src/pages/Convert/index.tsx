import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Result, Spin } from 'antd'

const ConvertPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/'), 1500)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a1a' }}>
      <Result
        icon={<Spin size="large" />}
        title="正在跳转到首页..."
        subTitle="户型图导入功能已整合至首页引导页"
        style={{ color: '#d4af37' }}
      />
    </div>
  )
}

export default ConvertPage
