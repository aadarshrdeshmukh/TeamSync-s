const request = require('supertest');
const express = require('express');

// Import models and routes
const User = require('../src/models/User');
const Team = require('../src/models/Team');
const Task = require('../src/models/Task');
const Meeting = require('../src/models/Meeting');
const File = require('../src/models/File');

const taskRouter = require('../src/routes/taskRouter');
const teamRouter = require('../src/routes/teamRouter');
const meetingRouter = require('../src/routes/meetingRouter');
const fileRouter = require('../src/routes/fileRouter');
const { verifyToken } = require('../src/middleware/authMiddleware');

// Import test helpers
const { createTestUser, createTestTeam, generateToken } = require('./helpers/testHelpers');

// Create test app
const app = express();
app.use(express.json());
app.use(verifyToken);
app.use('/api/tasks', taskRouter);
app.use('/api/teams', teamRouter);
app.use('/api/meetings', meetingRouter);
app.use('/api/files', fileRouter);

beforeEach(async () => {
  await User.deleteMany({});
  await Team.deleteMany({});
  await Task.deleteMany({});
  await Meeting.deleteMany({});
  await File.deleteMany({});
});

describe('MEMBER Role Permissions', () => {
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

  describe('✅ What MEMBER CAN do', () => {
    describe('Tasks', () => {
      it('should NOT allow member to create tasks (moved to restrictions)', async () => {
        const taskData = {
          title: 'Member Created Task',
          description: 'Task created by team member',
          teamId: team._id,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };

        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${memberToken}`)
          .send(taskData)
          .expect(403);

        expect(response.body.message).toBe('Access denied. Only team leads or admins can create tasks');
      });

      it('should allow member to view tasks in their team', async () => {
        const response = await request(app)
          .get('/api/tasks/my-tasks')
          .set('Authorization', `Bearer ${memberToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should allow member to update tasks they created', async () => {
        // Create task as member
        const task = new Task({
          title: 'My Task',
          description: 'Task I created',
          teamId: team._id,
          createdBy: member._id,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        await task.save();

        const response = await request(app)
          .put(`/api/tasks/${task._id}`)
          .set('Authorization', `Bearer ${memberToken}`)
          .send({ status: 'in-progress' })
          .expect(200);

        expect(response.body.data.status).toBe('in-progress');
      });

      it('should allow member to update tasks assigned to them', async () => {
        // Create task assigned to member
        const task = new Task({
          title: 'Assigned Task',
          description: 'Task assigned to member',
          teamId: team._id,
          createdBy: teamLead._id,
          assignedTo: member._id,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        await task.save();

        const response = await request(app)
          .put(`/api/tasks/${task._id}`)
          .set('Authorization', `Bearer ${memberToken}`)
          .send({ status: 'completed' })
          .expect(200);

        expect(response.body.data.status).toBe('completed');
      });
    });

    describe('Meetings', () => {
      it('should NOT allow member to create meetings (moved to restrictions)', async () => {
        const meetingData = {
          title: 'Team Meeting',
          description: 'Weekly team sync',
          teamId: team._id,
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          duration: 60
        };

        const response = await request(app)
          .post('/api/meetings')
          .set('Authorization', `Bearer ${memberToken}`)
          .send(meetingData)
          .expect(403);

        expect(response.body.message).toBe('Access denied. Only team leads or admins can create meetings');
      });
    });

    describe('Files', () => {
      it('should allow member to upload files to their team', async () => {
        const fileData = {
          fileName: 'document.pdf',
          fileUrl: 'https://example.com/document.pdf',
          fileSize: 1024,
          fileType: 'application/pdf',
          teamId: team._id,
          description: 'Team document'
        };

        const response = await request(app)
          .post('/api/files')
          .set('Authorization', `Bearer ${memberToken}`)
          .send(fileData)
          .expect(201);

        expect(response.body.message).toBe('File uploaded successfully');
        expect(response.body.data.uploadedBy._id).toBe(member._id.toString());
      });
    });
  });

  describe('❌ What MEMBER CANNOT do', () => {
    describe('Team Management', () => {
      it('should NOT allow member to add other members to team', async () => {
        const newUser = await createTestUser({
          name: 'New User',
          username: 'newuser',
          email: 'new@example.com'
        });

        const response = await request(app)
          .post(`/api/teams/${team._id}/members`)
          .set('Authorization', `Bearer ${memberToken}`)
          .send({ userId: newUser._id })
          .expect(403);

        expect(response.body.message).toBe('Access denied. Only team lead or admin can add members');
      });

      it('should NOT allow member to remove other members from team', async () => {
        const response = await request(app)
          .delete(`/api/teams/${team._id}/members`)
          .set('Authorization', `Bearer ${memberToken}`)
          .send({ userId: teamLead._id })
          .expect(403);

        expect(response.body.message).toBe('Access denied. Only team lead or admin can remove members');
      });

      it('should NOT allow member to update team details', async () => {
        const response = await request(app)
          .put(`/api/teams/${team._id}`)
          .set('Authorization', `Bearer ${memberToken}`)
          .send({ name: 'Updated Team Name' })
          .expect(403);

        expect(response.body.message).toBe('Access denied. Only team creator or admin can update');
      });

      it('should NOT allow member to delete team', async () => {
        const response = await request(app)
          .delete(`/api/teams/${team._id}`)
          .set('Authorization', `Bearer ${memberToken}`)
          .expect(403);

        expect(response.body.message).toBe('Access denied. Only team creator or admin can delete');
      });
    });

    describe('Task Management Restrictions', () => {
      it('should NOT allow member to assign tasks to others when creating', async () => {
        const taskData = {
          title: 'Task with Assignment',
          description: 'Trying to assign task',
          teamId: team._id,
          assignedTo: teamLead._id,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };

        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${memberToken}`)
          .send(taskData)
          .expect(403);

        expect(response.body.message).toBe('Access denied. Only team leads or admins can create tasks');
      });

      it('should NOT allow member to assign tasks to others when updating', async () => {
        // Create task as member (this will fail now, so create as lead first)
        const task = new Task({
          title: 'Test Task',
          description: 'Task for testing',
          teamId: team._id,
          createdBy: teamLead._id,
          assignedTo: member._id,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        await task.save();

        const response = await request(app)
          .put(`/api/tasks/${task._id}`)
          .set('Authorization', `Bearer ${memberToken}`)
          .send({ assignedTo: teamLead._id })
          .expect(403);

        expect(response.body.message).toBe('Access denied. Only team leads or admins can assign tasks to others');
      });

      it('should NOT allow member to update tasks they did not create or are not assigned to', async () => {
        // Create task by lead, not assigned to member
        const task = new Task({
          title: 'Lead Task',
          description: 'Task created by lead',
          teamId: team._id,
          createdBy: teamLead._id,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        await task.save();

        const response = await request(app)
          .put(`/api/tasks/${task._id}`)
          .set('Authorization', `Bearer ${memberToken}`)
          .send({ status: 'completed' })
          .expect(403);

        expect(response.body.message).toBe('Access denied. You cannot update this task');
      });

      it('should NOT allow member to delete tasks they did not create', async () => {
        // Create task by lead
        const task = new Task({
          title: 'Lead Task',
          description: 'Task created by lead',
          teamId: team._id,
          createdBy: teamLead._id,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        await task.save();

        const response = await request(app)
          .delete(`/api/tasks/${task._id}`)
          .set('Authorization', `Bearer ${memberToken}`)
          .expect(403);

        expect(response.body.message).toBe('Access denied. Only task creator, team lead, or admin can delete');
      });
    });

    describe('Meeting Management Restrictions', () => {
      it('should NOT allow member to create meetings', async () => {
        const meetingData = {
          title: 'Unauthorized Meeting',
          description: 'Member trying to create meeting',
          teamId: team._id,
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          duration: 30
        };

        const response = await request(app)
          .post('/api/meetings')
          .set('Authorization', `Bearer ${memberToken}`)
          .send(meetingData)
          .expect(403);

        expect(response.body.message).toBe('Access denied. Only team leads or admins can create meetings');
      });

      it('should NOT allow member to update meetings they did not organize', async () => {
        // Create meeting organized by lead
        const meeting = new Meeting({
          title: 'Lead Meeting',
          description: 'Meeting organized by lead',
          teamId: team._id,
          organizer: teamLead._id,
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          duration: 30,
          meetingLink: 'https://meet.example.com/lead'
        });
        await meeting.save();

        const response = await request(app)
          .put(`/api/meetings/${meeting._id}`)
          .set('Authorization', `Bearer ${memberToken}`)
          .send({ duration: 45 })
          .expect(403);

        expect(response.body.message).toBe('Access denied. Only organizer, team lead, or admin can update');
      });

      it('should NOT allow member to delete meetings they did not organize', async () => {
        // Create meeting organized by lead
        const meeting = new Meeting({
          title: 'Lead Meeting',
          description: 'Meeting organized by lead',
          teamId: team._id,
          organizer: teamLead._id,
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          duration: 30,
          meetingLink: 'https://meet.example.com/lead'
        });
        await meeting.save();

        const response = await request(app)
          .delete(`/api/meetings/${meeting._id}`)
          .set('Authorization', `Bearer ${memberToken}`)
          .expect(403);

        expect(response.body.message).toBe('Access denied. Only organizer, team lead, or admin can delete');
      });
    });
  });
});