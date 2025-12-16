const User = require('../models/User');
const Team = require('../models/Team');

// Get users that the current user can assign tasks to
const getAssignableUsers = async (request, response) => {
    try {
        let users = [];

        if (request.user.role === 'ADMIN') {
            // Admins can see all users
            users = await User.find({})
                .select('-password')
                .sort({ name: 1 });
        } else if (request.user.role === 'LEAD') {
            // Leads can see users from their teams
            const userTeams = await Team.find({
                'members.userId': request.user.userId,
                'members.role': 'LEAD'
            }).populate('members.userId', 'name email username role');

            // Extract unique user IDs from all teams where current user is a lead
            const userIds = new Set();
            userTeams.forEach(team => {
                team.members.forEach(member => {
                    userIds.add(member.userId._id.toString());
                });
            });

            // Get user details for all team members
            users = await User.find({
                _id: { $in: Array.from(userIds) }
            }).select('-password').sort({ name: 1 });
        } else {
            // Members can only see themselves
            users = await User.find({ _id: request.user.userId })
                .select('-password');
        }

        response.status(200).json(users);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Get current user profile
const getProfile = async (request, response) => {
    try {
        const user = await User.findById(request.user.userId)
            .select('-password')
            .populate('teams', 'name description');
        
        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }
        
        response.status(200).json(user);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAssignableUsers,
    getProfile
};