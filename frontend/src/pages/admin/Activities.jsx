import { useState } from 'react'
import { useGetAllActivitiesQuery, useGetTeamReportQuery } from '../../api/activityApi'
import { useGetAllTeamsQuery } from '../../api/teamApi'
import { Activity, TrendingUp, Users, Calendar, FileText, CheckSquare, UserPlus, UserMinus } from 'lucide-react'
import Card from '../../components/Card'
import Loader from '../../components/Loader'

const AdminActivities = () => {
  const { data: activities = [], isLoading: activitiesLoading } = useGetAllActivitiesQuery()
  const { data: teams = [] } = useGetAllTeamsQuery()
  const [selectedTeam, setSelectedTeam] = useState('')
  const { data: teamReport, isLoading: reportLoading } = useGetTeamReportQuery(selectedTeam, {
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
    tasksCreated: validActivities.filter(a => a.activityType === 'task_created').length,
    tasksCompleted: validActivities.filter(a => a.activityType === 'task_completed').length,
    meetingsScheduled: validActivities.filter(a => a.activityType === 'meeting_scheduled').length,
    filesUploaded: validActivities.filter(a => a.activityType === 'file_uploaded').length,
    membersAdded: validActivities.filter(a => a.activityType === 'member_added').length,
    teamsCreated: validActivities.filter(a => a.activityType === 'team_created').length
  }

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
        <h1 className="text-2xl font-bold text-gray-900">System Activities</h1>
        <p className="text-gray-600">Monitor all activities across the platform</p>
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
                <Calendar className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Meetings Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{activityStats.meetingsScheduled}</p>
            </div>
          </div>
        </div>

        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Teams Created</p>
              <p className="text-2xl font-bold text-gray-900">{activityStats.teamsCreated}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card title="Recent Activities">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activities.length > 0 ? (
                activities.filter(activity => activity && activity._id).map((activity) => (
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
                  <p className="text-sm">Activities will appear here as users interact with the system</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Team Report */}
        <div className="space-y-6">
          <Card title="Team Report">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Team
                </label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="glass-input w-full px-3 py-2"
                >
                  <option value="">Choose a team</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTeam && (
                <div>
                  {reportLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader size="sm" />
                    </div>
                  ) : teamReport ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl">
                        <h4 className="font-medium text-gray-900 mb-3">Activity Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tasks Created:</span>
                            <span className="font-medium">{teamReport.activityStats.tasksCreated}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tasks Completed:</span>
                            <span className="font-medium">{teamReport.activityStats.tasksCompleted}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Meetings:</span>
                            <span className="font-medium">{teamReport.activityStats.meetingsScheduled}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Files Uploaded:</span>
                            <span className="font-medium">{teamReport.activityStats.filesUploaded}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl">
                        <h4 className="font-medium text-gray-900 mb-3">Member Activity</h4>
                        <div className="space-y-2">
                          {teamReport.memberStats?.map((member) => (
                            <div key={member.member?._id || Math.random()} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gray-900 rounded-lg flex items-center justify-center">
                                  <span className="text-white text-xs font-semibold">
                                    {member.member?.name?.charAt(0)?.toUpperCase() || '?'}
                                  </span>
                                </div>
                                <span className="font-medium">{member.member?.name || 'Unknown User'}</span>
                                <span className={`px-2 py-0.5 text-xs rounded-full backdrop-blur-sm font-medium ${
                                  member.role === 'LEAD' 
                                    ? 'bg-blue-100/60 text-blue-700' 
                                    : 'bg-gray-100/60 text-gray-600'
                                }`}>
                                  {member.role || 'MEMBER'}
                                </span>
                              </div>
                              <span className="font-medium">{member.activityCount || 0}</span>
                            </div>
                          )) || []}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No report data available
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AdminActivities