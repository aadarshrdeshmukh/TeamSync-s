const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../src/models/User');
const Team = require('../../src/models/Team');
const { JWT_CONFIG } = require('../../src/config/auth');

// Create test user
const createTestUser = async (userData = {}) => {
  const defaultUser = {
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    password: await bcrypt.hash('password123', 10),
    role: 'MEMBER'
  };

  const user = new User({ ...defaultUser, ...userData });
  await user.save();
  return user;
};

// Create test admin user
const createTestAdmin = async () => {
  return createTestUser({
    name: 'Admin User',
    username: 'admin',
    email: 'admin@example.com',
    role: 'ADMIN'
  });
};

// Create test lead user
const createTestLead = async () => {
  return createTestUser({
    name: 'Lead User',
    username: 'lead',
    email: 'lead@example.com',
    role: 'LEAD'
  });
};

// Generate JWT token for user
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    JWT_CONFIG.secret,
    { expiresIn: JWT_CONFIG.expiresIn }
  );
};

// Create test team
const createTestTeam = async (createdBy, teamData = {}) => {
  const defaultTeam = {
    name: 'Test Team',
    description: 'Test team description',
    createdBy: createdBy._id,
    members: [{
      userId: createdBy._id,
      role: 'LEAD'
    }]
  };

  const team = new Team({ ...defaultTeam, ...teamData });
  await team.save();
  
  // Add team to user's teams
  await User.findByIdAndUpdate(createdBy._id, {
    $push: { teams: team._id }
  });
  
  return team;
};

module.exports = {
  createTestUser,
  createTestAdmin,
  createTestLead,
  generateToken,
  createTestTeam
};