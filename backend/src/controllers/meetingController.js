const Meeting = require('../models/Meeting');
const Team = require('../models/Team');
const Activity = require('../models/Activity');

// Get all meetings
const getAllMeetings = async (request, response) => {
    try {
        const meetings = await Meeting.find({})
            .populate('teamId', 'name')
            .populate('organizer', 'name email username')
            .populate('participants', 'name email username');
        
        response.status(200).json(meetings);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Get meetings by team
const getMeetingsByTeam = async (request, response) => {
    try {
        const meetings = await Meeting.find({ teamId: request.params.teamId })
            .populate('teamId', 'name')
            .populate('organizer', 'name email username')
            .populate('participants', 'name email username');
        
        response.status(200).json(meetings);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Get meetings for current user
const getMyMeetings = async (request, response) => {
    try {
        const meetings = await Meeting.find({
            $or: [
                { organizer: request.user.userId },
                { participants: request.user.userId }
            ]
        })
        .populate('teamId', 'name')
        .populate('organizer', 'name email username')
        .populate('participants', 'name email username');
        
        response.status(200).json(meetings);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Get meeting by ID
const getMeetingById = async (request, response) => {
    try {
        const meeting = await Meeting.findById(request.params.id)
            .populate('teamId', 'name')
            .populate('organizer', 'name email username')
            .populate('participants', 'name email username');
        
        if (!meeting) {
            return response.status(404).json({ message: "Meeting not found" });
        }
        
        response.status(200).json(meeting);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Create new meeting
const createMeeting = async (request, response) => {
    try {
        const { title, description, teamId, participants, scheduledAt, duration } = request.body;

        if (!title || !description || !teamId || !scheduledAt || !duration) {
            return response.status(400).json({ message: "All fields are required" });
        }

        // Check if team exists
        const team = await Team.findById(teamId);
        if (!team) {
            return response.status(404).json({ message: "Team not found" });
        }

        // Check if user is team lead, creator, or admin (members cannot create meetings)
        const isCreator = team.createdBy.toString() === request.user.userId.toString();
        const isLead = team.members.some(m => 
            m.userId.toString() === request.user.userId.toString() && m.role === 'LEAD'
        );

        if (!isCreator && !isLead && request.user.role !== 'ADMIN') {
            return response.status(403).json({ message: "Access denied. Only team leads or admins can create meetings" });
        }

        // Generate meeting link (simulated)
        const meetingLink = `https://teamsync.meet/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const newMeeting = new Meeting({
            title,
            description,
            teamId,
            organizer: request.user.userId,
            participants: participants || [],
            scheduledAt,
            duration,
            meetingLink
        });

        await newMeeting.save();

        // Log activity
        const activity = new Activity({
            teamId,
            userId: request.user.userId,
            activityType: 'meeting_scheduled',
            description: `Meeting "${title}" was scheduled`,
            relatedId: newMeeting._id
        });
        await activity.save();

        const populatedMeeting = await Meeting.findById(newMeeting._id)
            .populate('teamId', 'name')
            .populate('organizer', 'name email username')
            .populate('participants', 'name email username');

        response.status(201).json({ 
            message: "Meeting created successfully", 
            data: populatedMeeting 
        });

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Update meeting
const updateMeeting = async (request, response) => {
    try {
        const { title, description, participants, scheduledAt, duration, status, recordingUrl } = request.body;

        const meeting = await Meeting.findById(request.params.id);
        if (!meeting) {
            return response.status(404).json({ message: "Meeting not found" });
        }

        // Check if user is organizer, team lead, or admin
        const team = await Team.findById(meeting.teamId);
        const isOrganizer = meeting.organizer.toString() === request.user.userId.toString();
        const isLead = team && team.members && team.members.some(m => 
            m.userId.toString() === request.user.userId.toString() && m.role === 'LEAD'
        );

        if (!isOrganizer && !isLead && request.user.role !== 'ADMIN') {
            return response.status(403).json({ message: "Access denied. Only organizer, team lead, or admin can update" });
        }

        if (title) meeting.title = title;
        if (description) meeting.description = description;
        if (participants) meeting.participants = participants;
        if (scheduledAt) meeting.scheduledAt = scheduledAt;
        if (duration) meeting.duration = duration;
        if (status) meeting.status = status;
        if (recordingUrl) meeting.recordingUrl = recordingUrl;

        await meeting.save();

        const updatedMeeting = await Meeting.findById(meeting._id)
            .populate('teamId', 'name')
            .populate('organizer', 'name email username')
            .populate('participants', 'name email username');

        response.status(200).json({ 
            message: "Meeting updated successfully", 
            data: updatedMeeting 
        });

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Delete meeting
const deleteMeeting = async (request, response) => {
    try {
        const meeting = await Meeting.findById(request.params.id);
        if (!meeting) {
            return response.status(404).json({ message: "Meeting not found" });
        }

        // Check if user is organizer, team lead, or admin
        const team = await Team.findById(meeting.teamId);
        const isOrganizer = meeting.organizer.toString() === request.user.userId.toString();
        const isLead = team && team.members && team.members.some(m => 
            m.userId.toString() === request.user.userId.toString() && m.role === 'LEAD'
        );

        if (!isOrganizer && !isLead && request.user.role !== 'ADMIN') {
            return response.status(403).json({ message: "Access denied. Only organizer, team lead, or admin can delete" });
        }

        await Meeting.findByIdAndDelete(request.params.id);

        response.status(200).json({ message: "Meeting deleted successfully" });
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Join meeting
const joinMeeting = async (request, response) => {
    try {
        const meeting = await Meeting.findById(request.params.id);
        if (!meeting) {
            return response.status(404).json({ message: "Meeting not found" });
        }

        // Check if user is part of the team or already a participant
        const team = await Team.findById(meeting.teamId);
        const isTeamMember = team && team.members && team.members.some(m => 
            m.userId.toString() === request.user.userId.toString()
        );
        const isOrganizer = meeting.organizer.toString() === request.user.userId.toString();

        if (!isTeamMember && !isOrganizer && request.user.role !== 'ADMIN') {
            return response.status(403).json({ message: "Access denied. You are not a member of this team" });
        }

        // Add user to participants if not already there
        if (!meeting.participants.includes(request.user.userId)) {
            meeting.participants.push(request.user.userId);
            await meeting.save();
        }

        // Log activity
        const activity = new Activity({
            teamId: meeting.teamId,
            userId: request.user.userId,
            activityType: 'meeting_joined',
            description: `Joined meeting "${meeting.title}"`,
            relatedId: meeting._id
        });
        await activity.save();

        response.status(200).json({ 
            message: "Successfully joined meeting",
            meetingLink: meeting.meetingLink
        });
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllMeetings,
    getMeetingsByTeam,
    getMyMeetings,
    getMeetingById,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    joinMeeting
};
