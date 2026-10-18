// ==========================================
// EVENTLY - FRONTEND APPLICATION
// ==========================================

// Application state
const state = {
    user: null,
    events: [],
    registrations: [],
    selectedEventId: null,
    pendingEventId: null,
    activeView: 'events',
    toastTimeout: null
};

// DOM helper
const $ = (id) => document.getElementById(id);


// ==========================================
// API COMMUNICATION
// ==========================================

async function apiRequest(url, options = {}) {

    const response = await fetch(url, {
        ...options,
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(
            data.error || 'Something went wrong. Please try again.'
        );

        error.statusCode = response.status;

        throw error;
    }

    return data;
}


// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Prevent HTML injection when displaying user-controlled data
function escapeHtml(value) {

    return String(value ?? '').replace(
        /[&<>"']/g,
        (character) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[character]
    );
}

// Format event dates
function formatDate(dateString) {

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return 'Date unavailable';
    }

    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Stockholm'
    }).format(date);
}

// Check whether an event has started
function hasEventStarted(event) {

    return new Date(event.date).getTime() <= Date.now();
}

// Get visual information for an event
function getEventCategory(event) {

    const title = event.title.toLowerCase();

    if (title.includes('artificial intelligence') ||
        title.includes('machine learning') ||
        title.includes('ai &')) {

        return {
            icon: '🤖',
            category: 'Artificial Intelligence'
        };
    }

    if (title.includes('cyber') ||
        title.includes('security')) {

        return {
            icon: '🔐',
            category: 'Cybersecurity'
        };
    }

    if (title.includes('game')) {

        return {
            icon: '🎮',
            category: 'Game Development'
        };
    }

    if (title.includes('web') ||
        title.includes('hackathon')) {

        return {
            icon: '💻',
            category: 'Web Development'
        };
    }

    return {
        icon: '🚀',
        category: 'Technology'
    };
}

// Display notifications
function showToast(message, type = 'success') {

    const toast = $('toast');

    clearTimeout(state.toastTimeout);

    toast.textContent = message;

    toast.className = `toast ${type}`;

    toast.hidden = false;

    state.toastTimeout = setTimeout(() => {
        toast.hidden = true;
    }, 4000);
}

// Disable a button while processing a request
function setButtonLoading(button, loading) {

    if (!button) {
        return;
    }

    if (loading) {

        button.dataset.originalText = button.textContent;

        button.disabled = true;

        button.textContent = 'Please wait...';

    } else {

        button.disabled = false;

        button.textContent =
            button.dataset.originalText || button.textContent;
    }
}


// ==========================================
// LOAD EVENTS
// ==========================================

async function loadEvents() {

    try {

        const data = await apiRequest('/api/events');

        state.events = data.events;

        updateStatistics();

        renderEvents();

    } catch (error) {

        $('events-grid').innerHTML = `
            <div class="error-message">
                Unable to load events. Please try again.
            </div>
        `;

        showToast(error.message, 'error');
    }
}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics() {

    const upcomingEvents = state.events.filter(
        event => !hasEventStarted(event)
    );

    const totalSpots = upcomingEvents.reduce(
        (total, event) => total + event.available_spots,
        0
    );

    $('event-count').textContent = upcomingEvents.length;

    $('spot-count').textContent = totalSpots.toLocaleString();
}


// ==========================================
// RENDER EVENT CARDS
// ==========================================

