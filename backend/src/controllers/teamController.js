const Team = require('../models/Team');
const User = require('../models/User');
const Activity = require('../models/Activity');

// Get all teams
const getAllTeams = async (request, response) => {
    try {
        const teams = await Team.find({})
            .populate('createdBy', 'name email username')
            .populate('members.userId', 'name email username');
        
        response.status(200).json(teams);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Get teams for current user
const getMyTeams = async (request, response) => {
    try {
        let teams;
        
        // Admin users can see all teams
        if (request.user.role === 'ADMIN') {
            teams = await Team.find({})
                .populate('createdBy', 'name email username')
                .populate('members.userId', 'name email username');
        } else {
            // Regular users only see teams they're part of
            teams = await Team.find({
                $or: [
                    { createdBy: request.user.userId },
                    { 'members.userId': request.user.userId }
                ]
            })
            .populate('createdBy', 'name email username')
            .populate('members.userId', 'name email username');
        }
        
        response.status(200).json(teams);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Get team by ID
const getTeamById = async (request, response) => {
    try {
        const team = await Team.findById(request.params.id)
            .populate('createdBy', 'name email username')
            .populate('members.userId', 'name email username');
        
        if (!team) {
            return response.status(404).json({ message: "Team not found" });
        }
        
        response.status(200).json(team);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Create new team
const createTeam = async (request, response) => {
    try {
        const { name, description, leadId } = request.body;

        if (!name || !description) {
            return response.status(400).json({ message: "Name and description are required" });
        }

        // Determine who will be the team lead
        let teamLeadId = request.user.userId; // Default to current user (admin)
        let teamCreatedBy = request.user.userId;

        // If leadId is provided and user is admin, use the specified lead
        if (leadId && request.user.role === 'ADMIN') {
            // Verify the specified lead exists and has LEAD role
            const leadUser = await User.findById(leadId);
            if (!leadUser) {
                return response.status(404).json({ message: "Specified team lead not found" });
            }
            if (leadUser.role !== 'LEAD') {
                return response.status(400).json({ message: "Specified user is not a team lead" });
            }
            teamLeadId = leadId;
            teamCreatedBy = leadId; // Set the lead as the creator
        } else if (!leadId && request.user.role === 'ADMIN') {
            // If no lead specified and user is admin, admin becomes temporary lead
            // This can be changed later by adding the actual lead and removing admin
            teamLeadId = request.user.userId;
            teamCreatedBy = request.user.userId;
        }

        const newTeam = new Team({
            name,
            description,
            createdBy: teamCreatedBy,
            members: [{
                userId: teamLeadId,
                role: 'LEAD'
            }]
        });

        await newTeam.save();

        // Add team to the team lead's teams
        await User.findByIdAndUpdate(teamLeadId, {
            $push: { teams: newTeam._id }
        });

        // Log activity
        const activity = new Activity({
            teamId: newTeam._id,
            userId: request.user.userId,
            activityType: 'team_created',
            description: `Team "${name}" was created`,
            relatedId: newTeam._id
        });
        await activity.save();

        const populatedTeam = await Team.findById(newTeam._id)
            .populate('createdBy', 'name email username')
            .populate('members.userId', 'name email username');

        response.status(201).json({ 
            message: "Team created successfully", 
            data: populatedTeam 
        });

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Update team
const updateTeam = async (request, response) => {
    try {
        const { name, description, status } = request.body;

        const team = await Team.findById(request.params.id);
        if (!team) {
            return response.status(404).json({ message: "Team not found" });
        }

        // Check if user is team creator or admin
        if (team.createdBy.toString() !== request.user.userId.toString() && request.user.role !== 'ADMIN') {
            return response.status(403).json({ message: "Access denied. Only team creator or admin can update" });
        }

        if (name) team.name = name;
        if (description) team.description = description;
        if (status) team.status = status;

        await team.save();

        const updatedTeam = await Team.findById(team._id)
            .populate('createdBy', 'name email username')
            .populate('members.userId', 'name email username');

        response.status(200).json({ 
            message: "Team updated successfully", 
            data: updatedTeam 
        });

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Delete team
const deleteTeam = async (request, response) => {
    try {
        const team = await Team.findById(request.params.id);
        if (!team) {
            return response.status(404).json({ message: "Team not found" });
        }

        // Check if user is team creator or admin
        if (team.createdBy.toString() !== request.user.userId.toString() && request.user.role !== 'ADMIN') {
            return response.status(403).json({ message: "Access denied. Only team creator or admin can delete" });
        }

        // Remove team from all members
        await User.updateMany(
            { teams: team._id },
            { $pull: { teams: team._id } }
        );

        await Team.findByIdAndDelete(request.params.id);

        response.status(200).json({ message: "Team deleted successfully" });
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Add member to team
const addMember = async (request, response) => {
    try {
        const { userId, role } = request.body;
        const teamId = request.params.id;

        if (!userId) {
            return response.status(400).json({ message: "User ID is required" });
        }

        const team = await Team.findById(teamId);
        if (!team) {
            return response.status(404).json({ message: "Team not found" });
        }

        // Check if user is team creator or lead
        const isCreator = team.createdBy.toString() === request.user.userId.toString();
        const isLead = team.members.some(m => 
            m.userId.toString() === request.user.userId.toString() && m.role === 'LEAD'
        );

        if (!isCreator && !isLead && request.user.role !== 'ADMIN') {
            return response.status(403).json({ message: "Access denied. Only team lead or admin can add members" });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        // Check if user is already a member
        const isMember = team.members.some(m => m.userId.toString() === userId);
        if (isMember) {
            return response.status(400).json({ message: "User is already a member of this team" });
        }

        // Add member to team
        team.members.push({
            userId,
            role: role || 'MEMBER'
        });
        await team.save();

        // Add team to user's teams
        await User.findByIdAndUpdate(userId, {
            $push: { teams: teamId }
        });

        // Log activity
        const activity = new Activity({
            teamId,
            userId: request.user.userId,
            activityType: 'member_added',
            description: `${user.name} was added to the team`,
            relatedId: userId
        });
        await activity.save();

        const updatedTeam = await Team.findById(teamId)
            .populate('createdBy', 'name email username')
            .populate('members.userId', 'name email username');

        response.status(200).json({ 
            message: "Member added successfully", 
            data: updatedTeam 
        });

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Remove member from team
const removeMember = async (request, response) => {
    try {
        const { userId } = request.body;
        const teamId = request.params.id;

        if (!userId) {
            return response.status(400).json({ message: "User ID is required" });
        }

        const team = await Team.findById(teamId);
        if (!team) {
            return response.status(404).json({ message: "Team not found" });
        }

        // Check if user is team creator or lead
        const isCreator = team.createdBy.toString() === request.user.userId.toString();
        const isLead = team.members.some(m => 
            m.userId.toString() === request.user.userId.toString() && m.role === 'LEAD'
        );

        if (!isCreator && !isLead && request.user.role !== 'ADMIN') {
            return response.status(403).json({ message: "Access denied. Only team lead or admin can remove members" });
        }

        // Cannot remove team creator
        if (team.createdBy.toString() === userId) {
            return response.status(400).json({ message: "Cannot remove team creator" });
        }

        // Remove member from team
        team.members = team.members.filter(m => m.userId.toString() !== userId);
        await team.save();

        // Remove team from user's teams
        await User.findByIdAndUpdate(userId, {
            $pull: { teams: teamId }
        });

        // Log activity
        const user = await User.findById(userId);
        const activity = new Activity({
            teamId,
            userId: request.user.userId,
            activityType: 'member_removed',
            description: `${user.name} was removed from the team`,
            relatedId: userId
        });
        await activity.save();

        const updatedTeam = await Team.findById(teamId)
            .populate('createdBy', 'name email username')
            .populate('members.userId', 'name email username');

        response.status(200).json({ 
            message: "Member removed successfully", 
            data: updatedTeam 
        });

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Transfer team leadership
const transferLeadership = async (request, response) => {
    try {
        const { newLeadId } = request.body;
        const teamId = request.params.id;

        if (!newLeadId) {
            return response.status(400).json({ message: "New lead ID is required" });
        }

        const team = await Team.findById(teamId);
        if (!team) {
            return response.status(404).json({ message: "Team not found" });
        }

        // Check if user is team creator or admin
        const isCreator = team.createdBy.toString() === request.user.userId.toString();
        if (!isCreator && request.user.role !== 'ADMIN') {
            return response.status(403).json({ message: "Access denied. Only team creator or admin can transfer leadership" });
        }

        // Verify new lead exists and has LEAD role
        const newLead = await User.findById(newLeadId);
        if (!newLead) {
            return response.status(404).json({ message: "New team lead not found" });
        }
        if (newLead.role !== 'LEAD') {
            return response.status(400).json({ message: "User is not a team lead" });
        }

        // Update current lead to member (if they exist in members)
        const currentLeadIndex = team.members.findIndex(m => m.role === 'LEAD');
        if (currentLeadIndex !== -1) {
            team.members[currentLeadIndex].role = 'MEMBER';
        }

        // Check if new lead is already a member
        const newLeadIndex = team.members.findIndex(m => m.userId.toString() === newLeadId);
        if (newLeadIndex !== -1) {
            // Update existing member to lead
            team.members[newLeadIndex].role = 'LEAD';
        } else {
            // Add new lead as member
            team.members.push({
                userId: newLeadId,
                role: 'LEAD'
            });
            // Add team to new lead's teams
            await User.findByIdAndUpdate(newLeadId, {
                $push: { teams: teamId }
            });
        }

        // Update team creator
        team.createdBy = newLeadId;
        await team.save();

        // Log activity
        const activity = new Activity({
            teamId,
            userId: request.user.userId,
            activityType: 'leadership_transferred',
            description: `Team leadership transferred to ${newLead.name}`,
            relatedId: newLeadId
        });
        await activity.save();

        const updatedTeam = await Team.findById(teamId)
            .populate('createdBy', 'name email username')
            .populate('members.userId', 'name email username');

        response.status(200).json({ 
            message: "Team leadership transferred successfully", 
            data: updatedTeam 
        });

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllTeams,
    getMyTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
    addMember,
    removeMember,
    transferLeadership
};
