# Task Manager — Full Stack Application

A production-ready task management app built with Node.js + Express (backend) and React + Vite + Tailwind CSS (frontend).

---

## Architecture Overview

```
task-manager/
├── backend/       → Node.js + Express + MongoDB REST API
└── frontend/      → React + Vite + Tailwind CSS SPA
```

```
Client (React SPA)
      ↕  HTTP + cookies
  Vite Dev Server (:3000)  →  proxy /api  →  Express (:8000)
                                                  ↕
                                             MongoDB Atlas
```

---

## Quick Start (Local)

### 1. Backend
```bash
cd backend
npm install
cp .env.sample .env        # fill MongoDB URI + secrets
npm run dev                # http://localhost:8000
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.sample .env        # VITE_API_URL=http://localhost:8000/api/v1
npm run dev                # http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | ❌ | Register |
| POST | `/api/v1/auth/login` | ❌ | Login + set cookies |
| POST | `/api/v1/auth/logout` | ✅ | Logout |
| GET | `/api/v1/auth/me` | ✅ | Current user |
| POST | `/api/v1/auth/refresh-token` | ❌ | Refresh access token |
| POST | `/api/v1/tasks` | ✅ | Create task |
| GET | `/api/v1/tasks` | ✅ | List tasks (search, filter, paginate) |
| GET | `/api/v1/tasks/:id` | ✅ | Get task |
| PATCH | `/api/v1/tasks/:id` | ✅ | Update task |
| DELETE | `/api/v1/tasks/:id` | ✅ | Delete task |
| GET | `/api/v1/health` | ❌ | Health check |

---

## Deployment

| Service | What to deploy |
|---------|----------------|
| **Render / Railway** | `backend/` — set all env vars from `.env.sample` |
| **Vercel** | `frontend/` — set `VITE_API_URL` to deployed backend URL |

> After deploying backend, update `CORS_ORIGIN` in backend env to your Vercel frontend URL.

---

## Security Features

- Passwords hashed with bcrypt (12 rounds)
- JWT in HTTP-only + Secure cookies
- AES-256 payload encryption (task description on create)
- Rate limiting (200/15min global, 20/15min on auth)
- Input validation via express-validator
- Authorization: users access only their own tasks
- Environment variables via dotenv — nothing hardcoded
