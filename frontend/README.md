# Task Manager — Frontend

React + Vite + Tailwind CSS frontend for the Task Manager application.

---

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS v3
- **Routing:** React Router v6
- **HTTP Client:** Axios (with cookie support)
- **Notifications:** react-hot-toast

---

## Features

- JWT auth via HTTP-only cookies (auto-sent on every request)
- Protected routes — redirect to `/login` if not authenticated
- Dashboard with task grid (3 columns on desktop)
- Create task modal
- Inline task editing (click edit icon on hover)
- Quick status change buttons on each card
- Search tasks by title (debounced 400ms)
- Filter tasks by status (All / To Do / In Progress / Done)
- Pagination with Prev / Next controls
- Stats bar (counts per status)
- Toast notifications for all CRUD actions
- Fully dark themed (slate-950 base)

---

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.sample .env
# Edit VITE_API_URL if backend runs on a different port

# 3. Start dev server
npm run dev       # runs on http://localhost:3000

# 4. Build for production
npm run build     # outputs to dist/
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000/api/v1` |

---

## Project Structure

```
src/
├── App.jsx                  → Router setup (public + protected)
├── main.jsx                 → React entry, Toaster config
├── index.css                → Tailwind directives + custom component classes
├── lib/
│   └── axios.js             → Axios instance with baseURL + 401 interceptor
├── context/
│   └── AuthContext.jsx      → Global auth state (login/logout/register/me)
├── components/
│   ├── ProtectedRoute.jsx   → Redirects to /login if unauthenticated
│   ├── Navbar.jsx           → Top bar with username + logout
│   ├── TaskCard.jsx         → Task display, inline edit, quick status change
│   └── CreateTaskModal.jsx  → Modal form for new task creation
└── pages/
    ├── LoginPage.jsx        → Sign in form
    ├── RegisterPage.jsx     → Sign up form
    └── DashboardPage.jsx    → Main view: stats, search, filter, task grid, pagination
```

---

## Deployment (Vercel)

1. Push frontend folder to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set environment variable: `VITE_API_URL` → your deployed backend URL
4. Deploy — Vercel auto-detects Vite

> Make sure backend `CORS_ORIGIN` is set to your Vercel frontend URL.
