const express = require('express');
const authService = require('../services/authService');
const userRepository = require('../repositories/userRepository');

const router = express.Router();

// Create a new login session
function createSession(req, user) {

    return new Promise((resolve, reject) => {

        // Generate a new session ID for security
        req.session.regenerate((error) => {

            if (error) {
                return reject(error);
            }

            // Store authenticated user ID
            req.session.userId = user.id;

            // Save session
            req.session.save((error) => {

                if (error) {
                    return reject(error);
                }

                resolve();
            });
        });
    });
}


// POST /api/auth/register
// Register a new user
router.post('/register', async (req, res, next) => {

    try {

        const user = await authService.registerUser(req.body);

        // Automatically log in after registration
        await createSession(req, user);

        res.status(201).json({
            message: 'Account created successfully.',
            user: user
        });

    } catch (error) {
        next(error);
    }
});


// POST /api/auth/login
// Login an existing user
router.post('/login', async (req, res, next) => {

    try {

        const user = await authService.loginUser(req.body);

        // Create authenticated session
        await createSession(req, user);

        res.status(200).json({
            message: 'Login successful.',
            user: user
        });

    } catch (error) {
        next(error);
    }
});


// POST /api/auth/logout
// Logout the current user
router.post('/logout', (req, res, next) => {

    if (!req.session) {
        return res.status(401).json({
            error: 'Authentication required.'
        });
    }

    req.session.destroy((error) => {

        if (error) {
            return next(error);
        }

        // Remove session cookie
        res.clearCookie('connect.sid');

        res.status(200).json({
            message: 'Logged out successfully.'
        });
    });
});


// GET /api/auth/me
// Get currently authenticated user
router.get('/me', (req, res) => {

    const userId = req.session?.userId;

    if (!userId) {
        return res.status(200).json({
            user: null
        });
    }

    const user = userRepository.findById(userId);

    if (!user) {
        return res.status(200).json({
            user: null
        });
    }

    res.status(200).json({
        user: user
    });
});


// Export router
module.exports = router;