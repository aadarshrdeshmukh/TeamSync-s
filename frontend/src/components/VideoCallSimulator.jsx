import { useState, useEffect } from 'react'
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Users, Settings, Monitor } from 'lucide-react'

const VideoCallSimulator = ({ meetingTitle, participants = [], onEndCall }) => {
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [isCallActive, setIsCallActive] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      if (isCallActive) {
        setCallDuration(prev => prev + 1)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [isCallActive])

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleEndCall = () => {
    setIsCallActive(false)
    onEndCall?.()
  }

  const simulatedParticipants = [
    { name: 'You', isHost: true, video: isVideoOn, audio: isAudioOn },
    ...participants.slice(0, 5).map(p => ({
      name: p.name || 'Participant',
      isHost: false,
      video: Math.random() > 0.3,
      audio: Math.random() > 0.2
    }))
  ]

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900/90 backdrop-blur-sm p-4 flex justify-between items-center">
        <div>
          <h2 className="text-white font-semibold">{meetingTitle}</h2>
          <p className="text-gray-300 text-sm">{formatDuration(callDuration)}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-300 text-sm flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {simulatedParticipants.length}
          </span>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {simulatedParticipants.map((participant, index) => (
          <div key={index} className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
            {participant.video ? (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-semibold">
                    {participant.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <VideoOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Camera off</p>
                </div>
              </div>
            )}
            
            {/* Participant Info */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
              <div className="bg-black/50 backdrop-blur-sm rounded px-2 py-1">
                <span className="text-white text-sm font-medium">
                  {participant.name}
                  {participant.isHost && (
                    <span className="ml-1 text-xs text-blue-300">(Host)</span>
                  )}
                </span>
              </div>
              <div className="flex space-x-1">
                {!participant.audio && (
                  <div className="bg-red-500 rounded-full p-1">
                    <MicOff className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Screen Sharing Indicator */}
      {isScreenSharing && (
        <div className="bg-green-600 text-white px-4 py-2 text-center">
          <Monitor className="w-4 h-4 inline mr-2" />
          You are sharing your screen
        </div>
      )}

      {/* Controls */}
      <div className="bg-gray-900/90 backdrop-blur-sm p-4">
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={() => setIsAudioOn(!isAudioOn)}
            className={`p-3 rounded-full transition-colors ${
              isAudioOn 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-3 rounded-full transition-colors ${
              isVideoOn 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`p-3 rounded-full transition-colors ${
              isScreenSharing 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            <Monitor className="w-5 h-5" />
          </button>

          <button
            onClick={handleEndCall}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <PhoneOff className="w-5 h-5" />
          </button>

          <button className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-gray-400 text-sm">
            This is a simulated video call interface. In a real implementation, this would connect to a video service like WebRTC, Zoom, or Teams.
          </p>
        </div>
      </div>
    </div>
  )
}

export default VideoCallSimulator