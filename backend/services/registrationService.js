const registrationRepository = require('../repositories/registrationRepository');
const userRepository = require('../repositories/userRepository');
const eventService = require('./eventService');

// Create an error with an HTTP status code
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

// Validate authenticated user
function validateUserId(userId) {

    if (
        typeof userId !== 'number' ||
        !Number.isSafeInteger(userId) ||
        userId <= 0
    ) {
        throw createError('Authentication required.', 401);
    }

    const user = userRepository.findById(userId);

    if (!user) {
        throw createError('Authentication required.', 401);
    }

    return userId;
}

// Validate registration ID
function validateRegistrationId(id) {

    const registrationId = Number(id);

    if (
        !Number.isSafeInteger(registrationId) ||
        registrationId <= 0 ||
        typeof id === 'boolean' ||
        id === null ||
        (typeof id === 'string' && id.trim() === '')
    ) {
        throw createError('Invalid registration ID.', 400);
    }

    return registrationId;
}

// Register a user for an event
function registerForEvent(userId, eventId) {

    const validUserId = validateUserId(userId);

    // Check if event exists
    const event = eventService.getEventById(eventId);

    // Prevent registration for past events
    if (new Date(event.date).getTime() <= Date.now()) {
        throw createError(
            'Cannot register for an event that has already started.',
            400
        );
    }

    // Prevent duplicate registrations
    const existingRegistration =
        registrationRepository.findByUserAndEvent(
            validUserId,
            event.id
        );

    if (existingRegistration) {
        throw createError(
            'You are already registered for this event.',
            409
        );
    }

    // Check available spots
    if (event.available_spots <= 0) {
        throw createError(
            'This event is fully booked.',
            409
        );
    }

    // Create registration
    try {

        const registration = registrationRepository.create(
            validUserId,
            event.id
        );

        // Repository also checks capacity during insertion
        if (!registration) {
            throw createError(
                'This event is fully booked.',
                409
            );
        }

        return registration;

    } catch (error) {

        // Handle duplicate registration at database level
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            throw createError(
                'You are already registered for this event.',
                409
            );
        }

        // Handle deleted user/event during registration
        if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
            throw createError(
                'User or event no longer exists.',
                404
            );
        }

        throw error;
    }
}

// Get all registrations for the authenticated user
function getMyRegistrations(userId) {

    const validUserId = validateUserId(userId);

    return registrationRepository.findByUserId(validUserId);
}

// Cancel a registration
function cancelRegistration(userId, registrationId) {

    const validUserId = validateUserId(userId);

    const validRegistrationId =
        validateRegistrationId(registrationId);

    // Delete only if registration belongs to this user
    const cancelled = registrationRepository.cancel(
        validRegistrationId,
        validUserId
    );

    if (!cancelled) {
        throw createError(
            'Registration not found.',
            404
        );
    }

    return {
        message: 'Registration cancelled successfully.'
    };
}

// Export service functions
module.exports = {
    registerForEvent,
    getMyRegistrations,
    cancelRegistration,
    validateRegistrationId
};