import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Focus from './pages/Focus'
import AiChiefOfStaff from './pages/AiChiefOfStaff'
import HowItWorks from './pages/HowItWorks'
import SignIn from './pages/SignIn'
import CompleteProfile from './pages/CompleteProfile'
import LearningHub from './pages/LearningHub'
import LoadingSpinner from './components/ui/LoadingSpinner'
import { useStore } from './store/useStore'

function ProfileCheckGuard() {
  const { profile } = useStore()
  if (profile && profile.profession === null) {
    return <Navigate to="/complete-profile" replace />
  }
  return <Outlet />
}

export default function App() {
  const { user, profile, isRegistering } = useStore()

  if (!user || isRegistering) {
    return <SignIn />
  }

  // Show loading spinner while profile is loading
  if (user && !profile && !isRegistering) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-background">
        <LoadingSpinner className="h-8 w-8 text-[#06b6d4]" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route element={<ProfileCheckGuard />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="focus" element={<Focus />} />
            <Route path="ai" element={<AiChiefOfStaff />} />
            <Route path="learning-hub" element={<LearningHub />} />
            <Route path="how-it-works" element={<HowItWorks />} />
          </Route>
          <Route path="complete-profile" element={<CompleteProfile />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
