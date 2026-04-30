import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LineupBuilder from './components/builder/LineupBuilder.jsx'
import HomePage from './pages/HomePage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import LineupPage from './pages/LineupPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

const PREVIEW_LINEUP = {
  id: null,
  team: 'NSW',
  name: '',
  slots: {},
  version: 0,
  createdAt: '',
  updatedAt: '',
}

export default function App() {
  return (
    <BrowserRouter>
      <main className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/lineup/preview"
            element={<LineupBuilder initialLineup={PREVIEW_LINEUP} />}
          />
          <Route path="/lineup/:id" element={<LineupPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
