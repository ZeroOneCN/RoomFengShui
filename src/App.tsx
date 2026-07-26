import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/Home'
import EditorPage from '@/pages/Editor'
import DemoPage from '@/pages/Demo'
import ConvertPage from '@/pages/Convert'
import './App.css'

const darkTheme = {
  token: {
    colorPrimary: '#d4af37',
    colorBgBase: '#0f0f23',
    colorTextBase: '#e8e8e8',
    borderRadius: 6,
    colorBgContainer: '#1a1a2e',
    colorBorder: 'rgba(212,175,55,0.2)',
  },
  components: {
    Card: {
      colorBgContainer: 'rgba(255,255,255,0.03)',
      colorBorderSecondary: 'rgba(212,175,55,0.15)',
    },
    Slider: {
      colorPrimary: '#d4af37',
    },
    Switch: {
      colorPrimary: '#d4af37',
    },
  },
}

function App() {
  return (
    <ConfigProvider locale={zhCN} theme={darkTheme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/convert" element={<ConvertPage />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
