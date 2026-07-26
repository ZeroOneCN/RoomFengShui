import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import EditorPage from '@/pages/Editor'
import DemoPage from '@/pages/Demo'
import ConvertPage from '@/pages/Convert'
import './App.css'

const darkTheme = {
  token: {
    colorPrimary: '#ffd700',
    colorBgBase: '#0f0f23',
    colorTextBase: '#ffffff',
    borderRadius: 6,
  },
}

function App() {
  return (
    <ConfigProvider locale={zhCN} theme={darkTheme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/editor" replace />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/convert" element={<ConvertPage />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
