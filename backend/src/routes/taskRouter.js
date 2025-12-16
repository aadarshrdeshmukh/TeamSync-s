const express = require('express');
const { 
    getAllTasks, 
    getTasksByTeam, 
    getMyTasks, 
    getTaskById, 
    createTask, 
    updateTask, 
    deleteTask 
} = require('../controllers/taskController');
const { verifyToken } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.get('/', isAdmin, getAllTasks); // Only admins can see all tasks
router.get('/my-tasks', getMyTasks);
router.get('/team/:teamId', getTasksByTeam);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
