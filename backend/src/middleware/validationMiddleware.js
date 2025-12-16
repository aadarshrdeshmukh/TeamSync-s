// Validation middleware for common request validations

// Validate required fields
const validateRequiredFields = (requiredFields) => {
    return (request, response, next) => {
        const missingFields = [];
        
        for (const field of requiredFields) {
            if (!request.body[field]) {
                missingFields.push(field);
            }
        }
        
        if (missingFields.length > 0) {
            return response.status(400).json({
                message: "Missing required fields",
                missingFields
            });
        }
        
        next();
    };
};

// Validate email format
const validateEmail = (request, response, next) => {
    const { email } = request.body;
    
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return response.status(400).json({
                message: "Invalid email format"
            });
        }
    }
    
    next();
};

// Validate password strength
const validatePassword = (request, response, next) => {
    const { password } = request.body;
    
    if (password) {
        if (password.length < 6) {
            return response.status(400).json({
                message: "Password must be at least 6 characters long"
            });
        }
    }
    
    next();
};

// Validate ObjectId format
const validateObjectId = (paramName) => {
    return (request, response, next) => {
        const id = request.params[paramName];
        const mongoose = require('mongoose');
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return response.status(400).json({
                message: `Invalid ${paramName} format`
            });
        }
        
        next();
    };
};

module.exports = {
    validateRequiredFields,
    validateEmail,
    validatePassword,
    validateObjectId
};