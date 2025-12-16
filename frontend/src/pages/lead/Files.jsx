import { useState } from 'react'
import { useGetFilesByTeamQuery, useUploadFileMutation, useDeleteFileMutation, useUpdateFileMutation } from '../../api/fileApi'
import { useGetMyTeamsQuery } from '../../api/teamApi'
import { FileText, Upload, Download, Trash2, Edit, FolderOpen, File, Image, Video, Archive, Edit3 } from 'lucide-react'
import Card from '../../components/Card'
import Loader from '../../components/Loader'
import DocumentCollaborator from '../../components/DocumentCollaborator'

const LeadFiles = () => {
    const { data: teams = [] } = useGetMyTeamsQuery()
    const [selectedTeam, setSelectedTeam] = useState('')
    const [showDocumentEditor, setShowDocumentEditor] = useState(false)
    const [selectedDocument, setSelectedDocument] = useState(null)
    const { data: files = [], isLoading, refetch } = useGetFilesByTeamQuery(selectedTeam, {
        skip: !selectedTeam
    })
    const [uploadFile] = useUploadFileMutation()
    const [deleteFile] = useDeleteFileMutation()
    const [updateFile] = useUpdateFileMutation()

    const [showUploadModal, setShowUploadModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)
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
        if (!formData.file || !selectedTeam) {
            alert('Please select a file and team before uploading')
            return
        }

        try {
            // Simulate file upload (in real app, you'd upload to cloud storage)
            const fileUrl = `https://teamsync-files.s3.amazonaws.com/${Date.now()}-${formData.file.name}`

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
            alert(`Upload failed: ${error.data?.message || error.message || 'Unknown error'}`)
        }
    }

    const handleDeleteFile = async (fileId) => {
        if (window.confirm('Are you sure you want to delete this file?')) {
            try {
                await deleteFile(fileId).unwrap()
                refetch()
            } catch (error) {
                console.error('Failed to delete file:', error)
            }
        }
    }

    const handleEditFile = async (e) => {
        e.preventDefault()
        try {
            await updateFile({
                id: selectedFile._id,
                fileName: formData.fileName,
                description: formData.description
            }).unwrap()
            setShowEditModal(false)
            setSelectedFile(null)
            setFormData({ fileName: '', description: '', file: null })
            refetch()
        } catch (error) {
            console.error('Failed to update file:', error)
        }
    }

    const openEditModal = (file) => {
        setSelectedFile(file)
        setFormData({
            fileName: file.fileName,
            description: file.description || '',
            file: null
        })
        setShowEditModal(true)
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
                    <p className="text-gray-600">Manage and share files with your team members</p>
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
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => openEditModal(file)}
                                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteFile(file._id)}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50/50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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
                                                            content: `# ${file.fileName}\n\nThis is a collaborative document. Multiple team members can edit this document simultaneously.\n\n## Team Collaboration\n\nAs a team lead, you can:\n- Edit documents in real-time\n- See who else is editing\n- Track changes and versions\n- Manage document permissions\n\n### Current Project Status\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n#### Action Items\n1. Review document structure\n2. Add team feedback\n3. Finalize content\n4. Share with stakeholders\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris.`
                                                        })
                                                        setShowDocumentEditor(true)
                                                    }}
                                                    className="w-full glass-button-primary py-2 px-3 text-sm flex items-center justify-center"
                                                >
                                                    <Edit3 className="w-4 h-4 mr-2" />
                                                    Edit Document
                                                </button>
                                            )}
                                            
                                            <a
                                                href={file.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full glass-button py-2 px-3 text-sm flex items-center justify-center"
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Download
                                            </a>
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
                                <p className="text-sm">Upload files to share with your team members</p>
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
                        <p className="text-sm">Choose a team above to view and manage files</p>
                    </div>
                </Card>
            )}

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

            {/* Edit Modal */}
            {showEditModal && selectedFile && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="glass-card p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit File</h3>
                        <form onSubmit={handleEditFile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    File Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.fileName}
                                    onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                                    className="glass-input w-full px-3 py-2"
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
                                    placeholder="Enter file description"
                                />
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false)
                                        setSelectedFile(null)
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
                                    Update
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

export default LeadFiles