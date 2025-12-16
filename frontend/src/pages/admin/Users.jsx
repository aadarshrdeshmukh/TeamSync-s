import { useState } from 'react'
import { useGetAllUsersQuery, useUpdateUserRoleMutation, useDeactivateUserMutation, useActivateUserMutation, useCreateUserMutation } from '../../api/userApi'
import { Users, Crown, Target, Zap, Plus } from 'lucide-react'
import Card from '../../components/Card'
import Loader from '../../components/Loader'

const AdminUsers = () => {
  const { data: users = [], isLoading, refetch } = useGetAllUsersQuery()
  const [updateUserRole] = useUpdateUserRoleMutation()
  const [deactivateUser] = useDeactivateUserMutation()
  const [activateUser] = useActivateUserMutation()
  const [createUser] = useCreateUserMutation()
  const [selectedUser, setSelectedUser] = useState(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'MEMBER'
  })

  const handleRoleChange = async (userId, newRole) => {
    try {
      const result = await updateUserRole({ id: userId, role: newRole }).unwrap()
      setShowRoleModal(false)
      setSelectedUser(null)
      refetch()
      
      // Show success message with re-auth requirement
      if (result.requiresReauth) {
        alert(`Role updated successfully! The user will need to log in again to access their new ${newRole} role.`)
      }
    } catch (error) {
      console.error('Failed to update user role:', error)
      alert('Failed to update user role. Please try again.')
    }
  }

  const handleUserStatusToggle = async (userId, isActive) => {
    try {
      if (isActive) {
        await deactivateUser(userId).unwrap()
      } else {
        await activateUser(userId).unwrap()
      }
      refetch()
    } catch (error) {
      console.error('Failed to update user status:', error)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      await createUser(formData).unwrap()
      setShowCreateModal(false)
      setFormData({
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'MEMBER'
      })
      refetch()
    } catch (error) {
      console.error('Failed to create user:', error)
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100/60 text-red-800'
      case 'LEAD':
        return 'bg-blue-100/60 text-blue-800'
      case 'MEMBER':
        return 'bg-green-100/60 text-green-800'
      default:
        return 'bg-gray-100/60 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage user roles and permissions across the system</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="glass-button-primary px-6 py-3 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New User</span>
        </button>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Crown className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'ADMIN').length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Team Leads</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'LEAD').length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <Card title="All Users">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/60">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/60">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-white/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
                      user.status === 'active' 
                        ? 'bg-green-100/60 text-green-800' 
                        : 'bg-red-100/60 text-red-800'
                    }`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user)
                        setShowRoleModal(true)
                      }}
                      className="glass-button px-3 py-1 text-xs"
                    >
                      Change Role
                    </button>
                    <button
                      onClick={() => handleUserStatusToggle(user._id, user.status === 'active')}
                      className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-300 ${
                        user.status === 'active'
                          ? 'bg-red-100/60 hover:bg-red-200/60 text-red-700'
                          : 'bg-green-100/60 hover:bg-green-200/60 text-green-700'
                      }`}
                    >
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
              Change Role for {selectedUser.name}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Current role: <span className="font-medium">{selectedUser.role}</span>
            </p>
            <div className="space-y-3">
              {['ADMIN', 'LEAD', 'MEMBER'].map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(selectedUser._id, role)}
                  disabled={selectedUser.role === role}
                  className={`w-full p-3 text-left rounded-xl transition-all duration-300 ${
                    selectedUser.role === role
                      ? 'bg-gray-100/60 text-gray-400 cursor-not-allowed'
                      : 'glass-button hover:bg-white/60'
                  }`}
                >
                  <div className="font-medium">{role}</div>
                  <div className="text-xs text-gray-500">
                    {role === 'ADMIN' && 'Full system access and user management'}
                    {role === 'LEAD' && 'Team management and task assignment'}
                    {role === 'MEMBER' && 'Task execution and collaboration'}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRoleModal(false)
                  setSelectedUser(null)
                }}
                className="flex-1 glass-button py-2 px-4"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">Create New User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="glass-input w-full px-3 py-2"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="glass-input w-full px-3 py-2"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="glass-input w-full px-3 py-2"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="glass-input w-full px-3 py-2"
                  placeholder="Enter password"
                  minLength="6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="glass-input w-full px-3 py-2"
                >
                  <option value="MEMBER">Member</option>
                  <option value="LEAD">Team Lead</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.role === 'ADMIN' && 'Full system access and user management'}
                  {formData.role === 'LEAD' && 'Team management and task assignment'}
                  {formData.role === 'MEMBER' && 'Task execution and collaboration'}
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({
                      name: '',
                      email: '',
                      username: '',
                      password: '',
                      role: 'MEMBER'
                    })
                  }}
                  className="flex-1 glass-button py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 glass-button-primary py-2 px-4"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers