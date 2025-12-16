const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_CONFIG, PASSWORD_CONFIG } = require('../config/auth');

// Register new user
const register = async (request, response) => {
    try {
        const { name, username, email, password, role } = request.body;

        if (!name || !username || !email || !password) {
            return response.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return response.status(400).json({ message: "User already exists with this email or username" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, PASSWORD_CONFIG.saltRounds);

        // Create new user
        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword,
            role: role || 'MEMBER'
        });

        await newUser.save();

        response.status(201).json({ 
            message: "User registered successfully", 
            data: {
                userId: newUser._id,
                name: newUser.name,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Login user
const login = async (request, response) => {
    try {
        const { email, password } = request.body;

        if (!email || !password) {
            return response.status(400).json({ message: "Email and password are required" });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return response.status(401).json({ message: "Invalid credentials" });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return response.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_CONFIG.secret,
            { expiresIn: JWT_CONFIG.expiresIn }
        );

        response.status(200).json({
            message: "Login successful",
            token,
            user: {
                userId: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Get current user profile
const getProfile = async (request, response) => {
    try {
        const user = await User.findById(request.user.userId).select('-password').populate('teams');
        
        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        response.status(200).json(user);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

// Update user profile
const updateProfile = async (request, response) => {
    try {
        const { name, profilePicture } = request.body;

        const user = await User.findById(request.user.userId);
        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        if (name) user.name = name;
        if (profilePicture) user.profilePicture = profilePicture;

        await user.save();

        response.status(200).json({ 
            message: "Profile updated successfully", 
            data: {
                userId: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture
            }
        });

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile
};
