# 🚗 DrWheels Simplified - Complete Application

A simplified version of the DrWheels automotive commerce platform with all core components: backend, frontend, data stores, and CI/CD pipeline.

## 📋 Project Structure

```
Phase 3/
├── backend/              # Node.js/Express API
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── controllers/     # Business logic
│   ├── middleware/     # Auth & validation
│   └── server.js        # Entry point
├── frontend/            # React web application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/      # Page components
│   │   └── services/   # API services
│   └── public/
├── .github/
│   └── workflows/      # CI/CD pipelines
└── docker-compose.yml  # Local development setup
```

## 🏗️ Architecture

### Components

1. **Backend API** (Node.js/Express)
   - Port: 4000
   - MongoDB database
   - JWT authentication
   - RESTful API

2. **Frontend Web** (React)
   - Port: 3000
   - Material-UI components
   - Responsive design

3. **Data Stores**
   - MongoDB (primary database)
   - Redis (caching - optional)

5. **CI/CD Pipeline**
   - GitHub Actions workflows
   - Automated testing
   - Deployment automation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Docker & Docker Compose (optional)

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Docker Setup (All Services)
```bash
docker-compose up -d
```

## 📊 Core Features

### Authentication & User Management
- ✅ User registration and login with JWT
- ✅ User profiles with editable information
- ✅ Role-based access control (User/Admin)

### Vehicle Marketplace
- ✅ Browse vehicles with advanced search and filters
- ✅ Create, update, and delete vehicle listings
- ✅ Image support for vehicle listings
- ✅ Advanced filtering (make, model, year, price, mileage, color)
- ✅ Sorting (price, year, mileage, rating, date)
- ✅ Pagination support

### Favorites & Wishlist
- ✅ Save vehicles to favorites
- ✅ View and manage favorite vehicles
- ✅ Quick favorite toggle on listings

### Reviews & Ratings
- ✅ 5-star rating system
- ✅ Written reviews with comments
- ✅ Average rating calculation
- ✅ Review count tracking
- ✅ One review per user per vehicle

### Order Management
- ✅ Create purchase orders
- ✅ Order status tracking (pending, confirmed, completed, cancelled)
- ✅ Payment status tracking
- ✅ Buyer and seller order views
- ✅ Automatic vehicle status updates

### Communication
- ✅ Direct chat between users
- ✅ Message history
- ✅ Real-time messaging support

### User Interface
- ✅ Responsive web interface (Material-UI)
- ✅ Modern, intuitive design
- ✅ Image galleries and carousels

## 🔧 Technology Stack

- **Backend**: Node.js, Express, MongoDB, JWT
- **Frontend**: React, Material-UI, Axios
- **Database**: MongoDB
- **CI/CD**: GitHub Actions

## 📝 Environment Variables

See `.env.example` files in each component directory.

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 📚 Documentation

- **Complete API Reference**: `API_REFERENCE.md` - Full API documentation
- **Security Audit**: `SECURITY_AUDIT.md` - Security analysis and controls
- **Marketplace Features**: `MARKETPLACE_FEATURES.md` - Feature documentation
- Backend API docs: `backend/README.md`
- Frontend docs: `frontend/README.md`
- Backend Security: `backend/SECURITY.md`
- Frontend Security: `frontend/SECURITY.md`
