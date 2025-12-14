# IWatchFootball

A full-stack monorepo application for football data and services, built with NestJS and React.

## Project Structure

This is a monorepo managed with pnpm workspaces, containing:

- **`backend/`** - NestJS API server with Fastify, TypeORM, and PostgreSQL
- **`frontend/ui/`** - React frontend built with Vite, Mantine UI, and TanStack Query
- **`clients/`** - Auto-generated API client code (generated from OpenAPI spec)
- **`libraries/`** - Shared libraries and utilities
- **`resources/`** - Configuration files, scripts, and static assets

## Tech Stack

### Backend
- **Framework**: NestJS with Fastify
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **API Documentation**: Swagger/OpenAPI
- **Queue System**: BullMQ with Redis
- **Code Generation**: Orval for API client generation

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Mantine
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router
- **Animations**: Framer Motion, GSAP

## Prerequisites

- Node.js (v20 or higher)
- pnpm (v8 or higher)
- PostgreSQL (for local development)
- Docker & Docker Compose (optional, for containerized development)

## Getting Started

### Installation

Install dependencies for all workspaces:

```bash
pnpm install
```

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=monorepo
DATABASE_SSL=false
DATABASE_SYNCHRONIZE=false

# Server
PORT=8080
NODE_ENV=development

# Authentication
JWT_SECRET=your-secret-key-change-in-production
SALT_ROUNDS=10

# Redis (if using BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Database Setup

#### Local PostgreSQL

1. Start PostgreSQL locally (default port 5432)
2. Create a database named `monorepo`
3. Run migrations:

```bash
cd backend
pnpm migration:run
```

#### Cloud SQL Proxy (for Cloud SQL connections)

If connecting to Google Cloud SQL, use the proxy script:

```bash
pnpm db:proxy
```

Or use the provided scripts:
- Windows: `start-proxy.ps1` or `start-proxy.bat`

### Development

#### Run Backend

```bash
pnpm run:backend
```

The API will be available at `http://localhost:8080`
- API Documentation: `http://localhost:8080/api-docs` (Swagger UI)

#### Run Frontend

```bash
pnpm run:frontend
```

The frontend will be available at `http://localhost:3000`

#### Generate API Clients

After making changes to the backend API, regenerate the client code:

```bash
pnpm run:clients
```

This will:
1. Clean the OpenAPI spec
2. Generate TypeScript client code using Orval
3. Output to the `clients/` directory

### Docker Development

Run the entire stack with Docker Compose:

```bash
docker-compose up
```

This will start:
- Backend API on port 8080
- Frontend on port 3000
- PostgreSQL database on port 5433

## Available Scripts

### Root Level

- `pnpm run:frontend` - Start frontend development server
- `pnpm run:backend` - Start backend development server
- `pnpm run:clients` - Generate API client code
- `pnpm db:proxy` - Start Cloud SQL proxy

### Backend Scripts

- `pnpm --filter ./backend build` - Build backend for production
- `pnpm --filter ./backend start:dev` - Start backend in development mode
- `pnpm --filter ./backend migrate` - Generate a new migration
- `pnpm --filter ./backend migration:run` - Run pending migrations
- `pnpm --filter ./backend migration:revert` - Revert last migration
- `pnpm --filter ./backend generate:client-gen` - Generate API clients

### Frontend Scripts

- `pnpm --filter ./frontend/ui dev` - Start development server
- `pnpm --filter ./frontend/ui build` - Build for production
- `pnpm --filter ./frontend/ui preview` - Preview production build

## Project Architecture

### Backend Structure

```
backend/
├── src/
│   ├── api/              # API modules, controllers, services
│   ├── auth/             # Authentication & authorization
│   ├── config/           # Configuration files
│   ├── health/           # Health check endpoints
│   ├── main.ts           # Application entry point
│   └── shared/           # Shared utilities, migrations
└── clientGen/            # Client generation config
```

### Frontend Structure

```
frontend/ui/
├── src/
│   ├── components/       # Reusable React components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── router.tsx        # Route configuration
│   └── shared/           # Shared utilities
```

## Database Migrations

### Create a Migration

```bash
cd backend
pnpm migrate
```

### Run Migrations

```bash
cd backend
pnpm migration:run
```

### Revert a Migration

```bash
cd backend
pnpm migration:revert
```

## Deployment

### Docker Production Build

The project includes a multi-stage Dockerfile (`Dockerfile.fullstack`) for building both frontend and backend:

```bash
docker build -f Dockerfile.fullstack -t iwatchfootball:latest .
```

### Firebase App Hosting

The project is configured for Firebase App Hosting. See `apphosting.yaml` and `firebase.json` for configuration.

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure all scripts run successfully
4. Generate API clients if backend changes were made
5. Submit a pull request

## License

UNLICENSED - Private project

## Author

Kenneth Nnadi
