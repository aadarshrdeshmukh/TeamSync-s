const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teamsync';

mongoose.connect(MONGODB_URI);

const db = mongoose.connection;

db.on('connected', () => {
    console.log('Database connected successfully');
});

db.on('error', (err) => {
    console.error(`Database connection error: ${err}`);
});

module.exports = db;