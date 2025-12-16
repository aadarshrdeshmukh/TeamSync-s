import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetAllMeetingsQuery, useDeleteMeetingMutation } from '../../api/meetingApi'
import { useGetAllTeamsQuery } from '../../api/teamApi'
import { Calendar, Clock, CheckCircle, Timer, CalendarDays, MapPin, Trash2, Video, Users, BarChart3 } from 'lucide-react'
import Card from '../../components/Card'
import Loader from '../../components/Loader'

const AdminMeetings = () => {
  const navigate = useNavigate()
  const { data: meetings = [], isLoading, refetch } = useGetAllMeetingsQuery()
  const { data: teams = [] } = useGetAllTeamsQuery()
  const [deleteMeeting] = useDeleteMeetingMutation()
  
  const [filterStatus, setFilterStatus] = useState('all') // all, upcoming, past
  const [filterTeam, setFilterTeam] = useState('all')

  const handleDeleteMeeting = async (meetingId) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await deleteMeeting(meetingId).unwrap()
        refetch()
      } catch (error) {
        console.error('Failed to delete meeting:', error)
      }
    }
  }

  const handleJoinMeeting = (meetingId) => {
    navigate(`/meeting/${meetingId}`)
  }

  const canJoinMeeting = (scheduledAt) => {
    const meetingTime = new Date(scheduledAt)
    const now = new Date()
    // Can join 15 minutes before or after scheduled time
    return Math.abs(meetingTime - now) < 15 * 60 * 1000
  }

  const filteredMeetings = meetings.filter(meeting => {
    const now = new Date()
    const meetingTime = new Date(meeting.scheduledAt)
    
    // Status filter
    if (filterStatus === 'upcoming' && meetingTime <= now) return false
    if (filterStatus === 'past' && meetingTime > now) return false
    
    // Team filter
    if (filterTeam !== 'all' && meeting.teamId !== filterTeam) return false
    
    return true
  })

  const upcomingMeetings = meetings.filter(meeting => new Date(meeting.scheduledAt) > new Date())
  const pastMeetings = meetings.filter(meeting => new Date(meeting.scheduledAt) <= new Date())
  const todaysMeetings = upcomingMeetings.filter(meeting => {
    const meetingDate = new Date(meeting.scheduledAt)
    const today = new Date()
    return meetingDate.toDateString() === today.toDateString()
  })

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
          <h1 className="text-2xl font-bold text-gray-900">All Meetings</h1>
          <p className="text-gray-600">Monitor and manage all system meetings</p>
        </div>
      </div>

      {/* Meeting Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Meetings</p>
              <p className="text-2xl font-bold text-gray-900">{meetings.length}</p>
            </div>
          </div>
        </div>

        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingMeetings.length}</p>
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
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900">{todaysMeetings.length}</p>
            </div>
          </div>
        </div>

        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Timer className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(meetings.reduce((acc, meeting) => acc + (meeting.duration || 60), 0) / 60)}h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card title="Filters">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="glass-input px-3 py-2"
            >
              <option value="all">All Meetings</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="glass-input px-3 py-2"
            >
              <option value="all">All Teams</option>
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Meetings List */}
      <Card title={`Meetings (${filteredMeetings.length})`}>
        {filteredMeetings.length > 0 ? (
          <div className="space-y-4">
            {filteredMeetings.map((meeting) => {
              const isUpcoming = new Date(meeting.scheduledAt) > new Date()
              const team = teams.find(t => t._id === meeting.teamId)
              
              return (
                <div key={meeting._id} className="p-4 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{meeting.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isUpcoming 
                            ? 'bg-green-100/60 text-green-800' 
                            : 'bg-gray-100/60 text-gray-600'
                        }`}>
                          {isUpcoming ? 'Upcoming' : 'Completed'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{meeting.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <CalendarDays className="w-3 h-3" />
                          <span>{new Date(meeting.scheduledAt).toLocaleDateString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(meeting.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Timer className="w-3 h-3" />
                          <span>{meeting.duration || 60} min</span>
                        </span>
                        {meeting.location && (
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{meeting.location}</span>
                          </span>
                        )}
                        {team && (
                          <span className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{team.name}</span>
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center space-x-2">
                        {meeting.organizer && (
                          <span className="text-xs bg-blue-100/60 text-blue-800 px-2 py-1 rounded-full">
                            Organizer: {meeting.organizer.name}
                          </span>
                        )}
                        {meeting.participants && (
                          <span className="text-xs bg-purple-100/60 text-purple-800 px-2 py-1 rounded-full">
                            {meeting.participants.length} participants
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      {isUpcoming && canJoinMeeting(meeting.scheduledAt) && (
                        <button
                          onClick={() => handleJoinMeeting(meeting._id)}
                          className="flex items-center space-x-1 glass-button-primary px-3 py-1 text-xs"
                        >
                          <Video className="w-3 h-3" />
                          <span>Join</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMeeting(meeting._id)}
                        className="px-3 py-1 text-xs bg-red-100/60 hover:bg-red-200/60 text-red-700 rounded-lg transition-all duration-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No Meetings Found</p>
            <p className="text-sm">No meetings match your current filters</p>
          </div>
        )}
      </Card>
    </div>
  )
}

export default AdminMeetings