function renderEvents() {

    const grid = $('events-grid');

    const searchTerm = $('event-search')
        .value
        .toLowerCase()
        .trim();

    const filteredEvents = state.events.filter(event => {

        const searchText = [
            event.title,
            event.description,
            event.location
        ].join(' ').toLowerCase();

        return searchText.includes(searchTerm);
    });

    if (filteredEvents.length === 0) {

        grid.innerHTML = `
            <div class="empty-state">
                <h3>No events found</h3>
                <p>Try searching for something else.</p>
            </div>
        `;

        return;
    }

    grid.innerHTML = filteredEvents.map(event => {

        const visual = getEventCategory(event);

        const available = event.available_spots;

        const started = hasEventStarted(event);

        const registered = state.registrations.some(
            registration => registration.event_id === event.id
        );

        let spotsLabel = `${available} spots left`;

        if (started) {
            spotsLabel = 'Event started';
        } else if (registered) {
            spotsLabel = 'Registered ✓';
        } else if (available <= 0) {
            spotsLabel = 'Fully booked';
        }

        return `
            <article class="event-card">

                <div class="event-card-visual">
                    <span class="event-icon">
                        ${visual.icon}
                    </span>
                </div>

                <div class="event-card-body">

                    <span class="event-category">
                        ${visual.category}
                    </span>

                    <h3>${escapeHtml(event.title)}</h3>

                    <p class="event-description">
                        ${escapeHtml(event.description)}
                    </p>

                    <div class="event-meta">

                        <span>
                            📅 ${escapeHtml(formatDate(event.date))}
                        </span>

                        <span>
                            📍 ${escapeHtml(event.location)}
                        </span>

                    </div>

                    <div class="event-card-footer">

                        <div class="spots">

                            <strong>
                                ${escapeHtml(spotsLabel)}
                            </strong>

                            <span>
                                ${event.capacity} total spots
                            </span>

                        </div>

                        <button
                            class="btn btn-primary"
                            type="button"
                            data-action="details"
                            data-event-id="${event.id}">
                            Details →
                        </button>

                    </div>

                </div>

            </article>
        `;

    }).join('');
}


// ==========================================
// EVENT DETAILS
// ==========================================

async function openEventDetails(eventId) {

    const modal = $('event-modal');

    const details = $('event-details');

    const registerButton = $('detail-register-btn');

    state.selectedEventId = eventId;

    details.innerHTML = `
        <p class="loading-message">
            Loading event details...
        </p>
    `;

    registerButton.disabled = true;

    modal.hidden = false;

    try {

        const data = await apiRequest(
            `/api/events/${eventId}`
        );

        const event = data.event;

        const visual = getEventCategory(event);

        const registered = state.registrations.some(
            registration => registration.event_id === event.id
        );

        details.innerHTML = `

            <div class="event-detail-hero">

                <div class="event-detail-icon">
                    ${visual.icon}
                </div>

                <span class="event-category">
                    ${visual.category}
                </span>

                <h2>${escapeHtml(event.title)}</h2>

            </div>

            <p class="event-detail-description">
                ${escapeHtml(event.description)}
            </p>

            <div class="event-detail-meta">

                <p>
                    📅 <strong>Date:</strong>
                    ${escapeHtml(formatDate(event.date))}
                </p>

                <p>
                    📍 <strong>Location:</strong>
                    ${escapeHtml(event.location)}
                </p>

                <p>
                    👥 <strong>Capacity:</strong>
                    ${event.capacity} attendees
                </p>

                <p>
                    🎟️ <strong>Available spots:</strong>
                    ${event.available_spots}
                </p>

            </div>
        `;

        registerButton.disabled = false;

        registerButton.textContent = 'Register for Event';

        if (registered) {

            registerButton.disabled = true;

            registerButton.textContent = 'Already Registered ✓';

        } else if (hasEventStarted(event)) {

            registerButton.disabled = true;

            registerButton.textContent = 'Event Already Started';

        } else if (event.available_spots <= 0) {

            registerButton.disabled = true;

            registerButton.textContent = 'Fully Booked';
        }

    } catch (error) {

        closeEventModal();

        showToast(error.message, 'error');
    }
}

function closeEventModal() {

    $('event-modal').hidden = true;

    state.selectedEventId = null;
}


// ==========================================
// AUTHENTICATION MODAL
// ==========================================

function openAuthModal(mode = 'login') {

    setAuthMode(mode);

    $('auth-modal').hidden = false;
}

function closeAuthModal() {

    $('auth-modal').hidden = true;

    state.pendingEventId = null;
}

function setAuthMode(mode) {

    const isLogin = mode === 'login';

    $('login-form').hidden = !isLogin;

    $('register-form').hidden = isLogin;

    $('show-login').classList.toggle('active', isLogin);

    $('show-register').classList.toggle('active', !isLogin);

    $('auth-modal-title').textContent = isLogin
        ? 'Welcome Back'
        : 'Join Evently';

    $('auth-modal-description').textContent = isLogin
        ? 'Sign in to manage your events.'
        : 'Create your account and discover amazing events.';
}


// ==========================================
// UPDATE AUTHENTICATION UI
// ==========================================

function updateAuthUI() {

    const isLoggedIn = Boolean(state.user);

    $('guest-actions').hidden = isLoggedIn;

    $('user-actions').hidden = !isLoggedIn;

    if (isLoggedIn) {

        $('welcome-text').textContent =
            `Hello, ${state.user.name}`;
    }

    renderEvents();
}


