# CRM Explorer

## Overview

CRM Explorer is a full-stack web application for managing contacts, prospects, and clients. It provides a dashboard with real-time statistics, search functionality, and filtering capabilities. The application is built with a React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **Build Tool**: Vite

The frontend follows a single-page application pattern with the main CRM functionality in `CRMApplication.tsx`. Components are organized in `client/src/components/ui/` following shadcn/ui conventions.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Pattern**: RESTful endpoints under `/api/` prefix
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod with drizzle-zod integration

The server uses a storage abstraction layer (`server/storage.ts`) that implements `IStorage` interface, allowing for database operations to be cleanly separated from route handlers.

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Migrations**: Generated via `drizzle-kit push`

Key tables:
- `users`: Basic user authentication (id, username, password)
- `contacts`: CRM contact data (nom, email, telephone, mobile, adresse, statut, consultant, commentaires, date_creation, scpi, marketing, montant)

### API Structure
All API endpoints are prefixed with `/api/`:
- `GET /api/contacts` - Fetch contacts with optional search/filter params
- `GET /api/contacts/:id` - Get single contact by ID
- `GET /api/stats` - Get aggregated statistics
- `POST /api/contacts` - Create new contact

### Build and Development
- **Development**: `npm run dev` starts the Express server with Vite middleware for HMR
- **Production Build**: `npm run build` compiles both client (Vite) and server (esbuild)
- **Database**: `npm run db:push` applies schema changes to PostgreSQL

### Project Structure
```
├── client/           # Frontend React application
│   ├── src/
│   │   ├── components/ui/  # shadcn/ui components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and query client
│   │   └── pages/          # Page components
├── server/           # Backend Express application
│   ├── db.ts         # Database connection
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Data access layer
│   └── index.ts      # Server entry point
├── shared/           # Shared code between frontend/backend
│   └── schema.ts     # Drizzle schema and Zod types
└── migrations/       # Database migrations
```

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **connect-pg-simple**: PostgreSQL session store (available but sessions not currently implemented)

### UI Libraries
- **Radix UI**: Headless component primitives (accordion, dialog, dropdown, etc.)
- **Lucide React**: Icon library
- **Embla Carousel**: Carousel functionality
- **cmdk**: Command menu component

### Build Tools
- **Vite**: Frontend bundler with React plugin
- **esbuild**: Server bundler for production
- **Tailwind CSS**: Utility-first CSS framework

### Data & Validation
- **Zod**: Schema validation
- **drizzle-zod**: Automatic Zod schema generation from Drizzle tables
- **date-fns**: Date manipulation utilities