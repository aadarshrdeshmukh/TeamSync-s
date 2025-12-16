import { useState, useEffect } from 'react'
import { FileText, Users, Save, Edit3, Eye, Clock } from 'lucide-react'

const DocumentCollaborator = ({ document, onSave, onClose }) => {
  const [content, setContent] = useState(document?.content || '')
  const [isEditing, setIsEditing] = useState(false)
  const [collaborators, setCollaborators] = useState([
    { name: 'You', isActive: true, cursor: 0 },
    { name: 'John Doe', isActive: true, cursor: 45 },
    { name: 'Jane Smith', isActive: false, cursor: 120 }
  ])
  const [lastSaved, setLastSaved] = useState(new Date())
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    // Simulate real-time collaboration updates
    const interval = setInterval(() => {
      setCollaborators(prev => prev.map(collab => ({
        ...collab,
        cursor: collab.isActive ? Math.floor(Math.random() * content.length) : collab.cursor,
        isActive: Math.random() > 0.3 // Randomly simulate users going online/offline
      })))
    }, 3000)

    return () => clearInterval(interval)
  }, [content.length])

  const handleContentChange = (e) => {
    setContent(e.target.value)
    setHasUnsavedChanges(true)
  }

  const handleSave = () => {
    onSave?.({ ...document, content })
    setLastSaved(new Date())
    setHasUnsavedChanges(false)
  }

  const handleToggleEdit = () => {
    if (isEditing && hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Save before switching to view mode?')) {
        handleSave()
      }
    }
    setIsEditing(!isEditing)
  }

  const activeCollaborators = collaborators.filter(c => c.isActive)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card max-w-4xl w-full mx-4 h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/20 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100/60 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{document?.name || 'Untitled Document'}</h3>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                </span>
                {hasUnsavedChanges && (
                  <span className="text-orange-600">• Unsaved changes</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Collaborators */}
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <div className="flex -space-x-1">
                {activeCollaborators.map((collab, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-medium"
                    title={collab.name}
                  >
                    {collab.name.charAt(0)}
                  </div>
                ))}
              </div>
              <span className="text-xs text-gray-500">{activeCollaborators.length} online</span>
            </div>

            {/* Controls */}
            <div className="flex space-x-2">
              <button
                onClick={handleToggleEdit}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                  isEditing 
                    ? 'bg-blue-100/60 text-blue-700' 
                    : 'glass-button'
                }`}
              >
                {isEditing ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{isEditing ? 'Editing' : 'View'}</span>
              </button>

              {isEditing && (
                <button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges}
                  className="flex items-center space-x-1 glass-button-primary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-3 h-3" />
                  <span>Save</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="glass-button px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 overflow-hidden">
          {isEditing ? (
            <div className="relative h-full">
              <textarea
                value={content}
                onChange={handleContentChange}
                className="w-full h-full glass-input resize-none text-sm leading-relaxed"
                placeholder="Start typing your document content..."
                style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
              />
              
              {/* Simulated cursor positions */}
              {collaborators.filter(c => c.isActive && c.name !== 'You').map((collab, index) => (
                <div
                  key={index}
                  className="absolute w-0.5 h-4 bg-gradient-to-b from-blue-500 to-purple-600 animate-pulse"
                  style={{
                    left: `${Math.min(collab.cursor * 0.1, 90)}%`,
                    top: `${20 + (collab.cursor * 0.05)}px`
                  }}
                  title={`${collab.name} is here`}
                />
              ))}
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 font-sans">
                  {content || 'This document is empty. Switch to edit mode to add content.'}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/20 bg-white/20 backdrop-blur-sm">
          <div className="flex justify-between items-center text-xs text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Words: {content.split(/\s+/).filter(word => word.length > 0).length}</span>
              <span>Characters: {content.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Real-time sync enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentCollaborator