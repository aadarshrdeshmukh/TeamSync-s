const express = require('express');
const { 
    getAllTeams, 
    getMyTeams, 
    getTeamById, 
    createTeam, 
    updateTeam, 
    deleteTeam,
    addMember,
    removeMember,
    transferLeadership
} = require('../controllers/teamController');
const { verifyToken } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.get('/', isAdmin, getAllTeams); // Only admins can see all teams
router.get('/my-teams', getMyTeams);
router.get('/:id', getTeamById);
router.post('/', createTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);
router.post('/:id/members', addMember);
router.delete('/:id/members', removeMember);
router.put('/:id/transfer-leadership', transferLeadership);

module.exports = router;
