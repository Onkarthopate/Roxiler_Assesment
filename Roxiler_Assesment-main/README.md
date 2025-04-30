# Store Rating System

A full-stack web application that allows users to submit ratings for stores registered on the platform.

## Features

- Role-based access control (Admin, Store Owner, Normal User)
- User authentication and registration
- Store management
- Rating submission and management
- Dashboard analytics
- Responsive design

## Tech Stack

- **Frontend:** React, TypeScript, TailwindCSS
- **Backend:** Express.js
- **Database:** MySql

## Getting Started

### Prerequisites

- Node.js
- MySql

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a PostgreSQL database:

```sql
CREATE DATABASE store_rating_system;
```

4. Configure environment variables in `server/.env`:

```
PORT=8000
JWT_SECRET=your_secret_key_here
```

### Running the Application

1. Start the backend server:

```bash
npm run server
```

2. Start the frontend development server:

```bash
npm run dev
```

3. Access the application at `http://localhost:5173`

## Default Admin Account

After running the application for the first time, a default admin account will be created:

- **Email:** admin@example.com
- **Password:** Admin@123

## API Documentation

The API endpoints are organized by user roles:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `PUT /api/auth/password` - Update password

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stores` - Get all stores

### Normal User
- `GET /api/stores` - Get all stores with ratings
- `POST /api/ratings` - Submit or update a rating

### Store Owner
- `GET /api/store-owner/store` - Get store details
- `GET /api/store-owner/ratings` - Get all ratings for the store

## Validation Rules

- **Name:** Min 20 characters, Max 60 characters
- **Address:** Max 400 characters
- **Password:** 8-16 characters, must include at least one uppercase letter and one special character
- **Email:** Standard email validation
- **Rating:** Integer between 1 and 5