// ==========================================
// REGISTER ACCOUNT
// ==========================================

async function handleRegister(event) {

    event.preventDefault();

    const form = $('register-form');

    const button = form.querySelector(
        'button[type="submit"]'
    );

    const name = $('register-name').value.trim();

    const email = $('register-email').value.trim();

    const password = $('register-password').value;

    setButtonLoading(button, true);

    try {

        const data = await apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        form.reset();

        await completeAuthentication(data.user);

    } catch (error) {

        showToast(error.message, 'error');

    } finally {

        setButtonLoading(button, false);
    }
}


// ==========================================
// LOGIN
// ==========================================

async function handleLogin(event) {

    event.preventDefault();

    const form = $('login-form');

    const button = form.querySelector(
        'button[type="submit"]'
    );

    const email = $('login-email').value.trim();

    const password = $('login-password').value;

    setButtonLoading(button, true);

    try {

        const data = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password
            })
        });

        form.reset();

        await completeAuthentication(data.user);

    } catch (error) {

        showToast(error.message, 'error');

    } finally {

        setButtonLoading(button, false);
    }
}


// ==========================================
// AFTER SUCCESSFUL AUTHENTICATION
// ==========================================

async function completeAuthentication(user) {

    state.user = user;

    const pendingEventId = state.pendingEventId;

    closeAuthModal();

    updateAuthUI();

    showToast(`Welcome, ${user.name}!`);

    await loadRegistrations();

    // Continue event registration after login
    if (pendingEventId !== null) {

        await registerForEvent(pendingEventId);
    }
}


// ==========================================
// LOGOUT
// ==========================================

async function handleLogout() {

    try {

        await apiRequest('/api/auth/logout', {
            method: 'POST'
        });

        state.user = null;

        state.registrations = [];

        updateAuthUI();

        showView('events');

        showToast('Logged out successfully.');

    } catch (error) {

        showToast(error.message, 'error');
    }
}


// ==========================================
// REGISTER FOR EVENT
// ==========================================

async function registerForEvent(eventId) {

    // User must be authenticated
    if (!state.user) {

        state.pendingEventId = eventId;

        closeEventModal();

        openAuthModal('login');

        showToast(
            'Please log in to register for this event.',
            'error'
        );

        return;
    }

    try {

        await apiRequest('/api/registrations', {
            method: 'POST',
            body: JSON.stringify({
                eventId
            })
        });

        closeEventModal();

        await Promise.all([
            loadEvents(),
            loadRegistrations()
        ]);

        showToast('Successfully registered for the event!');

    } catch (error) {

        showToast(error.message, 'error');

        if (error.statusCode === 401) {

            state.user = null;

            state.registrations = [];

            updateAuthUI();
        }
    }
}


// ==========================================
// LOAD MY REGISTRATIONS
// ==========================================

async function loadRegistrations() {

    if (!state.user) {

        state.registrations = [];

        return;
    }

    try {

        const data = await apiRequest(
            '/api/registrations'
        );

        state.registrations = data.registrations;

        renderRegistrations();

        renderEvents();

    } catch (error) {

        $('registrations-grid').innerHTML = `
            <div class="error-message">
                Could not load registrations.
            </div>
        `;

        showToast(error.message, 'error');
    }
}


// ==========================================
// RENDER MY REGISTRATIONS
// ==========================================

function renderRegistrations() {

    const grid = $('registrations-grid');

    if (state.registrations.length === 0) {

        grid.innerHTML = `

            <div class="empty-state">

                <h3>No Registrations Yet</h3>

                <p>
                    You haven't registered for any events.
                    Explore upcoming events and reserve your spot!
                </p>

                <button
                    class="btn btn-primary"
                    type="button"
                    data-view="events">
                    Explore Events →
                </button>

            </div>
        `;

        return;
    }

    grid.innerHTML = state.registrations.map(registration => {

        const visual = getEventCategory(registration);

        return `

            <article class="registration-card">

                <div>

                    <span class="event-category">
                        ${visual.icon} ${visual.category}
                    </span>

                    <h3>
                        ${escapeHtml(registration.title)}
                    </h3>

                    <p>
                        📅 ${escapeHtml(formatDate(registration.date))}
                    </p>

                    <p>
                        📍 ${escapeHtml(registration.location)}
                    </p>

                    <p>
                        ✅ Registration confirmed
                    </p>

                </div>

                <button
                    class="btn btn-danger"
                    type="button"
                    data-action="cancel"
                    data-registration-id="${registration.id}">
                    Cancel Registration
                </button>

            </article>
        `;

    }).join('');
}


