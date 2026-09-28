# ⚡ TaskFlow — Modern Full-Stack To-Do Application

> A production-grade task & productivity management web application built following the **Complete Node.js To-Do Application Roadmap**.

![Node.js](https://img.shields.io/badge/Node.js-v22+-68a063?style=flat&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.21-000000?style=flat&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8-47a248?style=flat&logo=mongodb)
![Frontend](https://img.shields.io/badge/Frontend-Vanilla_HTML5_%2B_CSS3_%2B_JS-f59e0b?style=flat)

---

## 🌟 Key Features

| Category | Features Included |
|---|---|
| ➕ **CRUD Management** | Create, edit with modal, mark complete/incomplete, and delete tasks with confirmation modal. |
| 🔍 **Search & Filters** | Instant search by title/description, filters for **All**, **Today**, **Upcoming**, **Completed**, and category pills. |
| 🏷️ **Categories & Priority** | Categorize into **Work**, **Study**, **Personal**, **Fitness**, **Finance**, or **General**. Priority levels: 🔴 **High**, 🟡 **Medium**, 🟢 **Low**. |
| 📅 **Smart Due Dates** | Overdue badges (`2d overdue`), "Today", "Tomorrow", relative calendar alerts. |
| 📊 **Real-time Statistics** | Total Tasks, Completed Count, Pending Count, Overdue Count, High Priority Count, and animated Progress Bar with completion %. |
| 🌙 **Theme Modes** | Modern **Dark Mode** (default) and **Light Mode** with smooth transition & `localStorage` persistence. |
| 📱 **Responsive Design** | Full desktop sidebar layout with responsive mobile slide-out drawer, mobile hamburger button, and floating action button (FAB). |
| ⚡ **Keyboard Shortcuts** | Press `N` or `C` for new task modal, `/` to focus search bar, and `Esc` to close modals. |
| 💾 **MongoDB Persistence** | Schema validation, indexes, and full Mongoose ODM data modeling. |

---

## 🏗️ Architecture

```
To_Do_using_NodeJS/
├── package.json               # Root coordinator scripts
├── README.md                  # Project documentation
│
├── backend/
│   ├── .env                   # Environment variables (PORT, MONGODB_URI)
│   ├── .env.example           # Example environment template
│   ├── package.json           # Backend dependencies (express, mongoose, cors, dotenv)
│   ├── server.js              # Server entry point & graceful shutdown
│   └── src/
│       ├── app.js             # Express configuration, middlewares, static frontend serving
│       ├── config/
│       │   └── database.js    # Mongoose connection & logging
│       ├── models/
│       │   └── Todo.js        # Mongoose schema with validations & indexes
│       ├── controllers/
│       │   └── todo.controller.js # HTTP request/response handlers
│       ├── services/
│       │   └── todo.service.js    # Business logic, query filters, search, statistics
│       ├── routes/
│       │   └── todo.routes.js     # REST API endpoint definitions
│       └── middleware/
│           ├── error.middleware.js      # Centralized error handler
│           ├── notFound.middleware.js   # 404 Route handler
│           └── validation.middleware.js # Request payload validation
│
└── frontend/
    ├── index.html             # Semantic accessible UI structure
    ├── style.css              # Custom modern CSS design system (tokens, themes, animations)
    └── script.js              # Vanilla JS state manager, fetch API client, modals & toasts
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017` (or MongoDB Atlas connection string)

### 2. Install Dependencies
```bash
npm install
# or: cd backend && npm install
```

### 3. Configure Environment
A default [backend/.env](file:///Users/prashamjain/Desktop/Semester%203/Web_Dev/To_Do_using_NodeJS/backend/.env) is pre-configured:
```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow_db
NODE_ENV=development
```
*(Note: Port 5001 is used by default to prevent conflicts with macOS AirPlay receiver on port 5000).*

### 4. Run the Application
From the project root:
```bash
npm run dev
# or for production: npm start
```

Open your browser and navigate to:
```
http://localhost:5001
```

---

## 📡 REST API Reference

All API routes are prefixed with `/api/todos`:

| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `GET` | `/api/health` | Service health status check | — |
| `GET` | `/api/todos` | List all tasks | `status` (all, today, upcoming, completed), `category`, `priority`, `search`, `sortBy`, `order` |
| `GET` | `/api/todos/stats` | Aggregate dashboard statistics | — |
| `GET` | `/api/todos/:id` | Retrieve a single task by ID | — |
| `POST` | `/api/todos` | Create a new task | — |
| `PATCH` | `/api/todos/:id` | Update / toggle task completion | — |
| `DELETE` | `/api/todos/:id` | Delete task by ID | — |
| `DELETE` | `/api/todos/actions/clear-completed` | Delete all completed tasks | — |

### Sample Payloads

#### Create Task (`POST /api/todos`)
```json
{
  "title": "Master Node.js and Express",
  "description": "Learn middleware pipelines, service layers, and Mongoose indexing.",
  "priority": "high",
  "category": "Study",
  "dueDate": "2026-10-05"
}
```

#### Update Task (`PATCH /api/todos/:id`)
```json
{
  "completed": true
}
```

---

## ⌨️ Keyboard Shortcuts

- `N` or `C`: Open the "Create Task" modal.
- `/`: Focus the search bar immediately.
- `Escape`: Close any active modal dialog or mobile menu.

---

## 🎓 Roadmap Checklist Completed

- [x] **Phase 0–1**: Architecture decisions & directory initialization
- [x] **Phase 2–4**: Node.js fundamentals, HTTP concepts & Express app setup
- [x] **Phase 5–10**: RESTful CRUD endpoints (`GET`, `POST`, `PATCH`, `DELETE`)
- [x] **Phase 11–12**: MongoDB integration & Mongoose schema design with timestamps and indexes
- [x] **Phase 13**: MVC layered architecture (`controllers/`, `services/`, `models/`, `routes/`, `config/`)
- [x] **Phase 14–15**: Input validation and centralized error handling middleware
- [x] **Phase 16–18**: Full frontend UI with HTML5, CSS design system, modals, and `fetch()` API
- [x] **Phase 19–20**: Search, category/priority filters, sorting, and live calculated statistics
- [x] **Phase 21–23**: Complete UI states (Skeleton loading, Empty states, Toast alerts, Dark/Light modes)
