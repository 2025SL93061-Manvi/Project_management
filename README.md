# Enterprise Project Management System

A full-stack web application for managing projects, tasks, milestones, meetings, and team collaboration in an enterprise environment.

## Tech Stack

**Frontend:** React 18, React Router v6, Axios, TailwindCSS, Radix UI, Lucide React

**Backend:** Spring Boot 3.2.4 (Java 17), Spring Security + JWT, Spring Data JPA, MySQL

**Integrations:** Google Calendar API, Resend (email notifications)

## Features

- **Authentication** — JWT-based auth via HTTP-only cookies
- **Project Management** — Create, view, update, and delete projects with status tracking
- **Task Management** — Tasks with priorities (LOW/MEDIUM/HIGH) and status workflows
- **Milestones** — Track key deliverables and completion progress
- **Meetings** — Schedule meetings with Google Meet integration
- **Calendar** — Work calendar synced with Google Calendar
- **File Storage** — Upload and manage project files (10 MB limit per file)
- **Reports** — Generate and view project reports
- **Activity Log** — Full audit trail of project activities
- **Notifications** — In-app and email notifications with scheduled reminders
- **Complaints** — Complaint submission and tracking system
- **Admin Panel** — User management and system administration

## Project Structure

```
.
├── backend/          # Spring Boot REST API
│   └── src/main/java/com/enterprisepm/
│       ├── controller/   # 14 REST controllers
│       ├── service/      # Business logic
│       ├── model/        # JPA entities (User, Project, Task, ...)
│       ├── dto/          # Data transfer objects
│       ├── repository/   # Spring Data repositories
│       ├── config/       # Spring configuration
│       └── security/     # JWT & auth
└── frontend/         # React SPA
    └── src/
        ├── components/   # Feature components (auth, projects, tasks, ...)
        ├── services/     # Axios API modules
        ├── context/      # Auth state (React Context)
        └── lib/          # Utilities
```

## Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8+
- Maven 3.8+

## Setup

### 1. Database

Create a MySQL database and note the connection details.

### 2. Backend

Create `backend/.env` (or set environment variables):

```env
DB_URL=jdbc:mysql://localhost:3306/enterprise_pm?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=root

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400000

RESEND_API_KEY=your_resend_api_key
RESEND_FROM=noreply@yourdomain.com

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
```

Start the backend:

```bash
cd backend
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

The app will be available at `http://localhost:3000`.

## API

All endpoints are prefixed with `/api`. The backend exposes REST controllers for:

| Resource       | Base Path             |
|----------------|-----------------------|
| Auth           | `/api/auth`           |
| Projects       | `/api/projects`       |
| Tasks          | `/api/tasks`          |
| Milestones     | `/api/milestones`     |
| Meetings       | `/api/meetings`       |
| Calendar       | `/api/calendar`       |
| Files          | `/api/files`          |
| Notifications  | `/api/notifications`  |
| Activity Log   | `/api/activity`       |
| Reports        | `/api/reports`        |
| Complaints     | `/api/complaints`     |
| Admin          | `/api/admin`          |

## Production Build

```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && mvn clean package
```
