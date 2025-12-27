# DrWheels Backend API

Simplified backend API for DrWheels platform.

## Features

- User authentication (register, login, JWT)
- Car marketplace (CRUD operations)
- Chat system
- User profiles

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB URI and JWT secret.

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Start the server:
```bash
npm start
# or for development
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Users
- `GET /api/users/profile` - Get user profile (requires auth)
- `PUT /api/users/profile` - Update user profile (requires auth)

### Cars
- `GET /api/cars` - Get all cars (with filters: make, model, year, minPrice, maxPrice)
- `GET /api/cars/:id` - Get car by ID
- `POST /api/cars` - Create car (requires auth)
- `PUT /api/cars/:id` - Update car (requires auth)
- `DELETE /api/cars/:id` - Delete car (requires auth)

### Chat
- `GET /api/chat` - Get user's chats (requires auth)
- `GET /api/chat/:id` - Get chat by ID (requires auth)
- `POST /api/chat` - Create new chat (requires auth)
- `POST /api/chat/:id/messages` - Send message (requires auth)

## Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <token>
```






# DrWheels Static Code Analysis & Security Testing

This project uses **React (frontend)** and **Node.js + MongoDB (backend)**.  
To improve code quality and security, we added **static code analysis and dependency scanning tools**.

---

## 1️⃣ Frontend (React)

### Added Tools

| Tool | Purpose |
|------|--------|
| **ESLint** + `eslint-plugin-react` + `eslint-plugin-security` | Performs static code analysis; detects unsafe React patterns, bad coding practices, and security issues like unsafe `eval()` or DOM manipulations. |
| **npm audit** | Scans frontend dependencies for known vulnerabilities. |
| **Semgrep (optional)** | Detects advanced patterns like XSS, unsafe Axios usage, and insecure JSX rendering. |

### How to Run

```bash
cd frontend

# Install dependencies
npm install

# Run ESLint static code scan
npm run lint

# Check for vulnerable dependencies
npm run audit

# Optional: Run Semgrep scan (install Semgrep first)
semgrep --config=p/javascript --config=p/react .
```

---

## 2️⃣ Backend (Node.js + MongoDB)

### Added Tools

| Tool | Purpose |
|------|--------|
| **ESLint** + `eslint-plugin-security` | Performs static code analysis; detects security issues in Node.js like unsafe eval, insecure crypto, and potential injection points. |
| **npm audit** | Scans backend dependencies for known vulnerabilities (e.g., Express, Mongoose, JWT, bcrypt). |
| **Semgrep (optional)** | Detects advanced backend patterns like NoSQL injection, missing authentication middleware, and unsafe `req.body` usage. |
| **Gitleaks (optional)** | Detects secrets accidentally committed (MongoDB URIs, JWT keys, API tokens). |

### How to Run

```bash
cd backend

# Install dependencies
npm install

# Run ESLint static code scan
npm run lint

# Check for vulnerable dependencies
npm run audit

# Optional: Run Semgrep scan
semgrep --config=p/nodejs --config=p/express --config=p/mongodb .

# Optional: Run Gitleaks secrets scan
gitleaks detect
```

---

## 3️⃣ Summary

- **Purpose of these additions**: Ensure high code quality, prevent security vulnerabilities, detect unsafe coding patterns, and enforce best practices in both frontend and backend.
- **Integration**: Can be integrated into **CI/CD pipelines** to automatically fail builds if issues are found.
- **Scope**:
  - Frontend → React/XSS/security patterns, dependency vulnerabilities.
  - Backend → Node/MongoDB injection risks, unsafe code, dependency vulnerabilities, secrets detection.

---

> ✅ These tools help maintain **secure, maintainable, and high-quality code** across the entire DrWheels project.

