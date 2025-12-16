const File = require('../models/File');
const Team = require('../models/Team');
const Activity = require('../models/Activity');

// Get all files
const getAllFiles = async (request, response) => {
    try {
        const files = await File.find({})
            .populate('teamId', 'name')
            .populate('uploadedBy', 'name email username');
        
        response.status(200).json(files);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Get files by team
const getFilesByTeam = async (request, response) => {
    try {
        const files = await File.find({ teamId: request.params.teamId })
            .populate('teamId', 'name')
            .populate('uploadedBy', 'name email username');
        
        response.status(200).json(files);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Get file by ID
const getFileById = async (request, response) => {
    try {
        const file = await File.findById(request.params.id)
            .populate('teamId', 'name')
            .populate('uploadedBy', 'name email username');
        
        if (!file) {
            return response.status(404).json({ message: "File not found" });
        }
        
        response.status(200).json(file);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Upload file
const uploadFile = async (request, response) => {
    try {
        const { fileName, fileUrl, fileSize, fileType, teamId, description } = request.body;

        if (!fileName || !fileUrl || !fileSize || !fileType || !teamId) {
            return response.status(400).json({ message: "All fields are required" });
        }

        // Check if team exists
        const team = await Team.findById(teamId);
        if (!team) {
            return response.status(404).json({ message: "Team not found" });
        }

        // Check if user is member of the team or admin
        const isMember = team.members.some(m => m.userId.toString() === request.user.userId.toString());
        const isCreator = team.createdBy.toString() === request.user.userId.toString();
        const isAdmin = request.user.role === 'ADMIN';

        if (!isMember && !isCreator && !isAdmin) {
            return response.status(403).json({ message: "Access denied. You are not a member of this team" });
        }

        const newFile = new File({
            fileName,
            fileUrl,
            fileSize,
            fileType,
            teamId,
            uploadedBy: request.user.userId,
            description: description || ""
        });

        await newFile.save();

        // Log activity
        const activity = new Activity({
            teamId,
            userId: request.user.userId,
            activityType: 'file_uploaded',
            description: `File "${fileName}" was uploaded`,
            relatedId: newFile._id
        });
        await activity.save();

        const populatedFile = await File.findById(newFile._id)
            .populate('teamId', 'name')
            .populate('uploadedBy', 'name email username');

        response.status(201).json({ 
            message: "File uploaded successfully", 
            data: populatedFile 
        });

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Update file
const updateFile = async (request, response) => {
    try {
        const { fileName, description } = request.body;

        const file = await File.findById(request.params.id);
        if (!file) {
            return response.status(404).json({ message: "File not found" });
        }

        // Check if user is uploader or admin
        if (file.uploadedBy.toString() !== request.user.userId.toString() && request.user.role !== 'ADMIN') {
            return response.status(403).json({ message: "Access denied. Only uploader or admin can update" });
        }

        if (fileName) file.fileName = fileName;
        if (description !== undefined) file.description = description;

        await file.save();

        const updatedFile = await File.findById(file._id)
            .populate('teamId', 'name')
            .populate('uploadedBy', 'name email username');

        response.status(200).json({ 
            message: "File updated successfully", 
            data: updatedFile 
        });

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Delete file
const deleteFile = async (request, response) => {
    try {
        const file = await File.findById(request.params.id);
        if (!file) {
            return response.status(404).json({ message: "File not found" });
        }

        // Check if user is uploader or team lead or admin
        const team = await Team.findById(file.teamId);
        const isUploader = file.uploadedBy.toString() === request.user.userId.toString();
        const isLead = team.members.some(m => 
            m.userId.toString() === request.user.userId.toString() && m.role === 'LEAD'
        );

        if (!isUploader && !isLead && request.user.role !== 'ADMIN') {
            return response.status(403).json({ message: "Access denied. Only uploader, team lead, or admin can delete" });
        }

        await File.findByIdAndDelete(request.params.id);

        response.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllFiles,
    getFilesByTeam,
    getFileById,
    uploadFile,
    updateFile,
    deleteFile
};
