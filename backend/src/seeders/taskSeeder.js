const Task = require('../models/Task');
const Team = require('../models/Team');
const User = require('../models/User');

const seedTasks = async () => {
  try {
    // Clear existing tasks
    await Task.deleteMany({});
    console.log('🗑️  Cleared existing tasks');

    // Get users and create a team first
    const admin = await User.findOne({ role: 'ADMIN' });
    const lead = await User.findOne({ role: 'LEAD' });
    const member = await User.findOne({ role: 'MEMBER' });

    if (!admin || !lead || !member) {
      console.log('❌ Users not found. Please run user seeder first.');
      return;
    }

    // Create a test team
    await Team.deleteMany({});
    const team = new Team({
      name: 'Development Team',
      description: 'Main development team for the project',
      createdBy: lead._id,
      members: [
        { userId: lead._id, role: 'LEAD' },
        { userId: member._id, role: 'MEMBER' }
      ]
    });
    await team.save();

    // Update users with team reference
    await User.findByIdAndUpdate(lead._id, { $push: { teams: team._id } });
    await User.findByIdAndUpdate(member._id, { $push: { teams: team._id } });
    // Note: Admin users have system-wide access and don't need to be team members

    // Create test tasks
    const tasks = [
      {
        title: 'Setup Project Repository',
        description: 'Initialize the project repository with proper structure and documentation',
        teamId: team._id,
        createdBy: lead._id,
        assignedTo: member._id,
        status: 'todo',
        priority: 'high',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        tags: ['setup', 'repository']
      },
      {
        title: 'Design Database Schema',
        description: 'Create the database schema for user management and task tracking',
        teamId: team._id,
        createdBy: lead._id,
        assignedTo: lead._id,
        status: 'in-progress',
        priority: 'high',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        tags: ['database', 'design']
      },
      {
        title: 'Implement Authentication',
        description: 'Build JWT-based authentication system with role-based access control',
        teamId: team._id,
        createdBy: lead._id,
        assignedTo: member._id,
        status: 'review',
        priority: 'medium',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        tags: ['auth', 'security']
      },
      {
        title: 'Create Landing Page',
        description: 'Design and implement the landing page with modern UI',
        teamId: team._id,
        createdBy: lead._id,
        assignedTo: member._id,
        status: 'completed',
        priority: 'low',
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        tags: ['frontend', 'ui']
      },
      {
        title: 'Setup CI/CD Pipeline',
        description: 'Configure automated testing and deployment pipeline',
        teamId: team._id,
        createdBy: lead._id,
        status: 'todo',
        priority: 'medium',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        tags: ['devops', 'automation']
      },
      {
        title: 'Write API Documentation',
        description: 'Document all API endpoints with examples and usage guidelines',
        teamId: team._id,
        createdBy: lead._id,
        assignedTo: member._id,
        status: 'in-progress',
        priority: 'low',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        tags: ['documentation', 'api']
      }
    ];

    const createdTasks = await Task.insertMany(tasks);
    console.log(`✅ Created ${createdTasks.length} test tasks`);
    console.log(`📋 Team: ${team.name} (ID: ${team._id})`);

    // Create a test meeting that can be joined immediately
    const Meeting = require('../models/Meeting');
    await Meeting.deleteMany({});
    
    const testMeeting = new Meeting({
      title: 'Test Video Conference',
      description: 'Demo meeting to test the video call feature',
      teamId: team._id,
      organizer: lead._id,
      participants: [lead._id, member._id],
      scheduledAt: new Date(), // Current time - can join immediately
      duration: 60,
      meetingLink: `https://teamsync.meet/${Date.now()}-demo-meeting`
    });
    
    await testMeeting.save();
    console.log(`🎥 Created test meeting: ${testMeeting.title} (ID: ${testMeeting._id})`);
    console.log(`📱 Meeting can be joined at: http://localhost:3001/meeting/${testMeeting._id}`);
    
    return { tasks: createdTasks, team, meeting: testMeeting };
  } catch (error) {
    console.error('❌ Error seeding tasks:', error);
    throw error;
  }
};

module.exports = { seedTasks };