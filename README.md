# 🚀 Smart Leads Dashboard

A full-stack Lead Management Dashboard built with the **MERN stack** and **TypeScript**, featuring JWT authentication, role-based access control, advanced filtering, and a modern responsive UI.

![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

---

## ✨ Features

### Core
- **JWT Authentication** — Secure login/register with bcrypt password hashing
- **Role-Based Access Control (RBAC)** — Admin and Sales User roles with different permissions
- **Full CRUD** — Create, read, update, and delete leads
- **Advanced Filtering** — Filter by status, source, and search by name/email simultaneously
- **Backend Pagination** — Server-side pagination with 10 records/page
- **Debounced Search** — 300ms debounce to minimize API calls
- **CSV Export** — Export filtered leads to CSV file
- **Dark Mode** — Full dark/light theme support with system preference detection

### Technical
- **TypeScript Everywhere** — Strict typing on both frontend and backend
- **Zod Validation** — Schema-based request validation
- **Centralized Error Handling** — Custom error classes with structured responses
- **Responsive Design** — Desktop table + mobile card layout
- **Loading & Empty States** — Polished UX for every state
- **Docker Support** — Full Docker Compose setup

---

## 🏗️ Project Structure

```
smart-leads-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection, env validation, seed script
│   │   ├── controllers/     # Route handlers (auth, leads)
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── models/          # Mongoose schemas (User, Lead)
│   │   ├── routes/          # Express route definitions
│   │   ├── types/           # TypeScript interfaces
│   │   ├── utils/           # Custom error classes
│   │   ├── validators/      # Zod schemas
│   │   └── server.ts        # Express app entry point
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/      # DashboardLayout, ProtectedRoute, ThemeToggle
│   │   │   ├── leads/       # LeadFormModal, LeadDetailModal, DeleteConfirmModal
│   │   │   └── ui/          # Button, Input, Select, Modal, Badge, Spinner, EmptyState
│   │   ├── context/         # AuthContext
│   │   ├── hooks/           # useDebounce, useDarkMode, useClickOutside
│   │   ├── pages/           # LoginPage, RegisterPage, DashboardPage, LeadsPage
│   │   ├── services/        # API client, service functions
│   │   ├── types/           # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .env.example
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the repository

```bash
git clone <repository-url>
cd smart-leads-dashboard
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 4. Seed Database (Optional)

```bash
cd backend
npm run seed
```

This creates test users and 50 sample leads:
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartleads.com | Admin@123 |
| Sales | ravi@smartleads.com | Sales@123 |
| Sales | priyanka@smartleads.com | Sales@123 |

### 5. Docker Setup (Alternative)

```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

---

## 📡 API Documentation

### Base URL: `/api`

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login user | ❌ |
| GET | `/auth/me` | Get current user | ✅ |

### Leads

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/leads` | List leads (paginated, filtered) | ✅ |
| POST | `/leads` | Create new lead | ✅ |
| GET | `/leads/:id` | Get single lead | ✅ |
| PATCH | `/leads/:id` | Update lead | ✅ |
| DELETE | `/leads/:id` | Delete lead | ✅ |
| GET | `/leads/export` | Export leads as CSV | ✅ |
| GET | `/leads/stats` | Get dashboard statistics | ✅ |

### Query Parameters (GET /leads)

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter: New, Contacted, Qualified, Lost |
| `source` | string | Filter: Website, Instagram, Referral |
| `search` | string | Search by name or email |
| `sort` | string | Sort: latest, oldest |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |

### Response Format

```json
{
  "success": true,
  "message": "optional message",
  "data": {},
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "email": ["Please enter a valid email"]
  }
}
```

---

## 🔐 Role-Based Access Control

| Action | Admin | Sales User |
|--------|-------|------------|
| View all leads | ✅ | ❌ (own only) |
| Create leads | ✅ | ✅ |
| Edit any lead | ✅ | ❌ (own only) |
| Delete any lead | ✅ | ❌ (own only) |
| View dashboard stats | ✅ (all) | ✅ (own) |
| Export CSV | ✅ (all) | ✅ (own) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, TailwindCSS 4, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| Validation | Zod |
| Containerization | Docker, Docker Compose |

---

## 📝 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-leads
JWT_SECRET=<min 32 characters>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=/api
```

---

## 📄 License

MIT
