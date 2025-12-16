const request = require('supertest');
const express = require('express');

// Import models and routes
const User = require('../src/models/User');
const Team = require('../src/models/Team');
const Meeting = require('../src/models/Meeting');
const meetingRouter = require('../src/routes/meetingRouter');
const { verifyToken } = require('../src/middleware/authMiddleware');

// Import test helpers
const { createTestUser, createTestTeam, generateToken } = require('./helpers/testHelpers');

// Create test app
const app = express();
app.use(express.json());
app.use(verifyToken);
app.use('/api/meetings', meetingRouter);

beforeEach(async () => {
  await User.deleteMany({});
  await Team.deleteMany({});
  await Meeting.deleteMany({});
});

describe('Team Lead Meeting Management', () => {
  let teamLead, teamMember, team, meeting, leadToken, memberToken;

  beforeEach(async () => {
    // Create team lead
    teamLead = await createTestUser({
      name: 'Team Lead',
      username: 'teamlead',
      email: 'lead@example.com',
      role: 'LEAD'
    });
    leadToken = generateToken(teamLead);

    // Create team member
    teamMember = await createTestUser({
      name: 'Team Member',
      username: 'member',
      email: 'member@example.com',
      role: 'MEMBER'
    });
    memberToken = generateToken(teamMember);

    // Create team with lead
    team = await createTestTeam(teamLead._id);
    
    // Add member to team
    team.members.push({
      userId: teamMember._id,
      role: 'MEMBER'
    });
    await team.save();

    // Create meeting organized by member
    meeting = new Meeting({
      title: 'Team Standup',
      description: 'Daily standup meeting',
      teamId: team._id,
      organizer: teamMember._id,
      participants: [teamLead._id, teamMember._id],
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      duration: 30,
      meetingLink: 'https://meet.example.com/standup'
    });
    await meeting.save();
  });

  describe('PUT /api/meetings/:id - Team Lead Updates Meeting', () => {
    it('should allow team lead to update meeting organized by team member', async () => {
      const updateData = {
        title: 'Updated Standup Meeting',
        description: 'Updated daily standup',
        duration: 45
      };

      const response = await request(app)
        .put(`/api/meetings/${meeting._id}`)
        .set('Authorization', `Bearer ${leadToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Meeting updated successfully');
      expect(response.body.data.title).toBe('Updated Standup Meeting');
      expect(response.body.data.duration).toBe(45);
    });

    it('should not allow member to update meeting they did not organize', async () => {
      // Create another member
      const anotherMember = await createTestUser({
        name: 'Another Member',
        username: 'anothermember',
        email: 'another@example.com',
        role: 'MEMBER'
      });
      const anotherToken = generateToken(anotherMember);

      // Add to team
      team.members.push({
        userId: anotherMember._id,
        role: 'MEMBER'
      });
      await team.save();

      const updateData = {
        title: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/meetings/${meeting._id}`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Only organizer, team lead, or admin can update');
    });
  });

  describe('DELETE /api/meetings/:id - Team Lead Deletes Meeting', () => {
    it('should allow team lead to delete meeting organized by team member', async () => {
      const response = await request(app)
        .delete(`/api/meetings/${meeting._id}`)
        .set('Authorization', `Bearer ${leadToken}`)
        .expect(200);

      expect(response.body.message).toBe('Meeting deleted successfully');

      // Verify meeting is deleted
      const deletedMeeting = await Meeting.findById(meeting._id);
      expect(deletedMeeting).toBeNull();
    });

    it('should allow organizer to delete their own meeting', async () => {
      const response = await request(app)
        .delete(`/api/meetings/${meeting._id}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);

      expect(response.body.message).toBe('Meeting deleted successfully');
    });
  });
});