const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create demo users
    const users = [
      {
        name: 'System Admin',
        username: 'admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('password', 10),
        role: 'ADMIN'
      },
      {
        name: 'Team Lead',
        username: 'lead',
        email: 'lead@example.com',
        password: await bcrypt.hash('password', 10),
        role: 'LEAD'
      },
      {
        name: 'Team Member',
        username: 'member',
        email: 'member@example.com',
        password: await bcrypt.hash('password', 10),
        role: 'MEMBER'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} demo users`);
    
    createdUsers.forEach(user => {
      console.log(`   - ${user.role}: ${user.email} / password`);
    });

    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

module.exports = { seedUsers };