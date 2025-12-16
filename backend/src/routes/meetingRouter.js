const express = require('express');
const { 
    getAllMeetings, 
    getMeetingsByTeam, 
    getMyMeetings, 
    getMeetingById, 
    createMeeting, 
    updateMeeting, 
    deleteMeeting,
    joinMeeting
} = require('../controllers/meetingController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.get('/', getAllMeetings);
router.get('/my-meetings', getMyMeetings);
router.get('/team/:teamId', getMeetingsByTeam);
router.get('/:id', getMeetingById);
router.post('/', createMeeting);
router.put('/:id', updateMeeting);
router.delete('/:id', deleteMeeting);
router.post('/:id/join', joinMeeting);

module.exports = router;
