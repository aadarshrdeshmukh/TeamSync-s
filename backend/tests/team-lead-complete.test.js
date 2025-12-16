const request = require('supertest');
const express = require('express');

// Import models and routes
const User = require('../src/models/User');
const Team = require('../src/models/Team');
const Task = require('../src/models/Task');
const Meeting = require('../src/models/Meeting');
const File = require('../src/models/File');

const teamRouter = require('../src/routes/teamRouter');
const taskRouter = require('../src/routes/taskRouter');
const meetingRouter = require('../src/routes/meetingRouter');
const fileRouter = require('../src/routes/fileRouter');
const activityRouter = require('../src/routes/activityRouter');
const { verifyToken } = require('../src/middleware/authMiddleware');

// Import test helpers
const { createTestUser, createTestTeam, generateToken } = require('./helpers/testHelpers');

// Create test app
const app = express();
app.use(express.json());
app.use(verifyToken);
app.use('/api/teams', teamRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/meetings', meetingRouter);
app.use('/api/files', fileRouter);
app.use('/api/activities', activityRouter);

beforeEach(async () => {
  await User.deleteMany({});
  await Team.deleteMany({});
  await Task.deleteMany({});
  await Meeting.deleteMany({});
  await File.deleteMany({});
});

describe('TEAM LEAD Complete Feature Analysis', () => {
  let teamLead, member1, member2, otherLead, otherTeam, myTeam, leadToken, member1Token, member2Token, otherLeadToken;

  beforeEach(async () => {
    // Create team lead
    teamLead = await createTestUser({
      name: 'Team Lead',
      username: 'teamlead',
      email: 'lead@example.com',
      role: 'LEAD'
    });
    leadToken = generateToken(teamLead);

    // Create team members
    member1 = await createTestUser({
      name: 'Member One',
      username: 'member1',
      email: 'member1@example.com',
      role: 'MEMBER'
    });
    member1Token = generateToken(member1);

    member2 = await createTestUser({
      name: 'Member Two',
      username: 'member2',
      email: 'member2@example.com',
      role: 'MEMBER'
    });
    member2Token = generateToken(member2);

    // Create another team lead for testing restrictions
    otherLead = await createTestUser({
      name: 'Other Lead',
      username: 'otherlead',
      email: 'otherlead@example.com',
      role: 'LEAD'
    });
    otherLeadToken = generateToken(otherLead);

    // Create team with lead
    myTeam = await createTestTeam(teamLead._id);
    
    // Add members to team
    myTeam.members.push(
      { userId: member1._id, role: 'MEMBER' },
      { userId: member2._id, role: 'MEMBER' }
    );
    await myTeam.save();

    // Create another team for testing restrictions
    otherTeam = await createTestTeam(otherLead._id);
  });

  describe('✅ Required TEAM LEAD Features', () => {
    describe('Control Their Own Team', () => {
      it('should allow lead to view their team details', async () => {
        const response = await request(app)
          .get(`/api/teams/${myTeam._id}`)
          .set('Authorization', `Bearer ${leadToken}`)
          .expect(200);

        expect(response.body.name).toBe(myTeam.name);
        expect(response.body.members).toHaveLength(3); // Lead + 2 members
      });

      it('should allow lead to update their team', async () => {
        const response = await request(app)
          .put(`/api/teams/${myTeam._id}`)
          .set('Authorization', `Bearer ${leadToken}`)
          .send({ name: 'Updated Team Name', description: 'Updated description' })
          .expect(200);

        expect(response.body.data.name).toBe('Updated Team Name');
        expect(response.body.data.description).toBe('Updated description');
      });

      it('should allow lead to delete their team', async () => {
        const response = await request(app)
          .delete(`/api/teams/${myTeam._id}`)
          .set('Authorization', `Bearer ${leadToken}`)
          .expect(200);

        expect(response.body.message).toBe('Team deleted successfully');
      });
    });

    describe('Manage Team Members', () => {
      it('should allow lead to add members to their team', async () => {
        const newMember = await createTestUser({
          name: 'New Member',
          username: 'newmember',
          email: 'newmember@example.com'
        });

        const response = await request(app)
          .post(`/api/teams/${myTeam._id}/members`)
          .set('Authorization', `Bearer ${leadToken}`)
          .send({ userId: newMember._id, role: 'MEMBER' })
          .expect(200);

        expect(response.body.message).toBe('Member added successfully');
        expect(response.body.data.members).toHaveLength(4); // Lead + 3 members
      });

      it('should allow lead to remove members from their team', async () => {
        const response = await request(app)
          .delete(`/api/teams/${myTeam._id}/members`)
          .set('Authorization', `Bearer ${leadToken}`)
          .send({ userId: member1._id })
          .expect(200);

        expect(response.body.message).toBe('Member removed successfully');
        expect(response.body.data.members).toHaveLength(2); // Lead + 1 member
      });

      it('should NOT allow lead to remove team creator (themselves)', async () => {
        const response = await request(app)
          .delete(`/api/teams/${myTeam._id}/members`)
          .set('Authorization', `Bearer ${leadToken}`)
          .send({ userId: teamLead._id })
          .expect(400);

        expect(response.body.message).toBe('Cannot remove team creator');
      });
    });

    describe('Create & Assign Tasks', () => {
      it('should allow lead to create tasks in their team', async () => {
        const taskData = {
          title: 'Lead Created Task',
          description: 'Task created by team lead',
          teamId: myTeam._id,
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

      it('should allow lead to assign tasks to team members', async () => {
        const taskData = {
          title: 'Assigned Task',
          description: 'Task assigned to member',
          teamId: myTeam._id,
          assignedTo: member1._id,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };

        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${leadToken}`)
          .send(taskData)
          .expect(201);

        expect(response.body.data.assignedTo._id).toBe(member1._id.toString());
      });

      it('should allow lead to reassign tasks', async () => {
        // Create task assigned to member1
        const task = new Task({
          title: 'Test Task',
          description: 'Task for reassignment',
          teamId: myTeam._id,
          createdBy: teamLead._id,
          assignedTo: member1._id,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        await task.save();

        const response = await request(app)
          .put(`/api/tasks/${task._id}`)
          .set('Authorization', `Bearer ${leadToken}`)
          .send({ assignedTo: member2._id })
          .expect(200);

        expect(response.body.data.assignedTo._id).toBe(member2._id.toString());
      });
    });

    describe('Set Deadlines & Priorities', () => {
      it('should allow lead to set task deadlines and priorities', async () => {
        const deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        const taskData = {
          title: 'Priority Task',
          description: 'High priority task with deadline',
          teamId: myTeam._id,
          priority: 'high',
          deadline: deadline
        };

        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${leadToken}`)
          .send(taskData)
          .expect(201);

        expect(response.body.data.priority).toBe('high');
        expect(new Date(response.body.data.deadline)).toEqual(deadline);
      });

      it('should allow lead to update task deadlines and priorities', async () => {
        // Create task
        const task = new Task({
          title: 'Test Task',
          description: 'Task for updating',
          teamId: myTeam._id,
          createdBy: teamLead._id,
          priority: 'medium',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        await task.save();

        const newDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        const response = await request(app)
          .put(`/api/tasks/${task._id}`)
          .set('Authorization', `Bearer ${leadToken}`)
          .send({ priority: 'urgent', deadline: newDeadline })
          .expect(200);

        expect(response.body.data.priority).toBe('urgent');
        expect(new Date(response.body.data.deadline)).toEqual(newDeadline);
      });
    });

    describe('Schedule Meetings', () => {
      it('should allow lead to create meetings for their team', async () => {
        const meetingData = {
          title: 'Team Meeting',
          description: 'Weekly team sync',
          teamId: myTeam._id,
          participants: [member1._id, member2._id],
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
        expect(response.body.data.participants).toHaveLength(2);
      });

      it('should allow lead to update meetings in their team', async () => {
        // Create meeting organized by member
        const meeting = new Meeting({
          title: 'Member Meeting',
          description: 'Meeting organized by member',
          teamId: myTeam._id,
          organizer: member1._id,
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          duration: 30,
          meetingLink: 'https://meet.example.com/member'
        });
        await meeting.save();

        const response = await request(app)
          .put(`/api/meetings/${meeting._id}`)
          .set('Authorization', `Bearer ${leadToken}`)
          .send({ duration: 60, title: 'Updated by Lead' })
          .expect(200);

        expect(response.body.data.duration).toBe(60);
        expect(response.body.data.title).toBe('Updated by Lead');
      });

      it('should allow lead to delete meetings in their team', async () => {
        // Create meeting organized by member
        const meeting = new Meeting({
          title: 'Member Meeting',
          description: 'Meeting organized by member',
          teamId: myTeam._id,
          organizer: member1._id,
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          duration: 30,
          meetingLink: 'https://meet.example.com/member'
        });
        await meeting.save();

        const response = await request(app)
          .delete(`/api/meetings/${meeting._id}`)
          .set('Authorization', `Bearer ${leadToken}`)
          .expect(200);

        expect(response.body.message).toBe('Meeting deleted successfully');
      });
    });

    describe('Manage Files for Their Team', () => {
      it('should allow lead to delete files in their team', async () => {
        // Create file uploaded by member
        const file = new File({
          fileName: 'member-file.pdf',
          fileUrl: 'https://example.com/member-file.pdf',
          fileSize: 1024,
          fileType: 'application/pdf',
          teamId: myTeam._id,
          uploadedBy: member1._id,
          description: 'File uploaded by member'
        });
        await file.save();

        const response = await request(app)
          .delete(`/api/files/${file._id}`)
          .set('Authorization', `Bearer ${leadToken}`)
          .expect(200);

        expect(response.body.message).toBe('File deleted successfully');
      });
    });

    describe('Track Team Progress & View Reports', () => {
      it('should allow lead to view team reports', async () => {
        const response = await request(app)
          .get(`/api/activities/report/${myTeam._id}`)
          .set('Authorization', `Bearer ${leadToken}`)
          .expect(200);

        expect(response.body.team).toBeDefined();
        expect(response.body.team.id).toBe(myTeam._id.toString());
        expect(response.body.activityStats).toBeDefined();
        expect(response.body.memberStats).toBeDefined();
      });

      it('should allow lead to view team activities', async () => {
        const response = await request(app)
          .get(`/api/activities/team/${myTeam._id}`)
          .set('Authorization', `Bearer ${leadToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should allow lead to view tasks in their team', async () => {
        const response = await request(app)
          .get(`/api/tasks/team/${myTeam._id}`)
          .set('Authorization', `Bearer ${leadToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should allow lead to view meetings in their team', async () => {
        const response = await request(app)
          .get(`/api/meetings/team/${myTeam._id}`)
          .set('Authorization', `Bearer ${leadToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should allow lead to view files in their team', async () => {
        const response = await request(app)
          .get(`/api/files/team/${myTeam._id}`)
          .set('Authorization', `Bearer ${leadToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });
  });

  describe('❌ TEAM LEAD Restrictions (Does NOT Control Other Teams)', () => {
    describe('Cannot Control Other Teams', () => {
      it('should NOT allow lead to update other teams', async () => {
        const response = await request(app)
          .put(`/api/teams/${otherTeam._id}`)
          .set('Authorization', `Bearer ${leadToken}`)
          .send({ name: 'Unauthorized Update' })
          .expect(403);

        expect(response.body.message).toBe('Access denied. Only team creator or admin can update');
      });

      it('should NOT allow lead to delete other teams', async () => {
        const response = await request(app)
          .delete(`/api/teams/${otherTeam._id}`)
          .set('Authorization', `Bearer ${leadToken}`)
          .expect(403);

        expect(response.body.message).toBe('Access denied. Only team creator or admin can delete');
      });

      it('should NOT allow lead to add members to other teams', async () => {
        const response = await request(app)
          .post(`/api/teams/${otherTeam._id}/members`)
          .set('Authorization', `Bearer ${leadToken}`)
          .send({ userId: member1._id })
          .expect(403);

        expect(response.body.message).toBe('Access denied. Only team lead or admin can add members');
      });

      it('should NOT allow lead to remove members from other teams', async () => {
        const response = await request(app)
          .delete(`/api/teams/${otherTeam._id}/members`)
          .set('Authorization', `Bearer ${leadToken}`)
          .send({ userId: otherLead._id })
          .expect(403);

        expect(response.body.message).toBe('Access denied. Only team lead or admin can remove members');
      });
    });

    describe('Cannot Control Tasks in Other Teams', () => {
      it('should NOT allow lead to create tasks in other teams', async () => {
        const taskData = {
          title: 'Unauthorized Task',
          description: 'Task in other team',
          teamId: otherTeam._id,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };

        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${leadToken}`)
          .send(taskData)
          .expect(403);

        expect(response.body.message).toBe('Access denied. Only team leads or admins can create tasks');
      });

      it('should NOT allow lead to update tasks in other teams', async () => {
        // Create task in other team
        const task = new Task({
          title: 'Other Team Task',
          description: 'Task in other team',
          teamId: otherTeam._id,
          createdBy: otherLead._id,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        await task.save();

        const response = await request(app)
          .put(`/api/tasks/${task._id}`)
          .set('Authorization', `Bearer ${leadToken}`)
          .send({ status: 'completed' })
          .expect(403);

        expect(response.body.message).toBe('Access denied. You cannot update this task');
      });

      it('should NOT allow lead to delete tasks in other teams', async () => {
        // Create task in other team
        const task = new Task({
          title: 'Other Team Task',
          description: 'Task in other team',
          teamId: otherTeam._id,
          createdBy: otherLead._id,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        await task.save();

        const response = await request(app)
          .delete(`/api/tasks/${task._id}`)
          .set('Authorization', `Bearer ${leadToken}`)
          .expect(403);

        expect(response.body.message).toBe('Access denied. Only task creator, team lead, or admin can delete');
      });
    });

    describe('Cannot Control Meetings in Other Teams', () => {
      it('should NOT allow lead to create meetings in other teams', async () => {
        const meetingData = {
          title: 'Unauthorized Meeting',
          description: 'Meeting in other team',
          teamId: otherTeam._id,
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          duration: 30
        };

        const response = await request(app)
          .post('/api/meetings')
          .set('Authorization', `Bearer ${leadToken}`)
          .send(meetingData)
          .expect(403);

        expect(response.body.message).toBe('Access denied. Only team leads or admins can create meetings');
      });

      it('should NOT allow lead to update meetings in other teams', async () => {
        // Create meeting in other team
        const meeting = new Meeting({
          title: 'Other Team Meeting',
          description: 'Meeting in other team',
          teamId: otherTeam._id,
          organizer: otherLead._id,
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          duration: 30,
          meetingLink: 'https://meet.example.com/other'
        });
        await meeting.save();

        const response = await request(app)
          .put(`/api/meetings/${meeting._id}`)
          .set('Authorization', `Bearer ${leadToken}`)
          .send({ duration: 60 })
          .expect(403);

        expect(response.body.message).toBe('Access denied. Only organizer, team lead, or admin can update');
      });

      it('should NOT allow lead to delete meetings in other teams', async () => {
        // Create meeting in other team
        const meeting = new Meeting({
          title: 'Other Team Meeting',
          description: 'Meeting in other team',
          teamId: otherTeam._id,
          organizer: otherLead._id,
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          duration: 30,
          meetingLink: 'https://meet.example.com/other'
        });
        await meeting.save();

        const response = await request(app)
          .delete(`/api/meetings/${meeting._id}`)
          .set('Authorization', `Bearer ${leadToken}`)
          .expect(403);

        expect(response.body.message).toBe('Access denied. Only organizer, team lead, or admin can delete');
      });
    });

    describe('Cannot Access Global System Functions', () => {
      it('should NOT allow lead to view all teams', async () => {
        const response = await request(app)
          .get('/api/teams')
          .set('Authorization', `Bearer ${leadToken}`)
          .expect(403);

        expect(response.body.message).toBe('Access denied. Admin only');
      });

      it('should NOT allow lead to view all tasks', async () => {
        const response = await request(app)
          .get('/api/tasks')
          .set('Authorization', `Bearer ${leadToken}`)
          .expect(403);

        expect(response.body.message).toBe('Access denied. Admin only');
      });

      it('should NOT allow lead to view all activities', async () => {
        const response = await request(app)
          .get('/api/activities')
          .set('Authorization', `Bearer ${leadToken}`)
          .expect(403);

        expect(response.body.message).toBe('Access denied. Admin only');
      });
    });
  });
});