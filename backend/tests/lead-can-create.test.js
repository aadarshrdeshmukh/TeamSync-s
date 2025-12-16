const request = require('supertest');
const express = require('express');

// Import models and routes
const User = require('../src/models/User');
const Team = require('../src/models/Team');
const Task = require('../src/models/Task');
const Meeting = require('../src/models/Meeting');

const taskRouter = require('../src/routes/taskRouter');
const meetingRouter = require('../src/routes/meetingRouter');
const { verifyToken } = require('../src/middleware/authMiddleware');

// Import test helpers
const { createTestUser, createTestTeam, generateToken } = require('./helpers/testHelpers');

// Create test app
const app = express();
app.use(express.json());
app.use(verifyToken);
app.use('/api/tasks', taskRouter);
app.use('/api/meetings', meetingRouter);

beforeEach(async () => {
  await User.deleteMany({});
  await Team.deleteMany({});
  await Task.deleteMany({});
  await Meeting.deleteMany({});
});

describe('LEAD Can Still Create Tasks and Meetings', () => {
  let teamLead, member, team, leadToken, memberToken;

  beforeEach(async () => {
    // Create team lead
    teamLead = await createTestUser({
      name: 'Team Lead',
      username: 'teamlead',
      email: 'lead@example.com',
      role: 'LEAD'
    });
    leadToken = generateToken(teamLead);

    // Create member
    member = await createTestUser({
      name: 'Team Member',
      username: 'member',
      email: 'member@example.com',
      role: 'MEMBER'
    });
    memberToken = generateToken(member);

    // Create team with lead
    team = await createTestTeam(teamLead._id);
    
    // Add member to team
    team.members.push({
      userId: member._id,
      role: 'MEMBER'
    });
    await team.save();
  });

  describe('LEAD Task Creation', () => {
    it('should allow LEAD to create tasks', async () => {
      const taskData = {
        title: 'Lead Created Task',
        description: 'Task created by team lead',
        teamId: team._id,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${leadToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.message).toBe('Task created successfully');
      expect(response.body.data.createdBy._id).toBe(teamLead._id.toString());
    });

    it('should allow LEAD to assign tasks to team members', async () => {
      const taskData = {
        title: 'Assigned Task',
        description: 'Task assigned to member',
        teamId: team._id,
        assignedTo: member._id,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${leadToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.message).toBe('Task created successfully');
      expect(response.body.data.assignedTo._id).toBe(member._id.toString());
    });

    it('should allow LEAD to reassign tasks', async () => {
      // Create task
      const task = new Task({
        title: 'Test Task',
        description: 'Task for reassignment',
        teamId: team._id,
        createdBy: teamLead._id,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      await task.save();

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${leadToken}`)
        .send({ assignedTo: member._id })
        .expect(200);

      expect(response.body.data.assignedTo._id).toBe(member._id.toString());
    });
  });

  describe('LEAD Meeting Creation', () => {
    it('should allow LEAD to create meetings', async () => {
      const meetingData = {
        title: 'Team Meeting',
        description: 'Weekly team sync',
        teamId: team._id,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        duration: 60
      };

      const response = await request(app)
        .post('/api/meetings')
        .set('Authorization', `Bearer ${leadToken}`)
        .send(meetingData)
        .expect(201);

      expect(response.body.message).toBe('Meeting created successfully');
      expect(response.body.data.organizer._id).toBe(teamLead._id.toString());
    });

    it('should allow LEAD to schedule meetings with participants', async () => {
      const meetingData = {
        title: 'Team Meeting with Participants',
        description: 'Meeting with team members',
        teamId: team._id,
        participants: [member._id],
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        duration: 30
      };

      const response = await request(app)
        .post('/api/meetings')
        .set('Authorization', `Bearer ${leadToken}`)
        .send(meetingData)
        .expect(201);

      expect(response.body.message).toBe('Meeting created successfully');
      expect(response.body.data.participants).toHaveLength(1);
      expect(response.body.data.participants[0]._id).toBe(member._id.toString());
    });
  });
});