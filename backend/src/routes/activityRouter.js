const express = require('express');
const { 
    getAllActivities,
    getMyActivities, 
    getActivitiesByTeam, 
    getTeamReport 
} = require('../controllers/activityController');
const { verifyToken } = require('../middleware/authMiddleware');
const { isAdmin, isLeadOrAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.get('/', isAdmin, getAllActivities); // Only admins can see all activities
router.get('/my-activities', getMyActivities); // Get activities for current user's teams
router.get('/team/:teamId', getActivitiesByTeam);
router.get('/report/:teamId', isLeadOrAdmin, getTeamReport);

module.exports = router;
