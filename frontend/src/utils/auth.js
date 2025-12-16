import jwtDecode from 'jwt-decode'

export const getUserFromToken = (token) => {
  if (!token) return null
  
  try {
    const decoded = jwtDecode(token)
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }
  } catch (error) {
    console.error('Invalid token:', error)
    return null
  }
}

export const isTokenExpired = (token) => {
  if (!token) return true
  
  try {
    const decoded = jwtDecode(token)
    return decoded.exp * 1000 < Date.now()
  } catch (error) {
    return true
  }
}

export const getRoleFromToken = (token) => {
  const user = getUserFromToken(token)
  return user?.role || null
}

export const hasRole = (token, requiredRole) => {
  const userRole = getRoleFromToken(token)
  return userRole === requiredRole
}

export const hasAnyRole = (token, roles) => {
  const userRole = getRoleFromToken(token)
  return roles.includes(userRole)
}