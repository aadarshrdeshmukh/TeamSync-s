import { useState } from 'react'
import { useGetMyTeamsQuery, useAddMemberMutation, useRemoveMemberMutation } from '../../api/teamApi'
import { useGetAssignableUsersQuery } from '../../api/userApi'
import { useGetTasksByTeamQuery } from '../../api/taskApi'
import { Users, User, CheckCircle, BarChart3, Settings } from 'lucide-react'
import Card from '../../components/Card'
import Loader from '../../components/Loader'

const LeadTeams = () => {
  const { data: teams = [], isLoading, refetch } = useGetMyTeamsQuery()
  const { data: users = [] } = useGetAssignableUsersQuery()
  const [addMember] = useAddMemberMutation()
  const [removeMember] = useRemoveMemberMutation()
  
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [showManageModal, setShowManageModal] = useState(false)

  const handleAddMember = async (teamId, userId) => {
    try {
      await addMember({ teamId, userId, role: 'MEMBER' }).unwrap()
      refetch()
    } catch (error) {
      console.error('Failed to add member:', error)
    }
  }

  const handleRemoveMember = async (teamId, userId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await removeMember({ teamId, userId }).unwrap()
        refetch()
      } catch (error) {
        console.error('Failed to remove member:', error)
      }
    }
  }

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Teams</h1>
        <p className="text-gray-600">Manage your teams and team members</p>
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
              <p className="text-sm font-medium text-gray-600">My Teams</p>
              <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
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
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">Members</span>
                  <span className="font-semibold">{team.members?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">Status</span>
                  <span className={`px-3 py-1 text-xs rounded-full backdrop-blur-sm font-medium ${
                    team.status === 'active' 
                      ? 'bg-green-100/60 text-green-800' 
                      : 'bg-gray-100/60 text-gray-800'
                  }`}>
                    {team.status}
                  </span>
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Team Members</h4>
                <div className="space-y-1">
                  {team.members?.slice(0, 3).map((member) => (
                    <div key={member.userId._id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-medium">{member.userId.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs backdrop-blur-sm font-medium ${
                        member.role === 'LEAD' 
                          ? 'bg-blue-100/60 text-blue-700' 
                          : 'bg-gray-100/60 text-gray-600'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                  ))}
                  {team.members?.length > 3 && (
                    <div className="text-xs text-gray-400 font-medium">
                      +{team.members.length - 3} more members
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setSelectedTeam(team)
                    setShowManageModal(true)
                  }}
                  className="w-full glass-button py-2 px-3 text-sm"
                >
                  Manage Team
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {teams.length === 0 && (
        <Card>
          <div className="text-center py-8 text-gray-400">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No Teams Yet</p>
            <p className="text-sm">You haven't been assigned to lead any teams yet</p>
          </div>
        </Card>
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
                        <span className={`px-2 py-1 text-xs rounded-full backdrop-blur-sm font-medium ${
                          member.role === 'LEAD' 
                            ? 'bg-blue-100/60 text-blue-700' 
                            : 'bg-gray-100/60 text-gray-600'
                        }`}>
                          {member.role}
                        </span>
                        {member.role !== 'LEAD' && (
                          <button
                            onClick={() => handleRemoveMember(selectedTeam._id, member.userId._id)}
                            className="text-xs text-red-600 hover:text-red-800 font-medium"
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
                  {availableMembers.filter(user => !selectedTeam.members?.some(member => member.userId._id === user._id)).length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No available members to add
                    </div>
                  )}
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

export default LeadTeams