import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Devices from './pages/Devices'
import Geography from './pages/Geography'
import Exports from './pages/Exports'
import Methodology from './pages/Methodology'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/geography" element={<Geography />} />
          <Route path="/exports" element={<Exports />} />
          <Route path="/methodology" element={<Methodology />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
