# Lead Manager

A full-stack web application designed for sales teams to capture, track, and manage leads effectively.

Built for the **Full Stack Developer Screening Assignment (Meru Technosoft Pvt. Ltd.)**.

---

## Tech Stack Overview

- **Backend**: Node.js, Express 5, Sequelize ORM (PostgreSQL)
- **Database**: PostgreSQL (Structured relational schema, UUID primary keys, connection pooling, ACID transaction guarantees, compound indexes)
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs password hashing (12 salt rounds)
- **Security & Protection**:
  - `helmet`: Secure HTTP response headers
  - `hpp`: HTTP parameter pollution protection
  - `cors`: Restricted cross-origin requests
  - `express-rate-limit`: Tiered IP rate limiting (strict on auth, balanced on general API)
  - `joi`: Declarative request validation with `stripUnknown` to prevent mass-assignment vulnerabilities
- **Frontend** *(Upcoming)*: React / Next.js

---

## Project Structure

```
Lead_Manager/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # PostgreSQL connection & pool config (Sequelize)
│   │   │   └── environment.js       # Centralized environment variables
│   │   ├── controllers/
│   │   │   ├── authController.js     # User registration, login, profile (/me)
│   │   │   ├── healthController.js   # API & database health probe
│   │   │   └── leadController.js     # Full lead CRUD, search, filter & stats
│   │   ├── middlewares/
│   │   │   ├── auth.js               # JWT verification & user injection
│   │   │   ├── errorHandler.js       # Centralized error handler with Sequelize mapping
│   │   │   ├── notFoundHandler.js    # Standardized 404 JSON response
│   │   │   ├── rateLimiter.js        # Tiered API rate limiting
│   │   │   └── validate.js           # Generic Joi request validation middleware
│   │   ├── models/
│   │   │   ├── index.js              # Model associations & cascade rules
│   │   │   ├── Lead.js               # Lead schema with compound indexes & ENUMs
│   │   │   └── User.js               # User schema with bcrypt hooks & scoped passwords
│   │   ├── routes/
│   │   │   ├── index.js              # Central API router aggregator (/api)
│   │   │   ├── authRoutes.js         # Authentication endpoints
│   │   │   ├── healthRoutes.js       # Health monitoring endpoints
│   │   │   └── leadRoutes.js         # Lead management endpoints
│   │   ├── utils/
│   │   │   ├── ApiError.js           # Custom operational error class
│   │   │   ├── asyncHandler.js       # Async middleware wrapper
│   │   │   └── generateToken.js      # JWT signing and verification helpers
│   │   ├── validators/
│   │   │   ├── authValidator.js      # Register & login Joi schemas
│   │   │   └── leadValidator.js      # Lead create, update & query Joi schemas
│   │   ├── app.js                    # Express app configuration & middleware pipeline
│   │   └── server.js                 # Server entry point & graceful shutdown
│   ├── .env.example                  # Environment configuration template
│   ├── .gitignore                    # Backend gitignore rules
│   └── package.json                  # Dependencies and scripts
├── .gitignore                        # Root gitignore rules
└── README.md                         # Project documentation
```

---

## Features & Implementation

### Core Features
1. **Lead Creation (`POST /api/leads`)**: Capture `name`, `email`, `phone`, `company`, `source` (dropdown enum), and `status` (`New`, `Contacted`, `Qualified`, `Lost`).
2. **List Leads (`GET /api/leads`)**: Returns paginated leads with full status tracking.
3. **Edit Lead (`PUT /api/leads/:id`)**: Update lead details and progression status.
4. **Delete Lead (`DELETE /api/leads/:id`)**: Remove lead records securely.
5. **Search & Filter**:
   - `search`: Case-insensitive partial matching (`ILIKE`) across name, email, and company.
   - `status`: Exact filter by status enum (`New`, `Contacted`, `Qualified`, `Lost`).
   - `source`: Filter by acquisition channel (`Website`, `Referral`, `LinkedIn`, `Cold Call`, etc.).
6. **Input Validation**: Double-layer validation (Joi schema validation on the request layer + Sequelize database model constraints and ENUMs).

### Production & Bonus Capabilities
- **User Authentication & Multi-Tenancy**: Users register/login with JWT. Every lead is strictly scoped to `userId` to ensure data isolation.
- **Offset Pagination & Sorting**: High-performance pagination with `page`, `limit`, `sortBy`, and `order`.
- **Dashboard Metrics (`GET /api/leads/dashboard/stats`)**: Database-level `GROUP BY status` aggregation for fast summary counts.
- **Resilient Connection Pooling**: PostgreSQL connection pool (min 5, max 20 connections) designed to handle concurrent users without exhausting database sockets.
- **Graceful Shutdown**: Intercepts `SIGINT`/`SIGTERM` to finish in-flight requests and cleanly drain database connection pools.

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL (v14+ recommended)

### 1. Database Setup
Ensure PostgreSQL is running and create the database:
```sql
CREATE DATABASE lead_manager;
```

### 2. Environment Configuration
Navigate to the `Backend` directory and copy the environment template:
```bash
cd Backend
cp .env.example .env
```
Edit `.env` and provide your database credentials:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=lead_manager
DB_USER=postgres
DB_PASSWORD=your_postgres_password

DB_POOL_MAX=20
DB_POOL_MIN=5

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

### 3. Installation & Run
```bash
cd Backend
npm install

# Run with nodemon (development mode)
npm run dev

# Run in production mode
npm start
```
The server will start at `http://localhost:5000`.

---

## API Reference

### Health
- `GET /api/health`: Health status & PostgreSQL connection probe.

### Authentication
- `POST /api/auth/register`: Create a new user account.
- `POST /api/auth/login`: Authenticate and receive a JWT token.
- `GET /api/auth/me`: Fetch authenticated user profile (Requires `Bearer <token>`).

### Leads (Requires `Authorization: Bearer <token>`)
- `GET /api/leads`: Retrieve paginated leads.
  - Query params: `page`, `limit`, `search`, `status`, `source`, `sortBy`, `order`.
- `POST /api/leads`: Create a new lead.
- `GET /api/leads/:id`: Get a lead by ID.
- `PUT /api/leads/:id`: Update lead by ID.
- `DELETE /api/leads/:id`: Delete lead by ID.
- `GET /api/leads/dashboard/stats`: Dashboard counts grouped by lead status.

---

## Engineering Assumptions & Trade-offs
- **PostgreSQL over NoSQL**: Chosen for structured relational integrity, strict ENUM data types, ACID guarantees, and efficient indexing.
- **Pagination Strategy**: Offset-based pagination with parallel count queries is optimal for ease of frontend consumption and table navigation.
- **Data Isolation**: Multi-tenant data segregation enforced at the application layer (`where: { userId: req.user.id }`) and foreign key constraints with `ON DELETE CASCADE`.

---

## Highlights & Tricky Aspects
- **Security Defense-in-Depth**: Combining layered express middleware (`helmet`, `hpp`, `cors`, `rate-limit`, `joi`) with database-level ENUM constraints and parameterised queries prevents SQL injection, mass assignment, and DDoS attempts.
- **Graceful Lifecycle Management**: Implemented connection pool draining and server shutdown handling to prevent corrupted database transactions during restarts or deployments.
