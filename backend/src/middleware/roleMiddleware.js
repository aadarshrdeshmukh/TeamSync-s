// Middleware to check if user is admin
const isAdmin = (request, response, next) => {
    if (request.user.role !== 'ADMIN') {
        return response.status(403).json({ message: "Access denied. Admin only" });
    }
    next();
};

// Middleware to check if user is lead or admin
const isLeadOrAdmin = (request, response, next) => {
    if (request.user.role !== 'LEAD' && request.user.role !== 'ADMIN') {
        return response.status(403).json({ message: "Access denied. Lead or Admin only" });
    }
    next();
};

// Middleware to check if user is member, lead or admin (authenticated user)
const isMemberOrAbove = (request, response, next) => {
    if (!request.user || !['MEMBER', 'LEAD', 'ADMIN'].includes(request.user.role)) {
        return response.status(403).json({ message: "Access denied. Valid role required" });
    }
    next();
};

module.exports = {
    isAdmin,
    isLeadOrAdmin,
    isMemberOrAbove
};