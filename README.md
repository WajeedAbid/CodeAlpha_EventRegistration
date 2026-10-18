# Evently - Event Registration System

A full-stack Event Registration System developed as part of the
**CodeAlpha Backend Development Internship**.

Evently is a web application that allows users to discover upcoming
events, create accounts, register for events, and manage their
registrations through a modern and responsive interface.

The project is built using **Node.js, Express.js, JavaScript, and SQLite**
and follows a structured **Three-Layer Architecture**.

---

## Features

### Event Management
- Browse available events.
- View detailed event information.
- Search events by title, description, or location.
- View event capacity and available spots.
- Prevent registration for events that have already started.
- Prevent registrations when an event is fully booked.

### User Authentication
- Create user accounts.
- Secure password hashing using bcryptjs.
- Log in and log out.
- Session-based authentication using express-session.
- Access personal account information.
- Input validation and duplicate email prevention.

### Event Registration
- Register for available events.
- View personal registrations.
- Cancel existing registrations.
- Prevent duplicate event registrations.
- Automatically update available event capacity.
- Restrict users to managing their own registrations.

### Frontend
- Modern dark-themed user interface.
- Responsive design for desktop and mobile devices.
- Dynamic event cards.
- Event details modal.
- Login and registration forms.
- Personal registration dashboard.
- Search functionality.
- Success and error notifications.

---

## Technologies Used

### Backend
- Node.js
- Express.js
- JavaScript (CommonJS)
- SQLite
- better-sqlite3

### Authentication
- bcryptjs
- express-session
- dotenv

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Fetch API

### Development Tools
- JetBrains WebStorm
- Git
- GitHub
- Windows PowerShell

---

## Three-Layer Architecture

The backend follows a Three-Layer Architecture to separate
responsibilities and improve code organization and maintainability.

### 1. Routes Layer (Presentation Layer)

Handles incoming HTTP requests and sends HTTP responses.

Responsibilities:
- Define REST API endpoints.
- Extract request parameters and request bodies.
- Call the appropriate service functions.
- Return JSON responses and HTTP status codes.
- Apply authentication middleware.

### 2. Service Layer (Business Logic Layer)

Contains the application's business logic.

Responsibilities:
- Validate user input.
- Authenticate users.
- Check event availability.
- Prevent duplicate registrations.
- Prevent registration for past events.
- Manage registration and cancellation rules.

### 3. Repository Layer (Data Access Layer)

Handles database operations.

Responsibilities:
- Execute SQL queries.
- Create and retrieve users.
- Retrieve events.
- Create and delete event registrations.
- Retrieve user-specific registrations.
- Calculate event registration statistics.

### Application Flow

```text
                  CLIENT / BROWSER
                         |
                         |
                    HTTP REQUEST
                         |
                         v
                +------------------+
                |  EXPRESS SERVER  |
                |     index.js     |
                +------------------+
                         |
                         v
                +------------------+
                |   ROUTES LAYER   |
                |                  |
                |    authRoutes    |
                |    eventRoutes   |
                | registrationRoutes|
                +------------------+
                         |
                         v
                +------------------+
                |  SERVICE LAYER   |
                |                  |
                |   authService    |
                |   eventService   |
                | registrationService|
                +------------------+
                         |
                         v
                +------------------+
                | REPOSITORY LAYER |
                |                  |
                |  userRepository  |
                |  eventRepository |
                |registrationRepository|
                +------------------+
                         |
                         v
                +------------------+
                | SQLITE DATABASE  |
                |   events.sqlite  |
                +------------------+
```

Authentication middleware protects endpoints that require login.

---

## Project Structure

