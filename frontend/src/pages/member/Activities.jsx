import { useState } from 'react'
import { useGetMyActivitiesQuery, useGetActivitiesByTeamQuery } from '../../api/activityApi'
import { useGetMyTeamsQuery } from '../../api/teamApi'
import { Activity, Calendar, FileText, CheckSquare, UserPlus, UserMinus, Users, TrendingUp } from 'lucide-react'
import Card from '../../components/Card'
import Loader from '../../components/Loader'

const MemberActivities = () => {
  const { data: activities = [], isLoading: activitiesLoading } = useGetMyActivitiesQuery()
  const { data: teams = [] } = useGetMyTeamsQuery()
  const [selectedTeam, setSelectedTeam] = useState('')
  const { data: teamActivities = [], isLoading: teamActivitiesLoading } = useGetActivitiesByTeamQuery(selectedTeam, {
    skip: !selectedTeam
  })

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'task_created':
      case 'task_updated':
      case 'task_completed':
        return <CheckSquare className="w-4 h-4" />
      case 'meeting_scheduled':
        return <Calendar className="w-4 h-4" />
      case 'file_uploaded':
        return <FileText className="w-4 h-4" />
      case 'member_added':
        return <UserPlus className="w-4 h-4" />
      case 'member_removed':
        return <UserMinus className="w-4 h-4" />
      case 'team_created':
        return <Users className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getActivityColor = (activityType) => {
    switch (activityType) {
      case 'task_completed':
        return 'text-green-600 bg-green-100/60'
      case 'task_created':
      case 'task_updated':
        return 'text-blue-600 bg-blue-100/60'
      case 'meeting_scheduled':
        return 'text-purple-600 bg-purple-100/60'
      case 'file_uploaded':
        return 'text-orange-600 bg-orange-100/60'
      case 'member_added':
        return 'text-emerald-600 bg-emerald-100/60'
      case 'member_removed':
        return 'text-red-600 bg-red-100/60'
      case 'team_created':
        return 'text-indigo-600 bg-indigo-100/60'
      default:
        return 'text-gray-600 bg-gray-100/60'
    }
  }

  const formatActivityType = (activityType) => {
    return activityType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const formatTimeAgo = (date) => {
    const now = new Date()
    const activityDate = new Date(date)
    const diffInMinutes = Math.floor((now - activityDate) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return activityDate.toLocaleDateString()
  }

  // Calculate activity statistics
  const validActivities = activities.filter(a => a && a.activityType)
  const activityStats = {
    total: validActivities.length,
    tasksCompleted: validActivities.filter(a => a.activityType === 'task_completed').length,
    tasksUpdated: validActivities.filter(a => a.activityType === 'task_updated').length,
    meetingsScheduled: validActivities.filter(a => a.activityType === 'meeting_scheduled').length,
    filesUploaded: validActivities.filter(a => a.activityType === 'file_uploaded').length
  }

  // Get activities to display (team activities if team selected, otherwise all activities)
  const displayActivities = selectedTeam ? teamActivities : activities
  const isLoadingActivities = selectedTeam ? teamActivitiesLoading : activitiesLoading

  if (activitiesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Activities</h1>
        <p className="text-gray-600">Track your contributions and team activities</p>
      </div>

      {/* Activity Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{activityStats.total}</p>
            </div>
          </div>
        </div>

        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-900">{activityStats.tasksCompleted}</p>
            </div>
          </div>
        </div>

        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tasks Updated</p>
              <p className="text-2xl font-bold text-gray-900">{activityStats.tasksUpdated}</p>
            </div>
          </div>
        </div>

        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Files Uploaded</p>
              <p className="text-2xl font-bold text-gray-900">{activityStats.filesUploaded}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activities Feed */}
        <div className="lg:col-span-2">
          <Card title={selectedTeam ? `${teams.find(t => t._id === selectedTeam)?.name || 'Team'} Activities` : "Recent Activities"}>
            <div className="mb-4">
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="glass-input w-full px-3 py-2"
              >
                <option value="">All team activities</option>
                {teams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.name} activities
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {isLoadingActivities ? (
                <div className="flex justify-center py-8">
                  <Loader size="md" />
                </div>
              ) : displayActivities.length > 0 ? (
                displayActivities.filter(activity => activity && activity._id).map((activity) => (
                  <div key={activity._id} className="flex items-start space-x-3 p-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${getActivityColor(activity.activityType)}`}>
                      {getActivityIcon(activity.activityType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {formatActivityType(activity.activityType)}
                        </p>
                        <span className="text-xs text-gray-500 font-medium">
                          {formatTimeAgo(activity.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="font-medium">{activity.userId?.name || 'Unknown User'}</span>
                        <span>•</span>
                        <span>{activity.teamId?.name || 'Unknown Team'}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No Activities Yet</p>
                  <p className="text-sm">
                    {selectedTeam 
                      ? "No activities found for this team" 
                      : "Start working on tasks to see your activities here"
                    }
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* My Teams and Quick Stats */}
        <div className="space-y-6">
          <Card title="My Teams">
            <div className="space-y-3">
              {teams.length > 0 ? (
                teams.map((team) => (
                  <div key={team._id} className="p-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{team.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{team.members?.length || 0} members</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 text-xs rounded-full backdrop-blur-sm font-medium ${
                          team.status === 'active' 
                            ? 'bg-green-100/60 text-green-800' 
                            : 'bg-gray-100/60 text-gray-800'
                        }`}>
                          {team.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {team.members?.find(m => m.role === 'LEAD')?.userId?.name || 'No lead'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No teams assigned</p>
                </div>
              )}
            </div>
          </Card>

          <Card title="Activity Summary">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100/60 text-green-600 rounded-lg flex items-center justify-center">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Completed Tasks</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{activityStats.tasksCompleted}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100/60 text-blue-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Task Updates</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{activityStats.tasksUpdated}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100/60 text-purple-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Meetings</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{activityStats.meetingsScheduled}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100/60 text-orange-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Files Uploaded</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{activityStats.filesUploaded}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default MemberActivities