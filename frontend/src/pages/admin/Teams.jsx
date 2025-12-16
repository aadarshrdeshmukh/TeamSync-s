import { useState } from 'react'
import { useGetAllTeamsQuery, useCreateTeamMutation, useUpdateTeamMutation, useDeleteTeamMutation, useAddMemberMutation, useRemoveMemberMutation } from '../../api/teamApi'
import { useGetAllUsersQuery } from '../../api/userApi'
import { Users, CheckCircle, User, BarChart3, Plus, Settings, Trash2 } from 'lucide-react'
import Card from '../../components/Card'
import Loader from '../../components/Loader'

const AdminTeams = () => {
  const { data: teams = [], isLoading, refetch } = useGetAllTeamsQuery()
  const { data: users = [] } = useGetAllUsersQuery()
  const [createTeam] = useCreateTeamMutation()
  const [updateTeam] = useUpdateTeamMutation()
  const [deleteTeam] = useDeleteTeamMutation()
  const [addMember] = useAddMemberMutation()
  const [removeMember] = useRemoveMemberMutation()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showManageModal, setShowManageModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leadId: ''
  })

  const handleCreateTeam = async (e) => {
    e.preventDefault()
    try {
      await createTeam({
        name: formData.name,
        description: formData.description,
        leadId: formData.leadId
      }).unwrap()
      setShowCreateModal(false)
      setFormData({ name: '', description: '', leadId: '' })
      refetch()
    } catch (error) {
      console.error('Failed to create team:', error)
    }
  }

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await deleteTeam(teamId).unwrap()
        refetch()
      } catch (error) {
        console.error('Failed to delete team:', error)
      }
    }
  }

  const handleAddMember = async (teamId, userId) => {
    try {
      await addMember({ teamId, userId, role: 'MEMBER' }).unwrap()
      refetch()
    } catch (error) {
      console.error('Failed to add member:', error)
    }
  }

  const handleRemoveMember = async (teamId, userId) => {
    try {
      await removeMember({ teamId, userId }).unwrap()
      refetch()
    } catch (error) {
      console.error('Failed to remove member:', error)
    }
  }

  const availableLeads = users.filter(user => user.role === 'LEAD')
  const availableMembers = users.filter(user => user.role === 'MEMBER')

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
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Create and manage all teams across the system</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="glass-button-primary px-6 py-3"
        >
          Create Team
        </button>
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Teams</p>
              <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
            </div>
          </div>
        </div>

        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Teams</p>
              <p className="text-2xl font-bold text-gray-900">
                {teams.filter(t => t.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {teams.reduce((acc, team) => acc + (team.members?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Team Size</p>
              <p className="text-2xl font-bold text-gray-900">
                {teams.length > 0 ? Math.round(teams.reduce((acc, team) => acc + (team.members?.length || 0), 0) / teams.length) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card key={team._id}>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{team.description}</p>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 font-medium">
                    {team.members?.length || 0} members
                  </span>
                  <span className={`px-3 py-1 text-xs rounded-full backdrop-blur-sm font-medium ${
                    team.status === 'active' 
                      ? 'bg-green-100/60 text-green-800' 
                      : 'bg-gray-100/60 text-gray-800'
                  }`}>
                    {team.status}
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-500 font-medium">
                Lead: {team.createdBy?.name || 'Unassigned'}
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => {
                    setSelectedTeam(team)
                    setShowManageModal(true)
                  }}
                  className="flex-1 glass-button py-2 px-3 text-xs"
                >
                  Manage
                </button>
                <button
                  onClick={() => handleDeleteTeam(team._id)}
                  className="px-3 py-2 text-xs bg-red-100/60 hover:bg-red-200/60 text-red-700 rounded-lg transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {teams.length === 0 && (
        <Card>
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-lg font-medium">No Teams Yet</p>
            <p className="text-sm">Create your first team to get started</p>
          </div>
        </Card>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Team</h3>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="glass-input w-full px-3 py-2"
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="glass-input w-full px-3 py-2 h-20 resize-none"
                  placeholder="Enter team description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Lead (Optional)
                </label>
                <select
                  value={formData.leadId}
                  onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                  className="glass-input w-full px-3 py-2"
                >
                  <option value="">Select a team lead (or leave empty to assign later)</option>
                  {availableLeads.map((lead) => (
                    <option key={lead._id} value={lead._id}>
                      {lead.name} ({lead.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  If no lead is selected, you will be set as the temporary lead
                </p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({ name: '', description: '', leadId: '' })
                  }}
                  className="flex-1 glass-button py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 glass-button-primary py-2 px-4"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Team Modal */}
      {showManageModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Manage Team: {selectedTeam.name}
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Current Members</h4>
                <div className="space-y-2">
                  {selectedTeam.members?.map((member) => (
                    <div key={member.userId._id} className="flex items-center justify-between p-3 bg-white/40 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {member.userId.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{member.userId.name}</div>
                          <div className="text-xs text-gray-500">{member.userId.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          member.role === 'LEAD' 
                            ? 'bg-blue-100/60 text-blue-700' 
                            : 'bg-gray-100/60 text-gray-600'
                        }`}>
                          {member.role}
                        </span>
                        {member.role !== 'LEAD' && (
                          <button
                            onClick={() => handleRemoveMember(selectedTeam._id, member.userId._id)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Add Members</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableMembers
                    .filter(user => !selectedTeam.members?.some(member => member.userId._id === user._id))
                    .map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-3 bg-white/40 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddMember(selectedTeam._id, user._id)}
                        className="glass-button px-3 py-1 text-xs"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={() => {
                  setShowManageModal(false)
                  setSelectedTeam(null)
                }}
                className="glass-button py-2 px-6"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminTeams