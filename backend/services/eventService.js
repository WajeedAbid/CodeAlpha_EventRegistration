const eventRepository = require('../repositories/eventRepository');

// Create an error with an HTTP status code
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

// Validate an event ID
function validateEventId(id) {

    const eventId = Number(id);

    if (
        !Number.isSafeInteger(eventId) ||
        eventId <= 0 ||
        typeof id === 'boolean' ||
        id === null ||
        (typeof id === 'string' && id.trim() === '')
    ) {
        throw createError('Invalid event ID.', 400);
    }

    return eventId;
}

// Get all available events
function getAllEvents() {

    return eventRepository.findAll();
}

// Get a specific event
function getEventById(id) {

    const eventId = validateEventId(id);

    const event = eventRepository.findById(eventId);

    if (!event) {
        throw createError('Event not found.', 404);
    }

    return event;
}

// Export service functions
module.exports = {
    getAllEvents,
    getEventById,
    validateEventId
};