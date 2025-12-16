import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  Users,
  User,
  CheckSquare,
  Activity,
  Calendar,
  UsersRound,
  FolderOpen,
  
} from 'lucide-react'
import { motion } from 'framer-motion'

const Sidebar = ({ role }) => {

  const getNavItems = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { name: 'Dashboard', path: '/admin', icon: BarChart3, description: 'System overview' },
          { name: 'Users', path: '/admin/users', icon: User, description: 'Manage users' },
          { name: 'Teams', path: '/admin/teams', icon: Users, description: 'Team management' },
          { name: 'Tasks', path: '/admin/tasks', icon: CheckSquare, description: 'All tasks' },
          { name: 'Meetings', path: '/admin/meetings', icon: Calendar, description: 'All meetings' },
          { name: 'Files', path: '/admin/files', icon: FolderOpen, description: 'File management' },
          { name: 'Activities', path: '/admin/activities', icon: Activity, description: 'System activity' },
        ]
      case 'LEAD':
        return [
          { name: 'Dashboard', path: '/lead', icon: BarChart3, description: 'Team overview' },
          { name: 'My Teams', path: '/lead/teams', icon: Users, description: 'Manage teams' },
          { name: 'Team Tasks', path: '/lead/tasks', icon: CheckSquare, description: 'Task management' },
          { name: 'Meetings', path: '/lead/meetings', icon: Calendar, description: 'Schedule meetings' },
          { name: 'Files', path: '/lead/files', icon: FolderOpen, description: 'Team files' },
          { name: 'Activities', path: '/lead/activities', icon: Activity, description: 'Team activity' },
        ]
      case 'MEMBER':
        return [
          { name: 'Dashboard', path: '/member', icon: BarChart3, description: 'My overview' },
          { name: 'My Tasks', path: '/member/tasks', icon: CheckSquare, description: 'Assigned tasks' },
          { name: 'My Teams', path: '/member/teams', icon: UsersRound, description: 'Team collaboration' },
          { name: 'Meetings', path: '/member/meetings', icon: Calendar, description: 'Upcoming meetings' },
          { name: 'Files', path: '/member/files', icon: FolderOpen, description: 'Shared files' },
          { name: 'Activities', path: '/member/activities', icon: Activity, description: 'My activity' },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  const getRoleInfo = () => {
    switch (role) {
      case 'ADMIN':
        return { title: 'System Admin', color: 'text-red-600', bgColor: 'bg-red-100/60' }
      case 'LEAD':
        return { title: 'Team Lead', color: 'text-blue-600', bgColor: 'bg-blue-100/60' }
      case 'MEMBER':
        return { title: 'Team Member', color: 'text-green-600', bgColor: 'bg-green-100/60' }
      default:
        return { title: 'User', color: 'text-gray-600', bgColor: 'bg-gray-100/60' }
    }
  }

  const roleInfo = getRoleInfo()

  return (
    <aside className="glass-sidebar min-h-screen" style={{ width: '320px', minWidth: '320px', maxWidth: '320px' }}>
      <div className="p-6">
        
        {/* Navigation Items */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center px-4 py-4 rounded-2xl text-sm font-medium transition-all duration-300 ${isActive
                  ? 'bg-white/70 text-gray-900 shadow-xl backdrop-blur-sm border border-white/50'
                  : 'text-gray-700 hover:bg-white/50 hover:text-gray-900 hover:shadow-lg hover:border hover:border-white/40'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-white/60 to-white/40 rounded-2xl border border-white/50 shadow-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  <div className="relative z-10 flex items-center w-full">
                    <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center ${isActive ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-800'
                      }`}>
                      <item.icon className="w-5 h-5" />
                    </div>

                    <div className="ml-4 flex-1">
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        <span className={`text-xs ${isActive ? 'text-gray-600' : 'text-gray-500 group-hover:text-gray-600'
                          }`}>
                          {item.description}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <div className="glass-card p-4">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900 mb-1">
                Welcome back!
              </div>
              <div className="text-xs text-gray-600">
                Manage your workspace efficiently
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar