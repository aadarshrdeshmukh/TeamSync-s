const request = require('supertest');
const express = require('express');
const teamRouter = require('../src/routes/teamRouter');
const Team = require('../src/models/Team');
const User = require('../src/models/User');
const { createTestUser, createTestAdmin, generateToken, createTestTeam } = require('./helpers/testHelpers');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/teams', teamRouter);

describe('Team Endpoints', () => {
  describe('POST /api/teams', () => {
    it('should create a new team', async () => {
      const user = await createTestUser();
      const token = generateToken(user);

      const teamData = {
        name: 'New Team',
        description: 'Team description'
      };

      const response = await request(app)
        .post('/api/teams')
        .set('Authorization', `Bearer ${token}`)
        .send(teamData)
        .expect(201);

      expect(response.body.message).toBe('Team created successfully');
      expect(response.body.data.name).toBe(teamData.name);
      expect(response.body.data.description).toBe(teamData.description);
      expect(response.body.data.createdBy._id).toBe(user._id.toString());

      // Verify team was saved to database
      const team = await Team.findOne({ name: teamData.name });
      expect(team).toBeTruthy();
      expect(team.members[0].userId.toString()).toBe(user._id.toString());
      expect(team.members[0].role).toBe('LEAD');
    });

    it('should not create team with missing fields', async () => {
      const user = await createTestUser();
      const token = generateToken(user);

      const response = await request(app)
        .post('/api/teams')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Team Name'
          // missing description
        })
        .expect(400);

      expect(response.body.message).toBe('Name and description are required');
    });

    it('should not create team without authentication', async () => {
      const response = await request(app)
        .post('/api/teams')
        .send({
          name: 'Team Name',
          description: 'Description'
        })
        .expect(401);

      expect(response.body.message).toBe('Access denied. No token provided');
    });
  });

  describe('GET /api/teams/my-teams', () => {
    it('should get user teams', async () => {
      const user = await createTestUser();
      const token = generateToken(user);
      
      // Create a team for the user
      await createTestTeam(user);

      const response = await request(app)
        .get('/api/teams/my-teams')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].createdBy._id).toBe(user._id.toString());
    });

    it('should return empty array for user with no teams', async () => {
      const user = await createTestUser();
      const token = generateToken(user);

      const response = await request(app)
        .get('/api/teams/my-teams')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /api/teams/:id', () => {
    it('should get team by id', async () => {
      const user = await createTestUser();
      const token = generateToken(user);
      const team = await createTestTeam(user);

      const response = await request(app)
        .get(`/api/teams/${team._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body._id).toBe(team._id.toString());
      expect(response.body.name).toBe(team.name);
      expect(response.body.createdBy._id).toBe(user._id.toString());
    });

    it('should return 404 for non-existent team', async () => {
      const user = await createTestUser();
      const token = generateToken(user);
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/teams/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBe('Team not found');
    });
  });

  describe('POST /api/teams/:id/members', () => {
    it('should add member to team', async () => {
      const teamLead = await createTestUser({ role: 'LEAD' });
      const newMember = await createTestUser({ 
        email: 'member@example.com', 
        username: 'member' 
      });
      const token = generateToken(teamLead);
      const team = await createTestTeam(teamLead);

      const response = await request(app)
        .post(`/api/teams/${team._id}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: newMember._id.toString(),
          role: 'MEMBER'
        })
        .expect(200);

      expect(response.body.message).toBe('Member added successfully');
      expect(response.body.data.members.length).toBe(2);

      // Verify member was added to database
      const updatedTeam = await Team.findById(team._id);
      expect(updatedTeam.members.length).toBe(2);
      expect(updatedTeam.members.some(m => m.userId.toString() === newMember._id.toString())).toBe(true);
    });

    it('should not add existing member', async () => {
      const teamLead = await createTestUser({ role: 'LEAD' });
      const token = generateToken(teamLead);
      const team = await createTestTeam(teamLead);

      const response = await request(app)
        .post(`/api/teams/${team._id}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: teamLead._id.toString()
        })
        .expect(400);

      expect(response.body.message).toBe('User is already a member of this team');
    });
  });

  describe('DELETE /api/teams/:id/members', () => {
    it('should remove member from team', async () => {
      const teamLead = await createTestUser({ role: 'LEAD' });
      const member = await createTestUser({ 
        email: 'member@example.com', 
        username: 'member' 
      });
      const token = generateToken(teamLead);
      const team = await createTestTeam(teamLead);

      // First add the member
      team.members.push({ userId: member._id, role: 'MEMBER' });
      await team.save();
      await User.findByIdAndUpdate(member._id, { $push: { teams: team._id } });

      const response = await request(app)
        .delete(`/api/teams/${team._id}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: member._id.toString()
        })
        .expect(200);

      expect(response.body.message).toBe('Member removed successfully');
      expect(response.body.data.members.length).toBe(1);

      // Verify member was removed from database
      const updatedTeam = await Team.findById(team._id);
      expect(updatedTeam.members.length).toBe(1);
      expect(updatedTeam.members.some(m => m.userId.toString() === member._id.toString())).toBe(false);
    });

    it('should not remove team creator', async () => {
      const teamLead = await createTestUser({ role: 'LEAD' });
      const token = generateToken(teamLead);
      const team = await createTestTeam(teamLead);

      const response = await request(app)
        .delete(`/api/teams/${team._id}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: teamLead._id.toString()
        })
        .expect(400);

      expect(response.body.message).toBe('Cannot remove team creator');
    });
  });

  describe('DELETE /api/teams/:id', () => {
    it('should delete team by creator', async () => {
      const user = await createTestUser();
      const token = generateToken(user);
      const team = await createTestTeam(user);

      const response = await request(app)
        .delete(`/api/teams/${team._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('Team deleted successfully');

      // Verify team was deleted from database
      const deletedTeam = await Team.findById(team._id);
      expect(deletedTeam).toBeNull();
    });

    it('should allow admin to delete any team', async () => {
      const user = await createTestUser();
      const admin = await createTestAdmin();
      const adminToken = generateToken(admin);
      const team = await createTestTeam(user);

      const response = await request(app)
        .delete(`/api/teams/${team._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Team deleted successfully');
    });

    it('should not allow non-creator to delete team', async () => {
      const creator = await createTestUser();
      const otherUser = await createTestUser({ 
        email: 'other@example.com', 
        username: 'other' 
      });
      const token = generateToken(otherUser);
      const team = await createTestTeam(creator);

      const response = await request(app)
        .delete(`/api/teams/${team._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Only team creator or admin can delete');
    });
  });
});