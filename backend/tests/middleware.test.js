const request = require('supertest');
const express = require('express');
const { verifyToken } = require('../src/middleware/authMiddleware');
const { isAdmin, isLeadOrAdmin, isMemberOrAbove } = require('../src/middleware/roleMiddleware');
const { createTestUser, createTestAdmin, createTestLead, generateToken } = require('./helpers/testHelpers');

// Create test app
const app = express();
app.use(express.json());

// Test routes for middleware
app.get('/test-auth', verifyToken, (req, res) => {
  res.json({ message: 'Authenticated', user: req.user });
});

app.get('/test-admin', verifyToken, isAdmin, (req, res) => {
  res.json({ message: 'Admin access granted' });
});

app.get('/test-lead-or-admin', verifyToken, isLeadOrAdmin, (req, res) => {
  res.json({ message: 'Lead or Admin access granted' });
});

app.get('/test-member-or-above', verifyToken, isMemberOrAbove, (req, res) => {
  res.json({ message: 'Member or above access granted' });
});

describe('Middleware Tests', () => {
  describe('Auth Middleware', () => {
    it('should authenticate user with valid token', async () => {
      const user = await createTestUser();
      const token = generateToken(user);

      const response = await request(app)
        .get('/test-auth')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('Authenticated');
      expect(response.body.user.userId).toBe(user._id.toString());
      expect(response.body.user.email).toBe(user.email);
      expect(response.body.user.role).toBe(user.role);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/test-auth')
        .expect(401);

      expect(response.body.message).toBe('Access denied. No token provided');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/test-auth')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body.message).toBe('Invalid token');
    });

    it('should reject request with malformed authorization header', async () => {
      const response = await request(app)
        .get('/test-auth')
        .set('Authorization', 'invalidformat')
        .expect(401);

      expect(response.body.message).toBe('Access denied. No token provided');
    });
  });

  describe('Role Middleware', () => {
    describe('isAdmin', () => {
      it('should allow admin access', async () => {
        const admin = await createTestAdmin();
        const token = generateToken(admin);

        const response = await request(app)
          .get('/test-admin')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body.message).toBe('Admin access granted');
      });

      it('should deny non-admin access', async () => {
        const user = await createTestUser();
        const token = generateToken(user);

        const response = await request(app)
          .get('/test-admin')
          .set('Authorization', `Bearer ${token}`)
          .expect(403);

        expect(response.body.message).toBe('Access denied. Admin only');
      });

      it('should deny lead access to admin-only route', async () => {
        const lead = await createTestLead();
        const token = generateToken(lead);

        const response = await request(app)
          .get('/test-admin')
          .set('Authorization', `Bearer ${token}`)
          .expect(403);

        expect(response.body.message).toBe('Access denied. Admin only');
      });
    });

    describe('isLeadOrAdmin', () => {
      it('should allow admin access', async () => {
        const admin = await createTestAdmin();
        const token = generateToken(admin);

        const response = await request(app)
          .get('/test-lead-or-admin')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body.message).toBe('Lead or Admin access granted');
      });

      it('should allow lead access', async () => {
        const lead = await createTestLead();
        const token = generateToken(lead);

        const response = await request(app)
          .get('/test-lead-or-admin')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body.message).toBe('Lead or Admin access granted');
      });

      it('should deny member access', async () => {
        const member = await createTestUser();
        const token = generateToken(member);

        const response = await request(app)
          .get('/test-lead-or-admin')
          .set('Authorization', `Bearer ${token}`)
          .expect(403);

        expect(response.body.message).toBe('Access denied. Lead or Admin only');
      });
    });

    describe('isMemberOrAbove', () => {
      it('should allow admin access', async () => {
        const admin = await createTestAdmin();
        const token = generateToken(admin);

        const response = await request(app)
          .get('/test-member-or-above')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body.message).toBe('Member or above access granted');
      });

      it('should allow lead access', async () => {
        const lead = await createTestLead();
        const token = generateToken(lead);

        const response = await request(app)
          .get('/test-member-or-above')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body.message).toBe('Member or above access granted');
      });

      it('should allow member access', async () => {
        const member = await createTestUser();
        const token = generateToken(member);

        const response = await request(app)
          .get('/test-member-or-above')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body.message).toBe('Member or above access granted');
      });
    });
  });
});