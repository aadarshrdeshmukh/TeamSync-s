import { useState } from 'react'
import { useGetFilesByTeamQuery, useUploadFileMutation } from '../../api/fileApi'
import { useGetMyTeamsQuery } from '../../api/teamApi'
import { FileText, Upload, Download, FolderOpen, File, Image, Video, Archive, Edit3 } from 'lucide-react'
import Card from '../../components/Card'
import Loader from '../../components/Loader'
import DocumentCollaborator from '../../components/DocumentCollaborator'

const MemberFiles = () => {
  const { data: teams = [] } = useGetMyTeamsQuery()
  const [selectedTeam, setSelectedTeam] = useState('')
  const [showDocumentEditor, setShowDocumentEditor] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const { data: files = [], isLoading, refetch } = useGetFilesByTeamQuery(selectedTeam, {
    skip: !selectedTeam
  })
  const [uploadFile] = useUploadFileMutation()
  
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [formData, setFormData] = useState({
    fileName: '',
    description: '',
    file: null
  })

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return <Image className="w-5 h-5" />
    if (fileType?.startsWith('video/')) return <Video className="w-5 h-5" />
    if (fileType?.includes('pdf')) return <FileText className="w-5 h-5" />
    if (fileType?.includes('zip') || fileType?.includes('rar')) return <Archive className="w-5 h-5" />
    return <File className="w-5 h-5" />
  }

  const getFileColor = (fileType) => {
    if (fileType?.startsWith('image/')) return 'text-green-600 bg-green-100/60'
    if (fileType?.startsWith('video/')) return 'text-purple-600 bg-purple-100/60'
    if (fileType?.includes('pdf')) return 'text-red-600 bg-red-100/60'
    if (fileType?.includes('zip') || fileType?.includes('rar')) return 'text-orange-600 bg-orange-100/60'
    return 'text-blue-600 bg-blue-100/60'
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleFileUpload = async (e) => {
    e.preventDefault()
    if (!formData.file || !selectedTeam) return

    try {
      // Simulate file upload (in real app, you'd upload to cloud storage)
      const fileUrl = `placeholder://files/${Date.now()}-${formData.file.name}`
      
      await uploadFile({
        fileName: formData.fileName || formData.file.name,
        fileUrl,
        fileSize: formData.file.size,
        fileType: formData.file.type,
        teamId: selectedTeam,
        description: formData.description
      }).unwrap()

      setShowUploadModal(false)
      setFormData({ fileName: '', description: '', file: null })
      refetch()
    } catch (error) {
      console.error('Failed to upload file:', error)
    }
  }

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Authentication required. Please log in again.')
        return
      }

      const response = await fetch(`/api/files/${fileId}/content`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Download failed')
      }

      // Get the file content as blob
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert(`Download failed: ${error.message}`)
    }
  }

  // Calculate statistics for selected team
  const fileStats = {
    total: files.length,
    totalSize: files.reduce((acc, file) => acc + (file.fileSize || 0), 0),
    images: files.filter(f => f.fileType?.startsWith('image/')).length,
    documents: files.filter(f => f.fileType?.includes('pdf') || f.fileType?.includes('doc')).length,
    videos: files.filter(f => f.fileType?.startsWith('video/')).length
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Files</h1>
          <p className="text-gray-600">Access and share files with your team</p>
        </div>
        {selectedTeam && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="glass-button-primary px-6 py-3"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </button>
        )}
      </div>

      {/* Team Selection */}
      <div className="glass-panel p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Team to View Files
            </label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="glass-input w-full max-w-md px-3 py-2"
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
              <div className="glass-metric-card p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-white/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-4 h-4 text-gray-700" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">Total Files</p>
                    <p className="text-lg font-bold text-gray-900">{fileStats.total}</p>
                  </div>
                </div>
              </div>

              <div className="glass-metric-card p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-white/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Archive className="w-4 h-4 text-gray-700" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">Total Size</p>
                    <p className="text-lg font-bold text-gray-900">{formatFileSize(fileStats.totalSize)}</p>
                  </div>
                </div>
              </div>

              <div className="glass-metric-card p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-white/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Image className="w-4 h-4 text-gray-700" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">Images</p>
                    <p className="text-lg font-bold text-gray-900">{fileStats.images}</p>
                  </div>
                </div>
              </div>

              <div className="glass-metric-card p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-white/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-gray-700" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">Documents</p>
                    <p className="text-lg font-bold text-gray-900">{fileStats.documents}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Files Display */}
      {selectedTeam && (
        <>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {files.map((file) => (
                <Card key={file._id}>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${getFileColor(file.fileType)}`}>
                        {getFileIcon(file.fileType)}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 truncate">{file.fileName}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{file.description || 'No description'}</p>
                    </div>

                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span className="font-medium">{formatFileSize(file.fileSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uploaded by:</span>
                        <span className="font-medium">{file.uploadedBy?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span className="font-medium">{formatDate(file.uploadedAt)}</span>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      {/* Edit Document button for text files */}
                      {(file.fileType?.includes('text') || file.fileName?.endsWith('.txt') || file.fileName?.endsWith('.md')) && (
                        <button
                          onClick={() => {
                            setSelectedDocument({
                              ...file,
                              content: `# ${file.fileName}\n\nThis is a collaborative document. Multiple team members can edit this document simultaneously.\n\n## Sample Content\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n### Features\n- Real-time collaboration\n- Auto-save functionality\n- Version history\n- Comment system\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`
                            })
                            setShowDocumentEditor(true)
                          }}
                          className="w-full glass-button-primary py-2 px-3 text-sm flex items-center justify-center"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Document
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDownloadFile(file._id, file.fileName)}
                        className="w-full glass-button py-2 px-3 text-sm flex items-center justify-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && files.length === 0 && (
            <Card>
              <div className="text-center py-8 text-gray-400">
                <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No Files Yet</p>
                <p className="text-sm">No files have been shared in this team yet</p>
              </div>
            </Card>
          )}
        </>
      )}

      {!selectedTeam && (
        <Card>
          <div className="text-center py-8 text-gray-400">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Select a Team</p>
            <p className="text-sm">Choose a team above to view shared files</p>
          </div>
        </Card>
      )}

      {/* My Teams Overview */}
      <Card title="My Teams">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.length > 0 ? (
            teams.map((team) => (
              <div key={team._id} className="p-4 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{team.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{team.members?.length || 0} members</p>
                  </div>
                  <button
                    onClick={() => setSelectedTeam(team._id)}
                    className="text-xs glass-button px-3 py-1"
                  >
                    View Files
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-4 text-gray-500 text-sm">
              <FolderOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No teams assigned</p>
            </div>
          )}
        </div>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload File</h3>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select File
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                  className="glass-input w-full px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.fileName}
                  onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                  className="glass-input w-full px-3 py-2"
                  placeholder="Leave empty to use original name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="glass-input w-full px-3 py-2 h-20 resize-none"
                  placeholder="Enter file description"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false)
                    setFormData({ fileName: '', description: '', file: null })
                  }}
                  className="flex-1 glass-button py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 glass-button-primary py-2 px-4"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Collaborator */}
      {showDocumentEditor && selectedDocument && (
        <DocumentCollaborator
          document={selectedDocument}
          onSave={(updatedDoc) => {
            console.log('Document saved:', updatedDoc)
            // In a real app, this would save to the backend
          }}
          onClose={() => {
            setShowDocumentEditor(false)
            setSelectedDocument(null)
          }}
        />
      )}
    </div>
  )
}

export default MemberFiles