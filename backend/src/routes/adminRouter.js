const express = require('express');
const { 
    getDashboardStats,
    getAllUsers,
    updateUserRole,
    deactivateUser,
    activateUser,
    createUser,
    getSystemReport
} = require('../controllers/adminController');
const { 
    getAllActivities,
    getTeamReport
} = require('../controllers/activityController');
const { verifyToken } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(isAdmin);

// Dashboard and system stats
router.get('/dashboard', getDashboardStats);
router.get('/reports/system', getSystemReport);
router.get('/reports/team/:teamId', getTeamReport);

// User management
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:userId/role', updateUserRole);
router.put('/users/:userId/deactivate', deactivateUser);
router.put('/users/:userId/activate', activateUser);

// System-wide activity
router.get('/activities', getAllActivities);

module.exports = router;