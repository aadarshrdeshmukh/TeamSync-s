const express = require('express');
const { getAssignableUsers, getProfile } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.get('/assignable', getAssignableUsers);
router.get('/profile', getProfile);

module.exports = router;