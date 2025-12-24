# ABS Inventory Backend

Node.js + Express backend for ABS Inventory Management System with MySQL database.

## Features
- Multi-item order management with complete CRUD operations
- MySQL database with comprehensive seeding scripts
- JWT authentication
- RESTful API design

## Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Variables**

Create `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=abs_inventory_system
PORT=5000
JWT_SECRET=your_secret_key
```

3. **Initialize Database**
```bash
npm run init-db
npm run seed-data
```

4. **Run Development Server**
```bash
npm run dev
```

## Deployment

### Railway
1. Create MySQL database service
2. Deploy this backend repository
3. Add environment variables (see `.env.example`)
4. Run `npm run init-db` in Railway shell

### Render
1. Create Web Service from this repo
2. Add MySQL database (external or Render PostgreSQL alternative)
3. Set environment variables
4. Deploy

## API Documentation

Base URL: `http://localhost:5000/api`

### Endpoints
- **Orders**: `/orders`, `/orders/bulk`, `/orders/with-items/:id`
- **Ledgers**: `/ledgers`
- **Items**: `/items`
- **Districts**: `/districts`

## Scripts
- `npm start` - Production server
- `npm run dev` - Development server with nodemon
- `npm run init-db` - Initialize database schema
- `npm run seed-data` - Seed sample data