// ==========================================
// CANCEL REGISTRATION
// ==========================================

async function cancelRegistration(registrationId) {

    const confirmed = window.confirm(
        'Are you sure you want to cancel this registration?'
    );

    if (!confirmed) {
        return;
    }

    try {

        await apiRequest(
            `/api/registrations/${registrationId}`,
            {
                method: 'DELETE'
            }
        );

        await Promise.all([
            loadRegistrations(),
            loadEvents()
        ]);

        showToast('Registration cancelled successfully.');

    } catch (error) {

        showToast(error.message, 'error');
    }
}


// ==========================================
// NAVIGATION
// ==========================================

function showView(view) {

    if (view === 'registrations' && !state.user) {

        openAuthModal('login');

        showToast(
            'Please log in to view your registrations.',
            'error'
        );

        return;
    }

    state.activeView = view;

    $('events-view').hidden = view !== 'events';

    $('registrations-view').hidden =
        view !== 'registrations';

    document.querySelectorAll('.nav-link').forEach(button => {

        button.classList.toggle(
            'active',
            button.dataset.view === view
        );
    });

    if (view === 'registrations') {

        loadRegistrations();
    }

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


// ==========================================
// INITIALIZE APPLICATION
// ==========================================

async function initializeApp() {

    try {

        // Restore existing login session
        const data = await apiRequest('/api/auth/me');

        state.user = data.user;

    } catch (error) {

        state.user = null;
    }

    updateAuthUI();

    await Promise.all([
        loadEvents(),
        state.user
            ? loadRegistrations()
            : Promise.resolve()
    ]);
}


// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {

    // Navigation
    document.addEventListener('click', event => {

        const navigationButton = event.target.closest(
            '[data-view]'
        );

        if (navigationButton) {

            showView(navigationButton.dataset.view);
        }
    });


    // Open login modal
    $('open-login-btn').addEventListener('click', () => {

        openAuthModal('login');
    });


    // Open registration modal
    $('open-register-btn').addEventListener('click', () => {

        openAuthModal('register');
    });


    // Close authentication modal
    $('close-auth-modal').addEventListener('click', () => {

        closeAuthModal();
    });


    // Switch authentication forms
    $('show-login').addEventListener('click', () => {

        setAuthMode('login');
    });

    $('show-register').addEventListener('click', () => {

        setAuthMode('register');
    });


    // Authentication forms
    $('login-form').addEventListener(
        'submit',
        handleLogin
    );

    $('register-form').addEventListener(
        'submit',
        handleRegister
    );


    // Logout
    $('logout-btn').addEventListener(
        'click',
        handleLogout
    );


    // Event search
    $('event-search').addEventListener(
        'input',
        renderEvents
    );


    // Event card buttons
    $('events-grid').addEventListener('click', event => {

        const button = event.target.closest(
            '[data-action="details"]'
        );

        if (button) {

            const eventId = Number(button.dataset.eventId);

            openEventDetails(eventId);
        }
    });


    // Close event details
    $('close-event-modal').addEventListener('click', () => {

        closeEventModal();
    });


    // Register from event details
    $('detail-register-btn').addEventListener('click', () => {

        if (state.selectedEventId !== null) {

            registerForEvent(state.selectedEventId);
        }
    });


    // Cancel registration
    $('registrations-grid').addEventListener('click', event => {

        const button = event.target.closest(
            '[data-action="cancel"]'
        );

        if (button) {

            const registrationId = Number(
                button.dataset.registrationId
            );

            cancelRegistration(registrationId);
        }
    });


    // Close modals by clicking outside
    $('auth-modal').addEventListener('click', event => {

        if (event.target === $('auth-modal')) {

            closeAuthModal();
        }
    });

    $('event-modal').addEventListener('click', event => {

        if (event.target === $('event-modal')) {

            closeEventModal();
        }
    });


    // Close modals using Escape
    document.addEventListener('keydown', event => {

        if (event.key === 'Escape') {

            closeAuthModal();

            closeEventModal();
        }
    });
}


// ==========================================
// START APPLICATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    setupEventListeners();

    initializeApp();
});