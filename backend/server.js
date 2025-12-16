const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./src/config/db');

// Import routers
const authRouter = require('./src/routes/authRouter');
const userRouter = require('./src/routes/userRouter');
const teamRouter = require('./src/routes/teamRouter');
const taskRouter = require('./src/routes/taskRouter');
const meetingRouter = require('./src/routes/meetingRouter');
const fileRouter = require('./src/routes/fileRouter');
const activityRouter = require('./src/routes/activityRouter');
const adminRouter = require('./src/routes/adminRouter');

const app = express();

// Welcome route
app.get('/', (request, response) => {
    response.send('Welcome to TeamSync API - Remote Team Collaboration Tool');
});

// Health check route
app.get('/health', (request, response) => {
    response.status(200).json({
        status: 'OK',
        message: "Server is running successfully",
        timestamp: new Date().toISOString()
    });
});

// Request logger middleware
const requestLogger = (request, response, next) => {
    console.log(`${request.method} ${request.url} ${new Date().toISOString()}`);
    next();
};

// Middlewares
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(requestLogger);
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/teams', teamRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/meetings', meetingRouter);
app.use('/api/files', fileRouter);
app.use('/api/activities', activityRouter);
app.use('/api/admin', adminRouter);

// 404 handler
app.use((request, response) => {
    response.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});