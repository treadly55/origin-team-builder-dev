import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/auth/AuthProvider.jsx'
import { RequireAuth, RedirectIfAuthed } from './components/auth/ProtectedRoute.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import LineupPage from './pages/LineupPage.jsx'
import LineupPreviewPage from './pages/LineupPreviewPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <main className="app">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/login"
                element={
                  <RedirectIfAuthed>
                    <LoginPage />
                  </RedirectIfAuthed>
                }
              />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <DashboardPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/lineup/preview"
                element={
                  <RequireAuth>
                    <LineupPreviewPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/lineup/:id"
                element={
                  <RequireAuth>
                    <LineupPage />
                  </RequireAuth>
                }
              />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </main>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  )
}
