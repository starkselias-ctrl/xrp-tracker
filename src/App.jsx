import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Quests from './pages/Quests'
import Thesis from './pages/Thesis'
import Timeline from './pages/Timeline'
import Alerts from './pages/Alerts'
import MetricDrilldown from './pages/MetricDrilldown'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="metric/:id" element={<MetricDrilldown />} />
          <Route path="quests" element={<Quests />} />
          <Route path="thesis" element={<Thesis />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="alerts" element={<Alerts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
