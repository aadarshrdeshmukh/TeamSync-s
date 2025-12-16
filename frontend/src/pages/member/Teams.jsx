import { useGetMyTeamsQuery } from '../../api/teamApi'
import { Users } from 'lucide-react'
import Card from '../../components/Card'
import Loader from '../../components/Loader'

const MemberTeams = () => {
  const { data: teams = [], isLoading } = useGetMyTeamsQuery()

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
        <h1 className="text-2xl font-display font-bold text-gray-900">My Teams</h1>
        <p className="text-gray-600">View the teams you're part of</p>
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
                  <span className="text-sm text-gray-500">Team Lead</span>
                  <span className="text-sm font-medium">{team.createdBy?.name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Members</span>
                  <span className="font-semibold">{team.members?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    team.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {team.status}
                  </span>
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">My Role</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Team Member</span>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    MEMBER
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {teams.length === 0 && (
        <Card>
          <div className="text-center py-8 text-gray-400">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100/60 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium">No Teams Yet</p>
            <p className="text-sm">You haven't been added to any teams yet</p>
          </div>
        </Card>
      )}
    </div>
  )
}

export default MemberTeams