# Airth Job Dashboard

A full-stack job management application with a React frontend and a Node.js/Express backend backed by SQLite.

## Live Application

- Frontend: https://airth-assignment-ibxt.vercel.app/
- Backend API: https://airth-assignment-1.onrender.com/

## Features

- View all jobs
- Create a job with a title and type
- Filter jobs by status
- Move jobs through controlled statuses:
  - `pending` -> `running`
  - `running` -> `completed` or `failed`
- Delete jobs
- SQLite persistence
- JSON API with CORS enabled for the deployed frontend
- Graceful backend shutdown on `SIGINT` and `SIGTERM`

## Tech Stack

### Frontend

- React 19
- Vite
- JavaScript

### Backend

- Node.js 22
- Express 5
- SQLite3
- dotenv
- CORS

## Project Structure

```text
.
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controller/jobs_controller.js
│   │   ├── models/jobs.js
│   │   ├── routes/jobs_route.js
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
└── README.md
```

## Requirements

- Node.js 22.x
- npm

## Installation

Clone the repository and enter the project directory:

```bash
git clone https://github.com/ayushman1210/airth_assignment.git
cd airth_assignment
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## Run Locally

Start the backend in one terminal:

```bash
cd backend
npm start
```

The backend runs at `http://localhost:3000` by default. A different port can be provided through the `PORT` environment variable:

```bash
PORT=4000 npm start
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

The frontend runs at the local Vite URL shown in the terminal, usually `http://localhost:5173`.

During local development, Vite proxies `/api` requests to the backend. The deployed frontend uses `VITE_API_URL` when it is configured, and otherwise points to the deployed Render backend.

## Frontend Commands

Run these commands from `frontend/`:

```bash
npm run dev       # Start the Vite development server
npm run build     # Create a production build
npm run lint      # Run ESLint
npm run preview   # Preview the production build locally
```

## Backend Commands

Run these commands from `backend/`:

```bash
npm start         # Start the backend
npm run dev       # Start the backend in development mode
```

The SQLite database is created as `jobs.db` in the backend working directory when the backend starts. The database schema is initialized automatically.

## API Endpoints

Base URL: `http://localhost:3000` locally or `https://airth-assignment-1.onrender.com` in production.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Health check |
| `GET` | `/jobs` | List all jobs |
| `POST` | `/jobs` | Create a job |
| `PATCH` | `/jobs/:id/status` | Update a job status |
| `DELETE` | `/jobs/:id` | Delete a job |

Create a job:

```bash
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -d '{"title":"Backend Developer","type":"Full-time"}'
```

Update a job status:

```bash
curl -X PATCH http://localhost:3000/jobs/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"running"}'
```

## Graceful Shutdown

The backend registers handlers for `SIGINT` and `SIGTERM`. When the process receives either signal, the shutdown flow:

1. Prevents the shutdown handler from running more than once.
2. Stops the HTTP server from accepting new connections by calling `server.close()`.
3. Closes the SQLite database connection after the server has stopped.
4. Exits with a success code when cleanup is complete, or an error code if the database cannot be closed.

This is useful during local termination, container shutdowns, and platform redeployments. It gives active server resources time to close cleanly and reduces the risk of leaving database connections open or interrupting persistence operations.

## Framework Note

The assignment requirement mentioned NestJS. This implementation uses Node.js with Express instead. I made that choice because the core backend architecture remains the same: routes receive requests, controllers handle application behavior, models manage persistence, and the server coordinates middleware and lifecycle management.

NestJS provides a structured framework around these same backend concepts. The current Express implementation can be adapted to NestJS by moving the routes into Nest controllers, business logic into providers/services, database access into an injectable repository or service, and application startup/shutdown into Nest lifecycle hooks. The framework is an implementation detail; the overall backend architecture and API behavior are the important foundations.

Thank you to the Airth team for this valuable opportunity.
