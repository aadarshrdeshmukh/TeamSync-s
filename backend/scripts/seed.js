require('dotenv').config();
const mongoose = require('mongoose');
const { seedUsers } = require('../src/seeders/userSeeder');
const { seedTasks } = require('../src/seeders/taskSeeder');

const runSeeder = async () => {
  try {
    console.log('🚀 Starting database seeding...');
    
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teamsync';
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Run the seeders
    await seedUsers();
    await seedTasks();

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

runSeeder();