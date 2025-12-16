const request = require('supertest');
const express = require('express');

// Import models and routes
const User = require('../src/models/User');
const Team = require('../src/models/Team');
const Task = require('../src/models/Task');
const Meeting = require('../src/models/Meeting');
const File = require('../src/models/File');

const adminRouter = require('../src/routes/adminRouter');
const teamRouter = require('../src/routes/teamRouter');
const taskRouter = require('../src/routes/taskRouter');
const meetingRouter = require('../src/routes/meetingRouter');
const { verifyToken } = require('../src/middleware/authMiddleware');

// Import test helpers
const { createTestUser, createTestTeam, createTestAdmin, generateToken } = require('./helpers/testHelpers');

// Create test app
const app = express();
app.use(express.json());
app.use(verifyToken);
app.use('/api/admin', adminRouter);
app.use('/api/teams', teamRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/meetings', meetingRouter);

beforeEach(async () => {
  await User.deleteMany({});
  await Team.deleteMany({});
  await Task.deleteMany({});
  await Meeting.deleteMany({});
  await File.deleteMany({});
});

describe('ADMIN Role Permissions Analysis', () => {
  let admin, teamLead, member, team, adminToken, leadToken, memberToken;

  beforeEach(async () => {
    // Create admin
    admin = await createTestAdmin();
    adminToken = generateToken(admin);

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

  describe('✅ Required ADMIN Features', () => {
    describe('Control Entire System', () => {
      it('should allow admin to view system-wide dashboard', async () => {
        const response = await request(app)
          .get('/api/admin/dashboard')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.overview).toBeDefined();
        expect(response.body.overview.totalUsers).toBeDefined();
        expect(response.body.overview.totalTeams).toBeDefined();
        expect(response.body.overview.totalTasks).toBeDefined();
        expect(response.body.teamPerformance).toBeDefined();
      });

      it('should allow admin to view all teams', async () => {
        const response = await request(app)
          .get('/api/teams')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should allow admin to view all tasks', async () => {
        const response = await request(app)
          .get('/api/tasks')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should allow admin to view all activities', async () => {
        const response = await request(app)
          .get('/api/admin/activities')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('User Management', () => {
      it('should allow admin to view all users', async () => {
        const response = await request(app)
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });

      it('should allow admin to change user roles', async () => {
        const response = await request(app)
          .put(`/api/admin/users/${member._id}/role`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ role: 'LEAD' })
          .expect(200);

        expect(response.body.message).toBe('User role updated successfully');
        expect(response.body.user.role).toBe('LEAD');
      });

      it('should allow admin to assign team leads', async () => {
        const response = await request(app)
          .put(`/api/admin/users/${member._id}/role`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ role: 'LEAD' })
          .expect(200);

        expect(response.body.user.role).toBe('LEAD');
      });

      it('should allow admin to deactivate users', async () => {
        const response = await request(app)
          .put(`/api/admin/users/${member._id}/deactivate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.message).toBe('User deactivated successfully');
      });

      it('should NOT allow admin to deactivate themselves', async () => {
        const response = await request(app)
          .put(`/api/admin/users/${admin._id}/deactivate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);

        expect(response.body.message).toBe('Cannot deactivate your own account');
      });

      it('should NOT allow admin to demote themselves', async () => {
        const response = await request(app)
          .put(`/api/admin/users/${admin._id}/role`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ role: 'MEMBER' })
          .expect(400);

        expect(response.body.message).toBe('Cannot change your own admin role');
      });
    });

    describe('Team Management', () => {
      it('should allow admin to create teams', async () => {
        const teamData = {
          name: 'Admin Created Team',
          description: 'Team created by admin'
        };

        const response = await request(app)
          .post('/api/teams')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(teamData)
          .expect(201);

        expect(response.body.message).toBe('Team created successfully');
        expect(response.body.data.createdBy._id).toBe(admin._id.toString());
      });

      it('should allow admin to update any team', async () => {
        const response = await request(app)
          .put(`/api/teams/${team._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ name: 'Updated by Admin' })
          .expect(200);

        expect(response.body.data.name).toBe('Updated by Admin');
      });

      it('should allow admin to delete any team', async () => {
        const response = await request(app)
          .delete(`/api/teams/${team._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.message).toBe('Team deleted successfully');
      });
    });

    describe('Analytics & Reports', () => {
      it('should allow admin to view system-wide analytics', async () => {
        const response = await request(app)
          .get('/api/admin/dashboard')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.overview.systemCompletionRate).toBeDefined();
        expect(response.body.teamPerformance).toBeDefined();
      });

      it('should allow admin to generate system reports', async () => {
        const response = await request(app)
          .get('/api/admin/reports/system')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.taskStatistics).toBeDefined();
        expect(response.body.activityStatistics).toBeDefined();
        expect(response.body.teamProductivity).toBeDefined();
      });

      it('should allow admin to view team reports', async () => {
        const response = await request(app)
          .get(`/api/admin/reports/team/${team._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.team).toBeDefined();
        expect(response.body.activityStats).toBeDefined();
      });

      it('should allow admin to monitor productivity', async () => {
        const response = await request(app)
          .get('/api/admin/reports/system?startDate=2024-01-01&endDate=2024-12-31')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.period).toBeDefined();
        expect(response.body.teamProductivity).toBeDefined();
      });

      it('should allow admin to audit activities', async () => {
        const response = await request(app)
          .get('/api/admin/activities')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });
  });

  describe('🔍 ADMIN Override Permissions', () => {
    describe('Task Override', () => {
      it('should allow admin to create tasks in any team', async () => {
        const taskData = {
          title: 'Admin Task',
          description: 'Task created by admin',
          teamId: team._id,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };

        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(taskData)
          .expect(201);

        expect(response.body.message).toBe('Task created successfully');
      });

      it('should allow admin to update any task', async () => {
        // Create task as lead
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
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status: 'completed' })
          .expect(200);

        expect(response.body.data.status).toBe('completed');
      });

      it('should allow admin to delete any task', async () => {
        // Create task as lead
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
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.message).toBe('Task deleted successfully');
      });

      it('should allow admin to assign tasks to anyone', async () => {
        const taskData = {
          title: 'Admin Assigned Task',
          description: 'Task assigned by admin',
          teamId: team._id,
          assignedTo: member._id,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };

        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(taskData)
          .expect(201);

        expect(response.body.data.assignedTo._id).toBe(member._id.toString());
      });
    });

    describe('Meeting Override', () => {
      it('should allow admin to create meetings in any team', async () => {
        const meetingData = {
          title: 'Admin Meeting',
          description: 'Meeting created by admin',
          teamId: team._id,
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          duration: 60
        };

        const response = await request(app)
          .post('/api/meetings')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(meetingData)
          .expect(201);

        expect(response.body.message).toBe('Meeting created successfully');
      });

      it('should allow admin to update any meeting', async () => {
        // Create meeting as lead
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
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ duration: 90 })
          .expect(200);

        expect(response.body.data.duration).toBe(90);
      });

      it('should allow admin to delete any meeting', async () => {
        // Create meeting as lead
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
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.message).toBe('Meeting deleted successfully');
      });
    });
  });

  describe('❌ Access Restrictions for Non-Admins', () => {
    it('should NOT allow LEAD to access admin dashboard', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${leadToken}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin only');
    });

    it('should NOT allow MEMBER to access admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin only');
    });

    it('should NOT allow LEAD to view all teams', async () => {
      const response = await request(app)
        .get('/api/teams')
        .set('Authorization', `Bearer ${leadToken}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin only');
    });

    it('should NOT allow MEMBER to view all tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin only');
    });
  });
});