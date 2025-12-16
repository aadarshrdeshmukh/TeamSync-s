import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetMeetingByIdQuery } from '../api/meetingApi'
import VideoCallSimulator from '../components/VideoCallSimulator'
import Loader from '../components/Loader'
import { Calendar, Clock, Users, Video } from 'lucide-react'

const MeetingRoom = () => {
  const { meetingId } = useParams()
  const navigate = useNavigate()
  const { data: meeting, isLoading, error } = useGetMeetingByIdQuery(meetingId)
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  const handleJoinMeeting = async () => {
    setIsJoining(true)
    // Simulate joining delay
    setTimeout(() => {
      setShowVideoCall(true)
      setIsJoining(false)
    }, 2000)
  }

  const handleEndCall = () => {
    setShowVideoCall(false)
    navigate(-1) // Go back to previous page
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Meeting Not Found</h1>
          <p className="text-gray-600 mb-4">The meeting you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate(-1)}
            className="glass-button-primary px-6 py-3"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (showVideoCall) {
    return (
      <VideoCallSimulator
        meetingTitle={meeting.title}
        participants={meeting.participants || []}
        onEndCall={handleEndCall}
      />
    )
  }

  const meetingTime = new Date(meeting.scheduledAt)
  const now = new Date()
  const isUpcoming = meetingTime > now
  const canJoin = Math.abs(meetingTime - now) < 15 * 60 * 1000 // Can join 15 minutes before/after

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-blue-100/60 rounded-full flex items-center justify-center mx-auto">
            <Video className="w-8 h-8 text-blue-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{meeting.title}</h1>
            <p className="text-gray-600">{meeting.description}</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{meetingTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{meetingTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</span>
            </div>

            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>{meeting.participants?.length || 0} participants</span>
            </div>
          </div>

          <div className="space-y-3">
            {canJoin ? (
              <button
                onClick={handleJoinMeeting}
                disabled={isJoining}
                className="w-full glass-button-primary py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Joining...</span>
                  </div>
                ) : (
                  'Join Meeting'
                )}
              </button>
            ) : isUpcoming ? (
              <div className="text-center">
                <p className="text-gray-600 mb-3">Meeting starts in:</p>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.ceil((meetingTime - now) / (1000 * 60))} minutes
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  You can join 15 minutes before the meeting starts
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-3">This meeting has ended</p>
                <p className="text-sm text-gray-500">
                  The meeting ended {Math.floor((now - meetingTime) / (1000 * 60))} minutes ago
                </p>
              </div>
            )}

            <button
              onClick={() => navigate(-1)}
              className="w-full glass-button py-2 px-6"
            >
              Back to Meetings
            </button>
          </div>

          <div className="text-xs text-gray-500 bg-blue-50/50 p-3 rounded-lg">
            <p className="font-medium mb-1">Meeting Link:</p>
            <p className="font-mono break-all">{meeting.meetingLink}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MeetingRoom