```text
CodeAlpha_EventRegistration/
│
├── backend/
│   │
│   ├── database/
│   │   ├── database.js
│   │   ├── schema.js
│   │   └── seed.js
│   │
│   ├── repositories/
│   │   ├── userRepository.js
│   │   ├── eventRepository.js
│   │   └── registrationRepository.js
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── eventService.js
│   │   └── registrationService.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   └── registrationRoutes.js
│   │
│   └── middleware/
│       └── requireAuth.js
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── index.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

The SQLite database file and the `.env` configuration file are
generated locally and excluded from version control.

---

## Database Design

The application uses SQLite for persistent data storage.

Three main tables are used.

### Users

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| name | TEXT | User's full name |
| email | TEXT | Unique email address |
| password_hash | TEXT | Hashed password |
| created_at | TEXT | Account creation timestamp |

### Events

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| title | TEXT | Event title |
| description | TEXT | Event description |
| date | TEXT | Event date and time |
| location | TEXT | Event location |
| capacity | INTEGER | Maximum participants |
| created_at | TEXT | Event creation timestamp |

### Registrations

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| user_id | INTEGER | Foreign key referencing users |
| event_id | INTEGER | Foreign key referencing events |
| created_at | TEXT | Registration timestamp |

### Database Relationships

```text
USERS (1) -------- (*) REGISTRATIONS (*) -------- (1) EVENTS
```

A user can register for multiple events.

An event can have multiple registered users.

The registrations table connects users and events.

A UNIQUE constraint on `(user_id, event_id)` prevents
duplicate registrations.

Foreign key constraints maintain referential integrity.

---

## Installation and Setup

### Prerequisites

Install the following software:

- Node.js (version 24.x recommended)
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/WajeedAbid/CodeAlpha_EventRegistration.git
```

Navigate to the project directory:

```bash
cd CodeAlpha_EventRegistration
```

### 2. Install Dependencies

```bash
npm install
```

For a reproducible installation using the existing lockfile,
you can use:

```bash
npm ci
```

On Windows PowerShell, use `npm.cmd` if PowerShell blocks npm scripts:

