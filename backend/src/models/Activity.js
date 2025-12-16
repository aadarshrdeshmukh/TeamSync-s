const mongoose = require('mongoose');

const activitySchema = {
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    activityType: {
        type: String,
        enum: ['task_created', 'task_updated', 'task_completed', 'meeting_scheduled', 'file_uploaded', 'member_added', 'member_removed', 'team_created', 'leadership_transferred'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
};

const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;
