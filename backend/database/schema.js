const db = require('./database');

// Initialize database tables
function initializeDatabase() {

    // USERS TABLE
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE COLLATE NOCASE,
            password_hash TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // EVENTS TABLE
    db.exec(`
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            date TEXT NOT NULL,
            location TEXT NOT NULL,
            capacity INTEGER NOT NULL CHECK(capacity > 0),
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // REGISTRATIONS TABLE
    db.exec(`
        CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            event_id INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE,

            FOREIGN KEY (event_id)
                REFERENCES events(id)
                ON DELETE CASCADE,

            UNIQUE(user_id, event_id)
        );
    `);

    // Indexes for faster database queries
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_registrations_user
        ON registrations(user_id);

        CREATE INDEX IF NOT EXISTS idx_registrations_event
        ON registrations(event_id);

        CREATE INDEX IF NOT EXISTS idx_events_date
        ON events(date);
    `);

    console.log('Database tables initialized successfully!');
}

// Run initialization when this file is executed directly
if (require.main === module) {
    initializeDatabase();

    const tables = db.prepare(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
        AND name NOT LIKE 'sqlite_%'
        ORDER BY name
    `).all();

    console.log('Created tables:', tables.map(table => table.name));

    db.close();
}

// Export initialization function
module.exports = initializeDatabase;