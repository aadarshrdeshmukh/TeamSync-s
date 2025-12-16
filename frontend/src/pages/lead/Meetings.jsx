import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetMyMeetingsQuery, useCreateMeetingMutation, useUpdateMeetingMutation, useDeleteMeetingMutation } from '../../api/meetingApi'
import { useGetMyTeamsQuery } from '../../api/teamApi'
import { Calendar, Clock, CheckCircle, Timer, CalendarDays, MapPin, Edit, Trash2, Plus, Video } from 'lucide-react'
import Card from '../../components/Card'
import Loader from '../../components/Loader'

const LeadMeetings = () => {
  const navigate = useNavigate()
  const { data: meetings = [], isLoading, refetch } = useGetMyMeetingsQuery()
  const { data: teams = [] } = useGetMyTeamsQuery()
  const [createMeeting] = useCreateMeetingMutation()
  const [updateMeeting] = useUpdateMeetingMutation()
  const [deleteMeeting] = useDeleteMeetingMutation()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    teamId: '',
    location: ''
  })

  const handleCreateMeeting = async (e) => {
    e.preventDefault()
    try {
      const meetingDateTime = new Date(`${formData.date}T${formData.time}`)
      await createMeeting({
        title: formData.title,
        description: formData.description,
        scheduledAt: meetingDateTime.toISOString(),
        duration: formData.duration,
        teamId: formData.teamId,
        location: formData.location
      }).unwrap()
      setShowCreateModal(false)
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: 60,
        teamId: '',
        location: ''
      })
      refetch()
    } catch (error) {
      console.error('Failed to create meeting:', error)
    }
  }

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

  const upcomingMeetings = meetings.filter(meeting => new Date(meeting.scheduledAt) > new Date())
  const pastMeetings = meetings.filter(meeting => new Date(meeting.scheduledAt) <= new Date())

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
          <h1 className="text-2xl font-bold text-gray-900">Team Meetings</h1>
          <p className="text-gray-600">Schedule and manage meetings for your teams</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="glass-button-primary px-6 py-3"
        >
          Schedule Meeting
        </button>
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
                <CheckCircle className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{pastMeetings.length}</p>
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

      {/* Upcoming Meetings */}
      <Card title="Upcoming Meetings">
        {upcomingMeetings.length > 0 ? (
          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <div key={meeting._id} className="p-4 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{meeting.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{meeting.description}</p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
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
                    </div>
                    {meeting.teamId && (
                      <div className="mt-2">
                        <span className="text-xs bg-blue-100/60 text-blue-800 px-2 py-1 rounded-full">
                          {teams.find(t => t._id === meeting.teamId)?.name || 'Team'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {canJoinMeeting(meeting.scheduledAt) && (
                      <button
                        onClick={() => handleJoinMeeting(meeting._id)}
                        className="flex items-center space-x-1 glass-button-primary px-3 py-1 text-xs"
                      >
                        <Video className="w-3 h-3" />
                        <span>Join</span>
                      </button>
                    )}
                    <button className="glass-button px-3 py-1 text-xs">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMeeting(meeting._id)}
                      className="px-3 py-1 text-xs bg-red-100/60 hover:bg-red-200/60 text-red-700 rounded-lg transition-all duration-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No Meetings Scheduled</p>
            <p className="text-sm">Schedule your first team meeting to get started</p>
          </div>
        )}
      </Card>

      {/* Past Meetings */}
      {pastMeetings.length > 0 && (
        <Card title="Recent Meetings">
          <div className="space-y-3">
            {pastMeetings.slice(0, 5).map((meeting) => (
              <div key={meeting._id} className="p-3 bg-white/30 backdrop-blur-sm border border-white/20 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-medium text-gray-900">{meeting.title}</h5>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <CalendarDays className="w-3 h-3" />
                        <span>{new Date(meeting.scheduledAt).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(meeting.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </div>
                  </div>
                  <span className="text-xs bg-gray-100/60 text-gray-600 px-2 py-1 rounded-full">
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule New Meeting</h3>
            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="glass-input w-full px-3 py-2"
                  placeholder="Enter meeting title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="glass-input w-full px-3 py-2 h-20 resize-none"
                  placeholder="Enter meeting description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="glass-input w-full px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="glass-input w-full px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="glass-input w-full px-3 py-2"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team
                </label>
                <select
                  required
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                  className="glass-input w-full px-3 py-2"
                >
                  <option value="">Select a team</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="glass-input w-full px-3 py-2"
                  placeholder="Meeting room, Zoom link, etc."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({
                      title: '',
                      description: '',
                      date: '',
                      time: '',
                      duration: 60,
                      teamId: '',
                      location: ''
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
                  Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeadMeetings