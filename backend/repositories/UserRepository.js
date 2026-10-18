const db = require('../database/database');

// SQL statements
const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash)
    VALUES (?, ?, ?)
`);

const selectUserByEmail = db.prepare(`
    SELECT id, name, email, password_hash, created_at
    FROM users
    WHERE email = ?
`);

const selectUserById = db.prepare(`
    SELECT id, name, email, created_at
    FROM users
    WHERE id = ?
`);

// Create a new user
function createUser(name, email, passwordHash) {

    const result = insertUser.run(
        name,
        email,
        passwordHash
    );

    return findById(result.lastInsertRowid);
}

// Find a user by email
function findByEmail(email) {

    return selectUserByEmail.get(email) || null;
}

// Find a user by ID
function findById(id) {

    return selectUserById.get(id) || null;
}

// Export repository functions
module.exports = {
    createUser,
    findByEmail,
    findById
};