const express = require('express');
const eventService = require('../services/eventService');

const router = express.Router();


// GET /api/events
// Get all available events
router.get('/', (req, res, next) => {

    try {

        const events = eventService.getAllEvents();

        res.status(200).json({
            events: events
        });

    } catch (error) {
        next(error);
    }
});


// GET /api/events/:id
// Get a specific event by ID
router.get('/:id', (req, res, next) => {

    try {

        const eventId = req.params.id;

        const event = eventService.getEventById(eventId);

        res.status(200).json({
            event: event
        });

    } catch (error) {
        next(error);
    }
});


// Export router
module.exports = router;