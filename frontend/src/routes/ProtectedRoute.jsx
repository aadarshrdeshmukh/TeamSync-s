import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { selectIsAuthenticated, selectCurrentToken, logout } from '../features/auth/authSlice'
import { useGetProfileQuery } from '../api/authApi'
import { useEffect } from 'react'

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

const isTokenExpired = (token) => {
  if (!token) return true
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch (error) {
    return true
  }
}

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const token = useSelector(selectCurrentToken)
  const location = useLocation()

  // Fetch current profile to verify role (only when accessing protected routes)
  const { data: profile } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated || !token,
  })

  // Check if user is authenticated
  if (!isAuthenticated || !token || isTokenExpired(token)) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const tokenRole = getRoleFromToken(token)

  // If we have profile data and it differs from token, force re-authentication
  useEffect(() => {
    if (profile && tokenRole && profile.role !== tokenRole) {
      dispatch(logout())
    }
  }, [profile, tokenRole, dispatch])

  // Check role if required
  if (requiredRole) {
    // Use profile role if available, otherwise fall back to token role
    const currentRole = profile?.role || tokenRole
    
    if (currentRole !== requiredRole) {
      // If profile shows different role, redirect to appropriate dashboard
      const redirectPath = currentRole === 'ADMIN' ? '/admin' : 
                          currentRole === 'LEAD' ? '/lead' : '/member'
      return <Navigate to={redirectPath} replace />
    }
  }

  return children
}

export default ProtectedRoute