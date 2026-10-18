const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

// Create an error with an HTTP status code
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

// Validate and normalize an email address
function validateEmail(email) {

    if (typeof email !== 'string') {
        throw createError('A valid email address is required.', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
        normalizedEmail.length > 254 ||
        !emailRegex.test(normalizedEmail)
    ) {
        throw createError('Invalid email address.', 400);
    }

    return normalizedEmail;
}

// Validate a user's name
function validateName(name) {

    if (typeof name !== 'string') {
        throw createError('Name is required.', 400);
    }

    const normalizedName = name.trim();

    if (normalizedName.length < 2 || normalizedName.length > 100) {
        throw createError(
            'Name must contain between 2 and 100 characters.',
            400
        );
    }

    return normalizedName;
}

// Validate a password
function validatePassword(password) {

    if (typeof password !== 'string' || password.length < 8) {
        throw createError(
            'Password must contain at least 8 characters.',
            400
        );
    }

    if (Buffer.byteLength(password, 'utf8') > 72) {
        throw createError(
            'Password is too long.',
            400
        );
    }
}

// Register a new user
async function registerUser({ name, email, password } = {}) {

    // Validate user input
    const validatedName = validateName(name);
    const validatedEmail = validateEmail(email);

    validatePassword(password);

    // Check if email is already registered
    const existingUser = userRepository.findByEmail(validatedEmail);

    if (existingUser) {
        throw createError('Email is already registered.', 409);
    }

    // Hash password before storing it
    const passwordHash = await bcrypt.hash(password, 12);

    try {

        // Save user in database
        const newUser = userRepository.createUser(
            validatedName,
            validatedEmail,
            passwordHash
        );

        return newUser;

    } catch (error) {

        // Handle duplicate email caused by concurrent requests
        if (
            error.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
            error.code === 'SQLITE_CONSTRAINT'
        ) {
            throw createError('Email is already registered.', 409);
        }

        throw error;
    }
}

// Authenticate an existing user
async function loginUser({ email, password } = {}) {

    if (
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        password.length === 0
    ) {
        throw createError('Invalid email or password.', 401);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const user = userRepository.findByEmail(normalizedEmail);

    if (!user) {
        throw createError('Invalid email or password.', 401);
    }

    // Compare password with stored hash
    const passwordMatches = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!passwordMatches) {
        throw createError('Invalid email or password.', 401);
    }

    // Return user without password hash
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
    };
}

// Export service functions
module.exports = {
    registerUser,
    loginUser
};