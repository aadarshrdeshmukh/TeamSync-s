const mongoose = require('mongoose');

const userSchema = {
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["ADMIN", "LEAD", "MEMBER"],
        default: "MEMBER"
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    profilePicture: {
        type: String,
        default: ""
    },
    teams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
