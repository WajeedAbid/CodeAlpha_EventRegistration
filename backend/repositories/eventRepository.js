const db = require('../database/database');

// Get all events with registration statistics
const selectAllEvents = db.prepare(`
    SELECT
        e.id,
        e.title,
        e.description,
        e.date,
        e.location,
        e.capacity,
        COUNT(r.id) AS registered_count,
        (e.capacity - COUNT(r.id)) AS available_spots

    FROM events e

    LEFT JOIN registrations r
        ON e.id = r.event_id

    GROUP BY e.id

    ORDER BY e.date ASC
`);

// Get a specific event by ID
const selectEventById = db.prepare(`
    SELECT
        e.id,
        e.title,
        e.description,
        e.date,
        e.location,
        e.capacity,
        COUNT(r.id) AS registered_count,
        (e.capacity - COUNT(r.id)) AS available_spots

    FROM events e

    LEFT JOIN registrations r
        ON e.id = r.event_id

    WHERE e.id = ?

    GROUP BY e.id
`);

// Find all events
function findAll() {
    return selectAllEvents.all();
}

// Find event by ID
function findById(id) {
    return selectEventById.get(id) || null;
}

// Export repository functions
module.exports = {
    findAll,
    findById
};