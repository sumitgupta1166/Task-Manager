# Task Manager — Backend API

A production-ready REST API for task management with JWT authentication, AES payload encryption, pagination, filtering, and search.

---

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js v4
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** JWT (access + refresh token pattern)
- **Security:** bcrypt, HTTP-only cookies, AES encryption, rate limiting, express-validator

---

## Architecture

```
src/
├── server.js          → Entry point: DB connect → server start
├── app.js             → Express setup: CORS, middleware, routes, error handler
├── constants.js       → Shared enums and config (task statuses, cookie options)
├── db/index.js        → Mongoose connection
├── models/            → MongoDB schemas (User, Task)
├── controllers/       → Business logic (auth, task CRUD)
├── routes/            → Route definitions with validation rules
├── middlewares/       → JWT auth, error handler, input validator
└── utils/             → ApiError, ApiResponse, asyncHandler, AES encrypt
```

**Request lifecycle:**
```
Client → Rate Limiter → CORS → Body Parser → Route →
Validate Middleware → Auth Middleware (if protected) →
Controller → Mongoose → ApiResponse → Client
                                  ↘ (on error) → errorHandler
```

---

## Local Setup

```bash
# 1. Clone and install
git clone <your-repo-url>
cd backend
npm install

# 2. Configure environment
cp .env.sample .env
# Fill in your values (see .env.sample)

# 3. Run in development
npm run dev

# 4. Run in production
npm start
```

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `8000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `DB_NAME` | Database name | `task_manager` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` |
| `ACCESS_TOKEN_SECRET` | JWT access token secret | random 64-char string |
| `ACCESS_TOKEN_EXPIRY` | Access token expiry | `15m` |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret | random 64-char string |
| `REFRESH_TOKEN_EXPIRY` | Refresh token expiry | `7d` |
| `AES_SECRET_KEY` | AES encryption key | random 32-char string |
| `NODE_ENV` | Environment | `development` / `production` |

---

## API Reference

**Base URL:** `http://localhost:8000/api/v1`

### Auth Endpoints

#### POST `/auth/register`
Register a new user.

**Request:**
```json
{
  "username": "sumit_dev",
  "email": "sumit@example.com",
  "password": "secret123"
}
```
**Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "_id": "664f...",
    "username": "sumit_dev",
    "email": "sumit@example.com",
    "createdAt": "2024-06-01T10:00:00.000Z"
  }
}
```

---

#### POST `/auth/login`
Login and receive tokens (set as HTTP-only cookies).

**Request:**
```json
{
  "email": "sumit@example.com",
  "password": "secret123"
}
```
**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": { "_id": "664f...", "username": "sumit_dev", "email": "sumit@example.com" },
    "accessToken": "eyJhbGci..."
  }
}
```

---

#### POST `/auth/logout` 🔒
Clears cookies and invalidates refresh token.

**Response (200):**
```json
{ "success": true, "statusCode": 200, "message": "Logged out successfully", "data": null }
```

---

#### GET `/auth/me` 🔒
Get currently logged-in user.

**Response (200):**
```json
{
  "success": true,
  "data": { "_id": "664f...", "username": "sumit_dev", "email": "sumit@example.com" }
}
```

---

#### POST `/auth/refresh-token`
Get new access token using refresh token cookie.

---

### Task Endpoints 🔒 (All require authentication)

#### POST `/tasks`
Create a new task.

**Request:**
```json
{
  "title": "Fix login bug",
  "description": "JWT cookie not being set on Safari",
  "status": "todo"
}
```
**Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Task created successfully",
  "data": {
    "_id": "665a...",
    "title": "Fix login bug",
    "description": "U2FsdGVk...",
    "status": "todo",
    "owner": "664f...",
    "createdAt": "2024-06-01T11:00:00.000Z"
  }
}
```
> Note: `description` is AES-encrypted in the create response.

---

#### GET `/tasks`
Get all tasks for the logged-in user with pagination, filtering, and search.

**Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max 50) |
| `status` | string | — | Filter: `todo`, `in-progress`, `done` |
| `search` | string | — | Search by title (case-insensitive) |
| `sortBy` | string | `createdAt` | Sort field |
| `sortOrder` | string | `desc` | `asc` or `desc` |

**Example:** `GET /tasks?status=todo&search=bug&page=1&limit=5`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tasks": [ { "_id": "665a...", "title": "Fix login bug", "status": "todo", ... } ],
    "pagination": {
      "total": 23,
      "page": 1,
      "limit": 5,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

#### GET `/tasks/:id`
Get a single task by ID.

**Response (200):**
```json
{
  "success": true,
  "data": { "_id": "665a...", "title": "Fix login bug", "status": "todo", "description": "JWT cookie...", "owner": "664f..." }
}
```

---

#### PATCH `/tasks/:id`
Update a task (partial update — send only fields to change).

**Request:**
```json
{ "status": "in-progress" }
```

---

#### DELETE `/tasks/:id`
Delete a task.

**Response (200):**
```json
{ "success": true, "data": { "id": "665a..." }, "message": "Task deleted successfully" }
```

---

### Error Response Format

All errors follow this structure:
```json
{
  "success": false,
  "message": "Human readable error message",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

**HTTP Status Codes used:**

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden (wrong owner) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## Security Measures

- Passwords hashed with bcrypt (12 salt rounds)
- JWT stored in HTTP-only, Secure, SameSite cookies
- Access token: 15min expiry | Refresh token: 7d expiry
- AES-256 encryption on task description in responses
- Rate limiting: 200 req/15min global, 20 req/15min on auth routes
- Input validation and sanitization via express-validator
- Authorization check: users can only access their own tasks
- MongoDB injection prevention via Mongoose schema typing
- Environment variables via dotenv (never hardcoded)

---

## Deployment (Render / Railway)

1. Push code to GitHub
2. Create new Web Service on Render/Railway
3. Set environment variables from `.env.sample`
4. Build command: `npm install`
5. Start command: `npm start`
