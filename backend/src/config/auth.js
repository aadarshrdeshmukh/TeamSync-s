// JWT Configuration
const JWT_CONFIG = {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRE || '24h',
    algorithm: 'HS256'
};

// Password Configuration
const PASSWORD_CONFIG = {
    saltRounds: 10,
    minLength: 6
};

// Role Definitions
const ROLES = {
    ADMIN: 'ADMIN',
    LEAD: 'LEAD', 
    MEMBER: 'MEMBER'
};

module.exports = {
    JWT_CONFIG,
    PASSWORD_CONFIG,
    ROLES
};
