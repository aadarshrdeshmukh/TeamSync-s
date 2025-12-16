const Activity = require('../models/Activity');
const Team = require('../models/Team');

// Get all activities (Admin only)
const getAllActivities = async (request, response) => {
    try {
        const activities = await Activity.find({})
            .populate('teamId', 'name')
            .populate('userId', 'name email username')
            .sort({ createdAt: -1 })
            .limit(100); // Limit to recent 100 activities
        
        response.status(200).json(activities);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Get activities for current user (based on their teams)
const getMyActivities = async (request, response) => {
    try {
        let activities = [];

        if (request.user.role === 'ADMIN') {
            // Admins can see all activities
            activities = await Activity.find({})
                .populate('teamId', 'name')
                .populate('userId', 'name email username')
                .sort({ createdAt: -1 })
                .limit(100);
        } else {
            // Find teams where user is a member
            const userTeams = await Team.find({
                'members.userId': request.user.userId
            }).select('_id');
            
            const teamIds = userTeams.map(team => team._id);
            
            // Get activities from user's teams
            activities = await Activity.find({
                teamId: { $in: teamIds }
            })
                .populate('teamId', 'name')
                .populate('userId', 'name email username')
                .sort({ createdAt: -1 })
                .limit(100);
        }
        
        response.status(200).json(activities);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Get activities by team
const getActivitiesByTeam = async (request, response) => {
    try {
        const teamId = request.params.teamId;
        
        // Check if user has access to this team
        if (request.user.role !== 'ADMIN') {
            const team = await Team.findOne({
                _id: teamId,
                'members.userId': request.user.userId
            });
            
            if (!team) {
                return response.status(403).json({ message: "Access denied. You are not a member of this team." });
            }
        }

        const activities = await Activity.find({ teamId })
            .populate('teamId', 'name')
            .populate('userId', 'name email username')
            .sort({ createdAt: -1 })
            .limit(50);
        
        response.status(200).json(activities);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Get productivity report for team (Admin only)
const getTeamReport = async (request, response) => {
    try {
        const teamId = request.params.teamId;

        // Check if team exists
        const team = await Team.findById(teamId)
            .populate('members.userId', 'name email username');
        
        if (!team) {
            return response.status(404).json({ message: "Team not found" });
        }

        // Get activities count by type
        const activities = await Activity.find({ teamId });
        
        const activityStats = {
            tasksCreated: activities.filter(a => a.activityType === 'task_created').length,
            tasksCompleted: activities.filter(a => a.activityType === 'task_completed').length,
            meetingsScheduled: activities.filter(a => a.activityType === 'meeting_scheduled').length,
            filesUploaded: activities.filter(a => a.activityType === 'file_uploaded').length,
            totalActivities: activities.length
        };

        // Get member activity count
        const memberStats = team.members.map(member => {
            const memberActivities = activities.filter(
                a => a.userId.toString() === member.userId._id.toString()
            );
            return {
                member: member.userId,
                role: member.role,
                activityCount: memberActivities.length
            };
        });

        response.status(200).json({
            team: {
                id: team._id,
                name: team.name,
                memberCount: team.members.length
            },
            activityStats,
            memberStats,
            recentActivities: activities.slice(0, 10)
        });

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllActivities,
    getMyActivities,
    getActivitiesByTeam,
    getTeamReport
};
