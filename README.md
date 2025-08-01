# CarShare Platform

A modern peer-to-peer car sharing platform built with Ruby on Rails (API) and React.js. Connect car owners with renters through a secure, user-friendly web application.

## Features

### For Car Owners (Hosts)
- List vehicles with detailed information and photos
- Manage car availability and booking status
- View and manage incoming booking requests
- Track rental history

### For Renters
- Browse and search available cars with advanced filtering
- View detailed car information and photos
- Make booking requests with date selection
- Manage booking history and status

### For Administrators
- Comprehensive dashboard for platform management
- User and car verification and management
- Booking oversight and management
- Platform analytics and reporting

## Tech Stack

### Backend
- **Ruby on Rails 8.0+** - API-only mode
- **SQLite** - Database (development)
- **JWT** - Authentication
- **Active Storage** - File uploads
- **RSpec** - Testing framework

### Frontend
- **React 18+** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Axios** - HTTP client

## Prerequisites

Before you begin, ensure you have the following installed:

- **Ruby 3.2+** - [Installation Guide](https://www.ruby-lang.org/en/documentation/installation/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm or yarn** - Package manager
- **Git** - Version control
- **SQLite3** - Database

### Verify Installation

```bash
# Check Ruby version
ruby --version
# Should output: ruby 3.2.x or higher

# Check Node.js version
node --version
# Should output: v18.x.x or higher

# Check npm version
npm --version
# Should output: 8.x.x or higher

# Check SQLite version
sqlite3 --version
# Should output: 3.x.x
```

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/natnaeltibebu/CarShare.git
cd CarShare
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Ruby dependencies
bundle install

# Setup database
rails db:create
rails db:migrate
rails db:seed

# Start the Rails server
rails server
```

The backend API will be available at `http://localhost:3000`

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

#### Database Setup

```bash
cd backend

# Create database
rails db:create

# Run migrations
rails db:migrate

# Seed with sample data
rails db:seed
```

#### Sample Data

The seed file creates:
- Admin user: `admin@carrental.com` / `password123`
- Sample hosts and renters
- Sample cars with images
- Sample bookings

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
bundle exec rspec

# Run specific test files
bundle exec rspec spec/models/user_spec.rb
bundle exec rspec spec/controllers/auth_controller_spec.rb

# Run specific test types
bundle exec rspec spec/models/
bundle exec rspec spec/requests/
```

### Test Database

```bash
# Setup test database
set RAILS_ENV=test&& rails db:create
set RAILS_ENV=test&& rails db:migrate

# Reset test database
set RAILS_ENV=test&& rails db:reset
```

### Manual Testing

#### API Testing with Postman

```bash
# Register a new user
POST http://localhost:3000/auth/register
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "user": {
    "email": "test@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "first_name": "Test",
    "last_name": "User",
    "role": "renter"
  }
}

# Login
POST http://localhost:3000/auth/login
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### Browser Testing

1. **Registration Flow**:
   - Visit http://localhost:5173/register
   - Fill out the registration form
   - Verify redirect to dashboard

2. **Login Flow**:
   - Visit http://localhost:5173/login
   - Login with seeded user credentials
   - Verify authentication state

3. **Car Browsing**:
   - Visit http://localhost:5173/cars
   - Test search and filtering
   - View car details

4. **Booking Flow**:
   - Select a car and dates
   - Create a booking
   - View booking in dashboard

## Project Structure

```
carshare/
├── backend/                 # Rails API
│   ├── app/
│   │   ├── controllers/     # API controllers
│   │   ├── models/          # Data models
│   │   ├── services/        # Business logic
│   │   └── jobs/            # Background jobs
│   ├── config/              # Rails configuration
│   ├── db/                  # Database files
│   │   ├── migrate/         # Database migrations
│   │   └── seeds.rb         # Sample data
│   ├── spec/                # Test files
│   └── storage/             # File uploads
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API services
│   │   └── assets/          # Static assets
│   ├── public/              # Public assets
│   └── dist/                # Build output
└── docs/                    # Documentation
```

## Troubleshooting

### Common Issues

#### Backend Issues

**Issue**: `bundle install` fails
```bash
# Solution: Update bundler
gem update bundler
bundle install
```

**Issue**: Database connection errors
```bash
# Solution: Reset database
rails db:drop db:create db:migrate db:seed
```

#### Frontend Issues

**Issue**: `npm install` fails
```bash
# Solution: Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Issue**: CORS errors
```bash
# Solution: Check backend CORS configuration
# Ensure frontend URL is allowed in cors.rb
```