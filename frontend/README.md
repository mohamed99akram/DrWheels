# DrWheels Frontend

Simplified React web application for DrWheels platform.

## Features

- User authentication (login, register)
- Car marketplace browsing
- Car details view
- User profile management
- Chat system

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your backend API URL:
```
REACT_APP_API_URL=http://localhost:4000/api
```

4. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

## Technology Stack

- React 18
- Material-UI (MUI)
- React Router
- Axios
