const request = require('supertest');
const express = require('express');
const taskRouter = require('../src/routes/taskRouter');
const Task = require('../src/models/Task');
const { createTestUser, generateToken, createTestTeam } = require('./helpers/testHelpers');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/tasks', taskRouter);

describe('Task Endpoints', () => {
  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const user = await createTestUser();
      const token = generateToken(user);
      const team = await createTestTeam(user);

      const taskData = {
        title: 'Test Task',
        description: 'Task description',
        teamId: team._id.toString(),
        priority: 'high',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData)
        .expect(201);

      expect(response.body.message).toBe('Task created successfully');
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.description).toBe(taskData.description);
      expect(response.body.data.priority).toBe(taskData.priority);
      expect(response.body.data.status).toBe('todo');

      // Verify task was saved to database
      const task = await Task.findOne({ title: taskData.title });
      expect(task).toBeTruthy();
      expect(task.createdBy.toString()).toBe(user._id.toString());
    });

    it('should not create task with missing required fields', async () => {
      const user = await createTestUser();
      const token = generateToken(user);

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Task'
          // missing description, teamId, deadline
        })
        .expect(400);

      expect(response.body.message).toBe('Title, description, team, and deadline are required');
    });

    it('should not create task for non-existent team', async () => {
      const user = await createTestUser();
      const token = generateToken(user);
      const fakeTeamId = '507f1f77bcf86cd799439011';

      const taskData = {
        title: 'Test Task',
        description: 'Task description',
        teamId: fakeTeamId,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData)
        .expect(404);

      expect(response.body.message).toBe('Team not found');
    });
  });

  describe('GET /api/tasks/my-tasks', () => {
    it('should get tasks assigned to current user', async () => {
      const user = await createTestUser();
      const token = generateToken(user);
      const team = await createTestTeam(user);

      // Create a task assigned to the user
      const task = new Task({
        title: 'My Task',
        description: 'Task description',
        teamId: team._id,
        assignedTo: user._id,
        createdBy: user._id,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      await task.save();

      const response = await request(app)
        .get('/api/tasks/my-tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('My Task');
      expect(response.body[0].assignedTo._id).toBe(user._id.toString());
    });

    it('should return empty array for user with no assigned tasks', async () => {
      const user = await createTestUser();
      const token = generateToken(user);

      const response = await request(app)
        .get('/api/tasks/my-tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update task by creator', async () => {
      const user = await createTestUser();
      const token = generateToken(user);
      const team = await createTestTeam(user);

      const task = new Task({
        title: 'Original Task',
        description: 'Original description',
        teamId: team._id,
        createdBy: user._id,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      await task.save();

      const updateData = {
        title: 'Updated Task',
        status: 'in-progress',
        priority: 'high'
      };

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Task updated successfully');
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.status).toBe(updateData.status);
      expect(response.body.data.priority).toBe(updateData.priority);

      // Verify update in database
      const updatedTask = await Task.findById(task._id);
      expect(updatedTask.title).toBe(updateData.title);
      expect(updatedTask.status).toBe(updateData.status);
    });

    it('should not update non-existent task', async () => {
      const user = await createTestUser();
      const token = generateToken(user);
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Task' })
        .expect(404);

      expect(response.body.message).toBe('Task not found');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete task by creator', async () => {
      const user = await createTestUser();
      const token = generateToken(user);
      const team = await createTestTeam(user);

      const task = new Task({
        title: 'Task to Delete',
        description: 'Task description',
        teamId: team._id,
        createdBy: user._id,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      await task.save();

      const response = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('Task deleted successfully');

      // Verify task was deleted from database
      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });

    it('should not delete non-existent task', async () => {
      const user = await createTestUser();
      const token = generateToken(user);
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBe('Task not found');
    });
  });
});