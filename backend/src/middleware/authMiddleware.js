const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_CONFIG } = require('../config/auth');

// Middleware to verify JWT token
const verifyToken = async (request, response, next) => {
    try {
        const token = request.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return response.status(401).json({ message: "Access denied. No token provided" });
        }

        const decoded = jwt.verify(token, JWT_CONFIG.secret);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return response.status(401).json({ message: "Invalid token. User not found" });
        }

        request.user = {
            userId: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        response.status(401).json({ message: "Invalid token", error: error.message });
    }
};

module.exports = {
    verifyToken
};