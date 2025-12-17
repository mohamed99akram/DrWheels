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
