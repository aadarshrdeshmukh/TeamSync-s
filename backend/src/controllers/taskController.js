const Task = require('../models/Task');
const Team = require('../models/Team');
const Activity = require('../models/Activity');

// Get all tasks
const getAllTasks = async (request, response) => {
    try {
        const tasks = await Task.find({})
            .populate('teamId', 'name')
            .populate('assignedTo', 'name email username')
            .populate('createdBy', 'name email username');
        
        response.status(200).json(tasks);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Get tasks by team
const getTasksByTeam = async (request, response) => {
    try {
        const tasks = await Task.find({ teamId: request.params.teamId })
            .populate('teamId', 'name')
            .populate('assignedTo', 'name email username')
            .populate('createdBy', 'name email username');
        
        response.status(200).json(tasks);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Get tasks for current user (assigned tasks + team tasks)
const getMyTasks = async (request, response) => {
    try {
        // First, find all teams where the user is a member
        const userTeams = await Team.find({
            'members.userId': request.user.userId
        }).select('_id');
        
        const teamIds = userTeams.map(team => team._id);
        
        // Find tasks that are either:
        // 1. Assigned to the user, OR
        // 2. Belong to teams where the user is a member
        const tasks = await Task.find({
            $or: [
                { assignedTo: request.user.userId },
                { teamId: { $in: teamIds } }
            ]
        })
            .populate('teamId', 'name')
            .populate('assignedTo', 'name email username')
            .populate('createdBy', 'name email username')
            .sort({ createdAt: -1 });
        
        response.status(200).json(tasks);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Get task by ID
const getTaskById = async (request, response) => {
    try {
        const task = await Task.findById(request.params.id)
            .populate('teamId', 'name')
            .populate('assignedTo', 'name email username')
            .populate('createdBy', 'name email username');
        
        if (!task) {
            return response.status(404).json({ message: "Task not found" });
        }
        
        response.status(200).json(task);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Create new task
const createTask = async (request, response) => {
    try {
        const { title, description, teamId, assignedTo, priority, deadline, tags } = request.body;

        if (!title || !description || !teamId || !deadline) {
            return response.status(400).json({ message: "Title, description, team, and deadline are required" });
        }

        // Check if team exists
        const team = await Team.findById(teamId);
        if (!team) {
            return response.status(404).json({ message: "Team not found" });
        }

        // Check if user is team lead, creator, or admin (members cannot create tasks)
        const isCreator = team.createdBy.toString() === request.user.userId.toString();
        const isLead = team.members.some(m => 
            m.userId.toString() === request.user.userId.toString() && m.role === 'LEAD'
        );

        if (!isCreator && !isLead && request.user.role !== 'ADMIN') {
            return response.status(403).json({ message: "Access denied. Only team leads or admins can create tasks" });
        }

        // Only leads and admins can assign tasks to others
        let taskAssignedTo = null;
        if (assignedTo) {
            const canAssign = isLead || request.user.role === 'ADMIN';
            if (!canAssign) {
                return response.status(403).json({ message: "Access denied. Only team leads or admins can assign tasks to others" });
            }
            taskAssignedTo = assignedTo;
        }

        const newTask = new Task({
            title,
            description,
            teamId,
            assignedTo: taskAssignedTo,
            createdBy: request.user.userId,
            priority: priority || 'medium',
            deadline,
            tags: tags || []
        });

        await newTask.save();

        // Log activity
        const activity = new Activity({
            teamId,
            userId: request.user.userId,
            activityType: 'task_created',
            description: `Task "${title}" was created`,
            relatedId: newTask._id
        });
        await activity.save();

        const populatedTask = await Task.findById(newTask._id)
            .populate('teamId', 'name')
            .populate('assignedTo', 'name email username')
            .populate('createdBy', 'name email username');

        response.status(201).json({ 
            message: "Task created successfully", 
            data: populatedTask 
        });

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Update task
const updateTask = async (request, response) => {
    try {
        const { title, description, assignedTo, status, priority, deadline, tags } = request.body;

        const task = await Task.findById(request.params.id);
        if (!task) {
            return response.status(404).json({ message: "Task not found" });
        }

        // Check if user is task creator or assigned user or team lead
        const team = await Team.findById(task.teamId);
        const isCreator = task.createdBy.toString() === request.user.userId.toString();
        const isAssigned = task.assignedTo && task.assignedTo.toString() === request.user.userId.toString();
        const isLead = team && team.members && team.members.some(m => 
            m.userId.toString() === request.user.userId.toString() && m.role === 'LEAD'
        );

        if (!isCreator && !isAssigned && !isLead && request.user.role !== 'ADMIN') {
            return response.status(403).json({ message: "Access denied. You cannot update this task" });
        }

        // Check assignment permissions
        if (assignedTo !== undefined) {
            const canAssign = isLead || request.user.role === 'ADMIN';
            if (!canAssign) {
                return response.status(403).json({ message: "Access denied. Only team leads or admins can assign tasks to others" });
            }
            task.assignedTo = assignedTo;
        }

        if (title) task.title = title;
        if (description) task.description = description;
        if (status) task.status = status;
        if (priority) task.priority = priority;
        if (deadline) task.deadline = deadline;
        if (tags) task.tags = tags;
        task.updatedAt = Date.now();

        await task.save();

        // Log activity
        const activityType = status === 'completed' ? 'task_completed' : 'task_updated';
        const activity = new Activity({
            teamId: task.teamId,
            userId: request.user.userId,
            activityType,
            description: `Task "${task.title}" was updated`,
            relatedId: task._id
        });
        await activity.save();

        const updatedTask = await Task.findById(task._id)
            .populate('teamId', 'name')
            .populate('assignedTo', 'name email username')
            .populate('createdBy', 'name email username');

        response.status(200).json({ 
            message: "Task updated successfully", 
            data: updatedTask 
        });

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Delete task
const deleteTask = async (request, response) => {
    try {
        const task = await Task.findById(request.params.id);
        if (!task) {
            return response.status(404).json({ message: "Task not found" });
        }

        // Check if user is task creator or team lead or admin
        const team = await Team.findById(task.teamId);
        const isCreator = task.createdBy.toString() === request.user.userId.toString();
        const isLead = team && team.members && team.members.some(m => 
            m.userId.toString() === request.user.userId.toString() && m.role === 'LEAD'
        );

        if (!isCreator && !isLead && request.user.role !== 'ADMIN') {
            return response.status(403).json({ message: "Access denied. Only task creator, team lead, or admin can delete" });
        }

        await Task.findByIdAndDelete(request.params.id);

        response.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllTasks,
    getTasksByTeam,
    getMyTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};
