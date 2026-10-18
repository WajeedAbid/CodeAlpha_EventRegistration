require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('node:path');

const initializeDatabase = require('./backend/database/schema');
const seedEvents = require('./backend/database/seed');

const authRoutes = require('./backend/routes/authRoutes');
const eventRoutes = require('./backend/routes/eventRoutes');
const registrationRoutes = require('./backend/routes/registrationRoutes');

// Create Express application
const app = express();

// Server configuration
const PORT = 3000;

// Check session secret
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    console.error('ERROR: SESSION_SECRET is missing or too short.');
    process.exit(1);
}

// Initialize SQLite database
initializeDatabase();

// Insert sample events if they do not exist
seedEvents();

// Middleware for JSON requests
app.use(express.json({ limit: '10kb' }));

// Middleware for form data
app.use(express.urlencoded({ extended: false }));

// Configure user sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {
        httpOnly: true,
        secure: false, // Local HTTP development only
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Serve frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Authentication endpoints
app.use('/api/auth', authRoutes);

// Event endpoints
app.use('/api/events', eventRoutes);

// Registration endpoints
app.use('/api/registrations', registrationRoutes);

// Temporary homepage until frontend is created
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'CodeAlpha Event Registration System',
        status: 'Server running successfully',
        endpoints: {
            events: '/api/events',
            authentication: '/api/auth',
            registrations: '/api/registrations'
        }
    });
});

// Handle unknown API endpoints
app.use('/api', (req, res) => {
    res.status(404).json({
        error: 'API endpoint not found.'
    });
});

// Global error handler
app.use((error, req, res, next) => {

    const statusCode =
        Number.isInteger(error.statusCode) &&
        error.statusCode >= 400 &&
        error.statusCode <= 599
            ? error.statusCode
            : Number.isInteger(error.status) &&
            error.status >= 400 &&
            error.status <= 599
                ? error.status
                : 500;

    // Log unexpected server errors
    if (statusCode >= 500) {
        console.error('Server error:', error);
    }

    res.status(statusCode).json({
        error: statusCode >= 500
            ? 'Internal server error.'
            : error.message
    });
});

// Start server
app.listen(PORT, () => {

    console.log('');
    console.log('====================================');
    console.log(' CodeAlpha Event Registration System');
    console.log('====================================');
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Events API: http://localhost:${PORT}/api/events`);
    console.log('Database: SQLite');
    console.log('Status: Ready');
    console.log('====================================');
    console.log('');

});