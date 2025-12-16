import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { logout, setCredentials } from '../features/auth/authSlice'
import { useGetProfileQuery } from '../api/authApi'
import { Zap, RefreshCw } from 'lucide-react'

// Safe token decoding function
const getUserFromToken = (token) => {
  if (!token) return null
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    }
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const token = useSelector(state => state.auth.token)
  const user = getUserFromToken(token)
  
  // Fetch current profile to check for role updates (only when needed)
  const { data: profile, refetch: refetchProfile, isFetching } = useGetProfileQuery(undefined, {
    skip: !token,
    // Only refetch when component mounts or when explicitly triggered
  })

  // Check for role changes when profile data is received
  useEffect(() => {
    if (profile && user && profile.role !== user.role) {
      // Role has changed, force logout and redirect to login
      dispatch(logout())
      navigate('/login', { 
        state: { 
          message: `Your role has been updated to ${profile.role}. Please log in again to continue.` 
        }
      })
    }
  }, [profile, user, dispatch, navigate])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleRefreshProfile = () => {
    refetchProfile()
  }

  return (
    <nav className="glass-navbar px-8 py-5">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-900 tracking-tight">TeamSync</h1>
          </div>
          
          {user && (
            <span className="text-sm text-gray-600 font-medium">
              Welcome back, {user.email.split('@')[0]}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-6">
          {user && (
            <div className="flex items-center space-x-4">
              <div className="glass-panel px-3 py-1.5">
                <span className="text-sm font-medium text-gray-700">
                  {profile?.role || user.role}
                </span>
              </div>
              <button
                onClick={handleRefreshProfile}
                disabled={isFetching}
                className="glass-button p-2 text-sm"
                title="Refresh profile"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-semibold">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="glass-button px-4 py-2 text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar