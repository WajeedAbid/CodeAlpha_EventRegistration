const express = require('express');

const registrationService = require('../services/registrationService');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();


// Protect all registration endpoints
router.use(requireAuth);


// GET /api/registrations
// Get all registrations belonging to the logged-in user
router.get('/', (req, res, next) => {

    try {

        const userId = req.session.userId;

        const registrations =
            registrationService.getMyRegistrations(userId);

        return res.status(200).json({
            registrations: registrations
        });

    } catch (error) {
        next(error);
    }
});


// POST /api/registrations
// Register the logged-in user for an event
router.post('/', (req, res, next) => {

    try {

        const userId = req.session.userId;

        const eventId = req.body?.eventId;

        const registration =
            registrationService.registerForEvent(
                userId,
                eventId
            );

        return res.status(201).json({
            message: 'Registered for event successfully.',
            registration: registration
        });

    } catch (error) {
        next(error);
    }
});


// DELETE /api/registrations/:id
// Cancel a registration belonging to the logged-in user
router.delete('/:id', (req, res, next) => {

    try {

        const userId = req.session.userId;

        const registrationId = req.params.id;

        const result =
            registrationService.cancelRegistration(
                userId,
                registrationId
            );

        return res.status(200).json(result);

    } catch (error) {
        next(error);
    }
});


// Export router
module.exports = router;