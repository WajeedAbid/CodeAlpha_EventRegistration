const Database = require('better-sqlite3');
const path = require('node:path');

// Path to the SQLite database file
const databasePath = path.join(__dirname, 'events.sqlite');

// Create or open the database
const db = new Database(databasePath);

// Enable foreign key constraints
db.pragma('foreign_keys = ON');

// Enable Write-Ahead Logging for better performance
db.pragma('journal_mode = WAL');

// Export the database connection
module.exports = db;