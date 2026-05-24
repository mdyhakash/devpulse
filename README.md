# DevPulse

A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

## Live URL

> https://devpulse-mdyhakash.vercel.app/

---

## Features

- User registration and authentication with JWT
- Role based access control (contributor / maintainer)
- Create, read, update, and delete issues
- Filter and sort issues by type, status, and date
- Maintainer only status updates and issue deletion
- Passwords hashed with bcryptJs, never exposed in responses

---

## Tech Stack

| Technology   | Usage                                      |
| ------------ | ------------------------------------------ |
| TypeScript   | Strict typing throughout                   |
| Express.js   | Modular router architecture                |
| PostgreSQL   | Relational database via native `pg` driver |
| bcryptjs     | Password hashing (salt rounds: 10)         |
| jsonwebtoken | JWT generation and verification            |

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/mdyhakash/devpulse
cd devpulse
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/devpulse
JWT_SECRET=your_secret_key_here
```

### 4. Run the development server

```bash
npm run dev
```

---

## API Endpoints

### Auth

| Method | Endpoint           | Access | Description                 |
| ------ | ------------------ | ------ | --------------------------- |
| POST   | `/api/auth/signup` | Public | Register a new user         |
| POST   | `/api/auth/login`  | Public | Login and receive JWT token |

### Issues

| Method | Endpoint                 | Access          | Description                                     |
| ------ | ------------------------ | --------------- | ----------------------------------------------- |
| POST   | `/api/issues`            | Authenticated   | Create a new issue                              |
| GET    | `/api/issues`            | Public          | Get all issues (supports filtering and sorting) |
| GET    | `/api/issues/:id`        | Public          | Get a single issue                              |
| PATCH  | `/api/issues/:id`        | Authenticated   | Update issue title, description, or type        |
| PATCH  | `/api/issues/:id/status` | Maintainer only | Update issue status                             |
| DELETE | `/api/issues/:id`        | Maintainer only | Delete an issue                                 |

### Query Parameters for GET /api/issues

| Param    | Values                            | Default  |
| -------- | --------------------------------- | -------- |
| `sort`   | `newest`, `oldest`                | `newest` |
| `type`   | `bug`, `feature_request`          | none     |
| `status` | `open`, `in_progress`, `resolved` | none     |

### Authentication Header

```
Authorization: <JWT_TOKEN>
```

---

## Database Schema

### users

| Column       | Type                         | Description                                              |
| ------------ | ---------------------------- | -------------------------------------------------------- |
| `id`         | SERIAL PRIMARY KEY           | Auto-incrementing ID                                     |
| `name`       | VARCHAR(255) NOT NULL        | Full display name                                        |
| `email`      | VARCHAR(255) NOT NULL UNIQUE | Login email                                              |
| `password`   | TEXT NOT NULL                | Hashed password                                          |
| `role`       | VARCHAR(50) NOT NULL         | `contributor` or `maintainer`, defaults to `contributor` |
| `created_at` | TIMESTAMP                    | Auto-generated on insert                                 |
| `updated_at` | TIMESTAMP                    | Auto-generated on insert                                 |

### issues

| Column        | Type                  | Description                                              |
| ------------- | --------------------- | -------------------------------------------------------- |
| `id`          | SERIAL PRIMARY KEY    | Auto-incrementing ID                                     |
| `title`       | VARCHAR(150) NOT NULL | Max 150 characters                                       |
| `description` | TEXT NOT NULL         | Min 20 characters                                        |
| `type`        | VARCHAR(50) NOT NULL  | `bug` or `feature_request`                               |
| `status`      | VARCHAR(50) NOT NULL  | `open`, `in_progress`, `resolved` — defaults to `open`   |
| `reporter_id` | INT NOT NULL          | References user who created the issue (no FK constraint) |
| `created_at`  | TIMESTAMP             | Auto-generated on insert                                 |
| `updated_at`  | TIMESTAMP             | Auto-refreshed on update                                 |

---

## Role Permissions

| Action                                   | Contributor | Maintainer |
| ---------------------------------------- | ----------- | ---------- |
| Register / Login                         | ✅          | ✅         |
| Create issue                             | ✅          | ✅         |
| View all issues                          | ✅          | ✅         |
| Update own issue (status must be `open`) | ✅          | ✅         |
| Update any issue                         | ❌          | ✅         |
| Update issue status                      | ❌          | ✅         |
| Delete any issue                         | ❌          | ✅         |
