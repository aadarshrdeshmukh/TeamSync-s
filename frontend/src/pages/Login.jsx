import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useLoginMutation } from '../api/authApi'
import { setCredentials, selectIsAuthenticated } from '../features/auth/authSlice'
import Loader from '../components/Loader'

// Safe token decoding function
const getRoleFromToken = (token) => {
  if (!token) return null
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.role
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [login, { isLoading, error }] = useLoginMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const from = location.state?.from?.pathname || '/'
  const roleUpdateMessage = location.state?.message

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect authenticated users to their dashboard
      const token = localStorage.getItem('token')
      const role = getRoleFromToken(token)
      const dashboardPath = role === 'ADMIN' ? '/admin' : 
                           role === 'LEAD' ? '/lead' : '/member'
      navigate(dashboardPath, { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const result = await login({ email, password }).unwrap()
      
      dispatch(setCredentials({
        user: result.user,
        token: result.token,
      }))

      // Redirect based on user role
      const role = result.user.role
      const dashboardPath = role === 'ADMIN' ? '/admin' : 
                           role === 'LEAD' ? '/lead' : '/member'
      
      navigate(from === '/' ? dashboardPath : from, { replace: true })
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">T</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Sign in to TeamSync
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Welcome back! Please sign in to your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card py-8 px-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full px-4 py-3"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full px-4 py-3"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {roleUpdateMessage && (
              <div className="bg-blue-100/60 backdrop-blur-sm border border-blue-200/60 text-blue-700 px-4 py-3 rounded-xl">
                <p className="text-sm">{roleUpdateMessage}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-100/60 backdrop-blur-sm border border-red-200/60 text-red-700 px-4 py-3 rounded-xl">
                <p className="text-sm">
                  {error.data?.message || 'Login failed. Please check your credentials.'}
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="glass-button-primary w-full py-3 px-4 flex justify-center items-center"
              >
                {isLoading ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <Link
                to="/"
                className="text-sm text-gray-700 hover:text-gray-900 font-medium"
              >
                ← Back to home
              </Link>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Admin:</strong> admin@example.com / password</p>
              <p><strong>Lead:</strong> lead@example.com / password</p>
              <p><strong>Member:</strong> member@example.com / password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login