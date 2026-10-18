const db = require('./database');
const initializeDatabase = require('./schema');

// Sample events
const sampleEvents = [
    {
        title: 'Tech Conference 2026',
        description: 'Join developers, engineers and technology enthusiasts for a conference about modern software development and emerging technologies.',
        date: '2026-10-29T17:00:00Z',
        location: 'Stockholm, Sweden',
        capacity: 150
    },
    {
        title: 'AI & Machine Learning Workshop',
        description: 'Learn the fundamentals of artificial intelligence and machine learning through practical exercises and real-world examples.',
        date: '2026-11-05T13:00:00Z',
        location: 'Stockholm, Sweden',
        capacity: 40
    },
    {
        title: 'Cybersecurity Bootcamp',
        description: 'Explore network security, ethical hacking and modern cybersecurity techniques with experienced professionals.',
        date: '2026-11-12T09:00:00Z',
        location: 'Gothenburg, Sweden',
        capacity: 60
    },
    {
        title: 'Game Development Meetup',
        description: 'Meet game developers, explore game engines and discover techniques for building immersive gaming experiences.',
        date: '2026-11-20T17:00:00Z',
        location: 'Malmo, Sweden',
        capacity: 80
    },
    {
        title: 'Web Development Hackathon',
        description: 'Participate in an exciting hackathon where developers collaborate to build creative web applications.',
        date: '2026-12-05T09:00:00Z',
        location: 'Online',
        capacity: 100
    }
];

// Insert sample events into database
function seedEvents() {

    const checkEvent = db.prepare(`
        SELECT id
        FROM events
        WHERE title = ? AND date = ?
    `);

    const insertEvent = db.prepare(`
        INSERT INTO events (
            title,
            description,
            date,
            location,
            capacity
        )
        VALUES (
            @title,
            @description,
            @date,
            @location,
            @capacity
        )
    `);

    let insertedCount = 0;

    // Run all inserts in one transaction
    const insertSampleEvents = db.transaction(() => {

        for (const event of sampleEvents) {

            // Prevent duplicate sample events
            const existingEvent = checkEvent.get(
                event.title,
                event.date
            );

            if (!existingEvent) {
                insertEvent.run(event);
                insertedCount++;
            }
        }
    });

    insertSampleEvents();

    console.log(`Database seeded successfully! Added ${insertedCount} events.`);
}

// Execute when running this file directly
if (require.main === module) {

    try {
        initializeDatabase();

        seedEvents();

        const events = db.prepare(`
            SELECT id, title, date, location, capacity
            FROM events
            ORDER BY date ASC
        `).all();

        console.table(events);

    } finally {
        db.close();
    }
}

// Export for use in server.js
module.exports = seedEvents;