import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectCurrentToken } from './features/auth/authSlice'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import MeetingRoom from './pages/MeetingRoom'

// Layouts
import AdminLayout from './layouts/AdminLayout'
import LeadLayout from './layouts/LeadLayout'
import MemberLayout from './layouts/MemberLayout'

// Dashboard Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminTeams from './pages/admin/Teams'
import AdminTasks from './pages/admin/Tasks'
import AdminMeetings from './pages/admin/Meetings'
import AdminActivities from './pages/admin/Activities'
import AdminFiles from './pages/admin/Files'

import LeadDashboard from './pages/lead/Dashboard'
import LeadTeams from './pages/lead/Teams'
import LeadTasks from './pages/lead/Tasks'
import LeadMeetings from './pages/lead/Meetings'
import LeadActivities from './pages/lead/Activities'
import LeadFiles from './pages/lead/Files'

import MemberDashboard from './pages/member/Dashboard'
import MemberTasks from './pages/member/Tasks'
import MemberTeams from './pages/member/Teams'
import MemberMeetings from './pages/member/Meetings'
import MemberActivities from './pages/member/Activities'
import MemberFiles from './pages/member/Files'

// Components
import ProtectedRoute from './routes/ProtectedRoute'

// Utility function to get user role safely
const getRoleFromToken = (token) => {
  if (!token) return null
  
  try {
    // Simple base64 decode of JWT payload
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.role
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const token = useSelector(selectCurrentToken)
  const userRole = getRoleFromToken(token)

  // Redirect authenticated users to their dashboard
  const getDefaultRedirect = () => {
    if (!isAuthenticated) return '/login'
    
    switch (userRole) {
      case 'ADMIN':
        return '/admin'
      case 'LEAD':
        return '/lead'
      case 'MEMBER':
        return '/member'
      default:
        return '/login'
    }
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={isAuthenticated ? <Navigate to={getDefaultRedirect()} replace /> : <Landing />} />
      <Route path="/login" element={<Login />} />
      
      {/* Meeting Room - Accessible to all authenticated users */}
      <Route 
        path="/meeting/:meetingId" 
        element={
          <ProtectedRoute>
            <MeetingRoom />
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="teams" element={<AdminTeams />} />
        <Route path="tasks" element={<AdminTasks />} />
        <Route path="meetings" element={<AdminMeetings />} />
        <Route path="activities" element={<AdminActivities />} />
        <Route path="files" element={<AdminFiles />} />
      </Route>

      {/* Lead Routes */}
      <Route
        path="/lead/*"
        element={
          <ProtectedRoute requiredRole="LEAD">
            <LeadLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<LeadDashboard />} />
        <Route path="teams" element={<LeadTeams />} />
        <Route path="tasks" element={<LeadTasks />} />
        <Route path="meetings" element={<LeadMeetings />} />
        <Route path="activities" element={<LeadActivities />} />
        <Route path="files" element={<LeadFiles />} />
      </Route>

      {/* Member Routes */}
      <Route
        path="/member/*"
        element={
          <ProtectedRoute requiredRole="MEMBER">
            <MemberLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MemberDashboard />} />
        <Route path="tasks" element={<MemberTasks />} />
        <Route path="teams" element={<MemberTeams />} />
        <Route path="meetings" element={<MemberMeetings />} />
        <Route path="activities" element={<MemberActivities />} />
        <Route path="files" element={<MemberFiles />} />
      </Route>

      {/* Catch all - redirect to appropriate dashboard or login */}
      <Route path="*" element={<Navigate to={getDefaultRedirect()} replace />} />
    </Routes>
  )
}

export default App