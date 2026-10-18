const db = require('../database/database');

// Create a registration only if the event has available spots
const insertRegistration = db.prepare(`
    INSERT INTO registrations (user_id, event_id)
    SELECT ?, e.id
    FROM events e
    WHERE e.id = ?
    AND (
        SELECT COUNT(*)
        FROM registrations r
        WHERE r.event_id = e.id
    ) < e.capacity
`);

// Get all registrations belonging to a user
const selectRegistrationsByUser = db.prepare(`
    SELECT
        r.id,
        r.user_id,
        r.event_id,
        r.created_at,
        e.title,
        e.description,
        e.date,
        e.location,
        e.capacity

    FROM registrations r

    INNER JOIN events e
        ON r.event_id = e.id

    WHERE r.user_id = ?

    ORDER BY e.date ASC
`);

// Check if a user is already registered for an event
const selectRegistrationByUserAndEvent = db.prepare(`
    SELECT
        id,
        user_id,
        event_id,
        created_at

    FROM registrations

    WHERE user_id = ?
    AND event_id = ?
`);

// Delete a registration belonging to a specific user
const deleteRegistration = db.prepare(`
    DELETE FROM registrations
    WHERE id = ?
    AND user_id = ?
`);


// Create a new event registration
function create(userId, eventId) {

    const result = insertRegistration.run(userId, eventId);

    if (result.changes === 0) {
        return null;
    }

    return findByUserAndEvent(userId, eventId);
}


// Find all registrations belonging to a user
function findByUserId(userId) {

    return selectRegistrationsByUser.all(userId);
}


// Find a specific registration
function findByUserAndEvent(userId, eventId) {

    return selectRegistrationByUserAndEvent.get(
        userId,
        eventId
    ) || null;
}


// Cancel a registration
function cancel(registrationId, userId) {

    const result = deleteRegistration.run(
        registrationId,
        userId
    );

    return result.changes > 0;
}


// Export repository functions
module.exports = {
    create,
    findByUserId,
    findByUserAndEvent,
    cancel
};