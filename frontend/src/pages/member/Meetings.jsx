import { useNavigate } from 'react-router-dom'
import { useGetMyMeetingsQuery, useJoinMeetingMutation } from '../../api/meetingApi'
import { Calendar, Clock, BarChart3, CheckCircle, MapPin, Video } from 'lucide-react'
import Card from '../../components/Card'
import Loader from '../../components/Loader'

const MemberMeetings = () => {
  const navigate = useNavigate()
  const { data: meetings = [], isLoading, refetch } = useGetMyMeetingsQuery()
  const [joinMeeting] = useJoinMeetingMutation()

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
  const todaysMeetings = upcomingMeetings.filter(meeting => {
    const meetingDate = new Date(meeting.scheduledAt)
    const today = new Date()
    return meetingDate.toDateString() === today.toDateString()
  })

  const nextMeeting = upcomingMeetings.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0]

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
        <h1 className="text-2xl font-display font-bold text-gray-900">My Meetings</h1>
        <p className="text-gray-600">View and join your scheduled meetings</p>
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
                <CheckCircle className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Attended</p>
              <p className="text-2xl font-bold text-gray-900">{pastMeetings.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Meeting Alert */}
      {nextMeeting && (
        <div className="glass-card p-6 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Next Meeting</h3>
              <p className="text-gray-600 mt-1">{nextMeeting.title}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(nextMeeting.scheduledAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(nextMeeting.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{nextMeeting.duration || 60} min</span>
                </div>
              </div>
            </div>
            {canJoinMeeting(nextMeeting.scheduledAt) ? (
              <button
                onClick={() => handleJoinMeeting(nextMeeting._id)}
                className="flex items-center space-x-2 glass-button-primary px-4 py-2"
              >
                <Video className="w-4 h-4" />
                <span>Join Meeting</span>
              </button>
            ) : (
              <div className="text-sm text-gray-500">
                {new Date(nextMeeting.scheduledAt) > new Date() 
                  ? 'Available 15 min before start'
                  : 'Meeting has ended'
                }
              </div>
            )}
          </div>
        </div>
      )}

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
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(meeting.scheduledAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(meeting.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{meeting.duration || 60} min</span>
                      </div>
                      {meeting.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{meeting.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="text-xs bg-blue-100/60 text-blue-800 px-2 py-1 rounded-full">
                        Team Meeting
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {canJoinMeeting(meeting.scheduledAt) ? (
                      <button
                        onClick={() => handleJoinMeeting(meeting._id)}
                        className="flex items-center space-x-1 glass-button-primary px-4 py-2 text-sm"
                      >
                        <Video className="w-3 h-3" />
                        <span>Join</span>
                      </button>
                    ) : (
                      <div className="text-xs text-gray-500 text-center">
                        {new Date(meeting.scheduledAt) > new Date() 
                          ? 'Available soon'
                          : 'Ended'
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100/60 rounded-2xl flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium">No Meetings Scheduled</p>
            <p className="text-sm">Your upcoming meetings will appear here</p>
          </div>
        )}
      </Card>

      {/* Recent Meetings */}
      {pastMeetings.length > 0 && (
        <Card title="Recent Meetings">
          <div className="space-y-3">
            {pastMeetings.slice(0, 5).map((meeting) => (
              <div key={meeting._id} className="p-3 bg-white/30 backdrop-blur-sm border border-white/20 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-medium text-gray-900">{meeting.title}</h5>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(meeting.scheduledAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(meeting.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs bg-gray-100/60 text-gray-600 px-2 py-1 rounded-full">
                    Attended
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default MemberMeetings