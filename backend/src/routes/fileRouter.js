const express = require('express');
const { 
    getAllFiles, 
    getFilesByTeam, 
    getFileById, 
    uploadFile, 
    updateFile, 
    deleteFile 
} = require('../controllers/fileController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.get('/', getAllFiles);
router.get('/team/:teamId', getFilesByTeam);
router.get('/:id', getFileById);
router.post('/', uploadFile);
router.put('/:id', updateFile);
router.delete('/:id', deleteFile);

module.exports = router;
