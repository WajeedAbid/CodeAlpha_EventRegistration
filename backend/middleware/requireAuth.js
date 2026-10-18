const userRepository = require('../repositories/userRepository');

// Middleware to protect routes requiring authentication
function requireAuth(req, res, next) {

    // Get the authenticated user's ID from the session
    const userId = req.session?.userId;

    // Check whether a valid session exists
    if (!Number.isSafeInteger(userId) || userId <= 0) {
        return res.status(401).json({
            error: 'Authentication required. Please log in.'
        });
    }

    // Verify that the user still exists in the database
    const user = userRepository.findById(userId);

    if (!user) {
        return res.status(401).json({
            error: 'User no longer exists. Please log in again.'
        });
    }

    // Allow the request to continue
    next();
}

module.exports = requireAuth;