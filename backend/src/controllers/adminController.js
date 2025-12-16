const User = require('../models/User');
const Team = require('../models/Team');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const bcrypt = require('bcryptjs');
const { PASSWORD_CONFIG } = require('../config/auth');

// Get system-wide dashboard stats (Admin only)
const getDashboardStats = async (request, response) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalTeams = await Team.countDocuments();
        const totalTasks = await Task.countDocuments();
        const completedTasks = await Task.countDocuments({ status: 'completed' });
        const activeTasks = await Task.countDocuments({ 
            status: { $in: ['todo', 'in-progress', 'review'] } 
        });

        // Recent activity
        const recentActivities = await Activity.find({})
            .populate('teamId', 'name')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(10);

        // Team performance
        const teams = await Team.find({})
            .populate('createdBy', 'name email')
            .populate('members.userId', 'name email');

        const teamStats = await Promise.all(teams.map(async (team) => {
            const teamTasks = await Task.countDocuments({ teamId: team._id });
            const completedTeamTasks = await Task.countDocuments({ 
                teamId: team._id, 
                status: 'completed' 
            });
            
            return {
                teamId: team._id,
                teamName: team.name,
                memberCount: team.members.length,
                totalTasks: teamTasks,
                completedTasks: completedTeamTasks,
                completionRate: teamTasks > 0 ? (completedTeamTasks / teamTasks * 100).toFixed(1) : 0
            };
        }));

        response.status(200).json({
            overview: {
                totalUsers,
                totalTeams,
                totalTasks,
                completedTasks,
                activeTasks,
                systemCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0
            },
            recentActivities,
            teamPerformance: teamStats
        });

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Get all users with role management (Admin only)
const getAllUsers = async (request, response) => {
    try {
        const users = await User.find({})
            .select('-password')
            .populate('teams', 'name')
            .sort({ createdAt: -1 });

        response.status(200).json(users);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Update user role (Admin only)
const updateUserRole = async (request, response) => {
    try {
        const { userId } = request.params;
        const { role } = request.body;

        if (!['ADMIN', 'LEAD', 'MEMBER'].includes(role)) {
            return response.status(400).json({ message: "Invalid role. Must be ADMIN, LEAD, or MEMBER" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        // Prevent admin from demoting themselves
        if (user._id.toString() === request.user.userId.toString() && role !== 'ADMIN') {
            return response.status(400).json({ message: "Cannot change your own admin role" });
        }

        user.role = role;
        await user.save();

        response.status(200).json({ 
            message: "User role updated successfully. The user will need to log in again to access their new role.", 
            user: {
                userId: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            requiresReauth: true // Flag to indicate user needs to re-authenticate
        });

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Deactivate user (Admin only)
const deactivateUser = async (request, response) => {
    try {
        const { userId } = request.params;

        const user = await User.findById(userId);
        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        // Prevent admin from deactivating themselves
        if (user._id.toString() === request.user.userId.toString()) {
            return response.status(400).json({ message: "Cannot deactivate your own account" });
        }

        // Remove user from all teams
        await Team.updateMany(
            { 'members.userId': userId },
            { $pull: { members: { userId: userId } } }
        );

        // Update user's teams array and set status
        user.teams = [];
        user.status = 'inactive';
        await user.save();

        response.status(200).json({ message: "User deactivated successfully" });
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Activate user (Admin only)
const activateUser = async (request, response) => {
    try {
        const { userId } = request.params;

        const user = await User.findById(userId);
        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        // Set user status to active
        user.status = 'active';
        await user.save();

        response.status(200).json({ message: "User activated successfully" });
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Create new user (Admin only)
const createUser = async (request, response) => {
    try {
        const { name, email, username, password, role } = request.body;

        // Validation
        if (!name || !email || !username || !password || !role) {
            return response.status(400).json({ 
                message: "All fields are required: name, email, username, password, role" 
            });
        }

        if (!['ADMIN', 'LEAD', 'MEMBER'].includes(role)) {
            return response.status(400).json({ 
                message: "Invalid role. Must be ADMIN, LEAD, or MEMBER" 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return response.status(400).json({ 
                message: "User with this email or username already exists" 
            });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, PASSWORD_CONFIG.saltRounds);

        // Create new user
        const newUser = new User({
            name,
            email,
            username,
            password: hashedPassword, // Now properly hashed
            role,
            status: 'active'
        });

        await newUser.save();

        // Return user without password
        const userResponse = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            username: newUser.username,
            role: newUser.role,
            status: newUser.status,
            createdAt: newUser.createdAt
        };

        response.status(201).json({ 
            message: "User created successfully", 
            user: userResponse 
        });

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// System-wide productivity report (Admin only)
const getSystemReport = async (request, response) => {
    try {
        const { startDate, endDate } = request.query;
        
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        // Task statistics
        const taskStats = await Task.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Activity statistics
        const activityStats = await Activity.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$activityType',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Team productivity
        const teamProductivity = await Team.aggregate([
            {
                $lookup: {
                    from: 'tasks',
                    localField: '_id',
                    foreignField: 'teamId',
                    as: 'tasks'
                }
            },
            {
                $project: {
                    name: 1,
                    memberCount: { $size: '$members' },
                    totalTasks: { $size: '$tasks' },
                    completedTasks: {
                        $size: {
                            $filter: {
                                input: '$tasks',
                                cond: { $eq: ['$$this.status', 'completed'] }
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    completionRate: {
                        $cond: {
                            if: { $gt: ['$totalTasks', 0] },
                            then: { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
                            else: 0
                        }
                    }
                }
            }
        ]);

        response.status(200).json({
            period: { startDate, endDate },
            taskStatistics: taskStats,
            activityStatistics: activityStats,
            teamProductivity
        });

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    updateUserRole,
    deactivateUser,
    activateUser,
    createUser,
    getSystemReport
};