```powershell
npm.cmd ci
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

Add the following variable:

```env
SESSION_SECRET=replace_with_a_long_random_secret
```

Generate a secure session secret using Node.js:

```powershell
node -e "console.log('SESSION_SECRET=' + require('node:crypto').randomBytes(32).toString('hex'))" | Set-Content -Encoding ascii .env
```

Run this command only when creating a new `.env` file,
as it overwrites an existing one.

Never commit the `.env` file to GitHub.

### 4. Start the Application

```bash
node index.js
```

The server starts at:

http://localhost:3000

### 5. Open the Application

Open your browser and navigate to:

http://localhost:3000

The application automatically initializes the SQLite database
and inserts sample events if they do not already exist.

No external database server or Docker installation is required.

---

## REST API Documentation

The backend provides REST API endpoints for authentication,
events, and registrations.

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create a new account |
| POST | /api/auth/login | Log in |
| POST | /api/auth/logout | Log out |
| GET | /api/auth/me | Get the current authenticated user |

#### Register User

**POST** `/api/auth/register`

Request:

```json
{
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "DemoPassword123!"
}
```

Successful response: `201 Created`

```json
{
  "message": "Account created successfully.",
  "user": {
    "id": 1,
    "name": "Demo User",
    "email": "demo@example.com",
    "created_at": "2026-10-18 10:00:00"
  }
}
```

The user is automatically logged in after registration.

#### Login

**POST** `/api/auth/login`

Request:

```json
{
  "email": "demo@example.com",
  "password": "DemoPassword123!"
}
```

Successful response: `200 OK`

The server creates an authenticated session.

#### Logout

**POST** `/api/auth/logout`

Destroys the current session.

#### Current User

**GET** `/api/auth/me`

Returns the current authenticated user or `null` if
no valid authenticated session exists.

---

### Event Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/events | Retrieve all events |
| GET | /api/events/:id | Retrieve event details |

These endpoints are publicly accessible.

#### Get All Events

**GET** `/api/events`

Response:

```json
{
  "events": [
    {
      "id": 1,
      "title": "Tech Conference 2026",
      "description": "Join developers and technology enthusiasts.",
      "date": "2026-10-29T17:00:00Z",
      "location": "Stockholm, Sweden",
      "capacity": 150,
      "registered_count": 0,
      "available_spots": 150
    }
  ]
}
```

The example above is shortened for readability.

#### Get Event Details

**GET** `/api/events/1`

Returns detailed information about event ID 1.

---

### Registration Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | /api/registrations | Register for an event | Required |
| GET | /api/registrations | View personal registrations | Required |
| DELETE | /api/registrations/:id | Cancel a registration | Required |

#### Register for an Event

**POST** `/api/registrations`

Request:

```json
{
  "eventId": 1
}
```

Successful response: `201 Created`

```json
{
  "message": "Registered for event successfully.",
  "registration": {
    "id": 1,
    "user_id": 1,
    "event_id": 1,
    "created_at": "2026-10-18 10:30:00"
  }
}
```

The user ID is obtained from the authenticated session.

It is not supplied by the client.

#### View My Registrations

**GET** `/api/registrations`

Returns all event registrations belonging to
the currently authenticated user.

#### Cancel Registration

**DELETE** `/api/registrations/1`

Successful response:

```json
{
  "message": "Registration cancelled successfully."
}
```

Only the owner of a registration can cancel it.

---

## Security and Validation

The application implements the following security measures:

- Password hashing with bcryptjs.
- Session-based authentication.
- HTTP-only session cookies.
- Input validation.
- Parameterized SQL queries.
- Foreign key constraints.
- Unique registration constraints.
- Protection against duplicate registrations.
- Registration capacity validation.
- User ownership verification before cancellation.
- HTML escaping when rendering event information.
- Environment variables for sensitive configuration.

### HTTP Error Handling

The API uses standard HTTP status codes:

| Status | Meaning |
|--------|---------|
| 200 | Successful request |
| 201 | Resource created |
| 400 | Invalid request |
| 401 | Authentication required |
| 404 | Resource not found |
| 409 | Conflict or duplicate registration |
| 500 | Internal server error |

Errors are returned as JSON:

```json
{
  "error": "You are already registered for this event."
}
```

### Development Environment

The project is designed for local development and demonstration.

Session data is stored in memory using the default
express-session MemoryStore.

User accounts and event registrations are stored persistently
in SQLite.

For a production deployment, additional security configuration,
CSRF protection, HTTPS, and a persistent session store
would be required.

---

## Testing

The application has been tested locally using
PowerShell HTTP requests and browser-based interaction.

### Backend Tests

- SQLite database initialization.
- Sample data insertion.
- Repository data retrieval.
- User registration.
- User authentication.
- Invalid login rejection.
- Event listing and event details.
- Event registration.
- Duplicate registration prevention.
- User-specific registration retrieval.
- Unauthorized cancellation prevention.
- Successful registration cancellation.

### Frontend Tests

- Displaying available events.
- Searching events.
- Viewing event details.
- Creating user accounts.
- Logging in and out.
- Registering for events.
- Viewing personal registrations.
- Cancelling registrations.
- Updating available spots.
- Verifying persistence after restarting the server.

---

## Sample Events

The application includes five example events:

1. Tech Conference 2026 - Stockholm
2. AI & Machine Learning Workshop - Stockholm
3. Cybersecurity Bootcamp - Gothenburg
4. Game Development Meetup - Malmo
5. Web Development Hackathon - Online

Sample events are automatically inserted when the application
starts, without duplicating existing sample records.

---

## Project Purpose

This project was developed to demonstrate practical backend
development skills, including:

- REST API development.
- Database design and SQL operations.
- Three-Layer Architecture.
- Authentication and session management.
- Business logic implementation.
- Input validation and error handling.
- Frontend and backend integration.
- Git version control.

The project fulfills the core requirements of
**CodeAlpha Backend Development Internship - Task 2:
Event Registration System**.

---

## Author

**Wajeed Abid**

Backend Development Intern - CodeAlpha

GitHub: https://github.com/WajeedAbid

Project Repository:
https://github.com/WajeedAbid/CodeAlpha_EventRegistration

---

##  License

No license has been specified for this project.
All rights reserved.