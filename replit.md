# Tiles Palace

## Overview

Tiles Palace is an e-commerce catalog application for a home improvement store specializing in tiles, lighting, kitchen fittings, and bathroom essentials. The application features a product catalog with category filtering, product detail pages, a portfolio/services showcase, customer inquiry forms, and an admin dashboard for inventory and order management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Animations**: Framer Motion for page transitions and interactions
- **Build Tool**: Vite with custom development plugins for Replit

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful API with typed routes defined in shared/routes.ts
- **Validation**: Zod schemas for input validation on both client and server

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: shared/schema.ts (shared between client and server)
- **Migrations**: Drizzle Kit with migrations stored in /migrations

### Project Structure
- `/client` - React frontend application
- `/server` - Express backend API
- `/shared` - Shared types, schemas, and route definitions
- `/script` - Build scripts

### Key Design Patterns
- **Shared Schema**: Database schemas and Zod validation schemas are shared between frontend and backend
- **Type-Safe API**: Route definitions in shared/routes.ts include method, path, input schemas, and response schemas
- **Component Library**: Uses shadcn/ui (Radix primitives + Tailwind) with custom theme configuration
- **Storage Abstraction**: DatabaseStorage class implements IStorage interface for data access

### Build System
- Development: Vite dev server with HMR proxied through Express
- Production: Vite builds frontend to dist/public, esbuild bundles server to dist/index.cjs
- Database: Run `npm run db:push` to sync schema changes

## External Dependencies

### Database
- PostgreSQL via `pg` driver
- Connection configured through `DATABASE_URL` environment variable
- Session storage uses `connect-pg-simple`

### UI Components
- Radix UI primitives (dialog, dropdown, tabs, etc.)
- Recharts for admin analytics charts
- React Player for portfolio video content
- Embla Carousel for image carousels

### Third-Party Services
- Google Fonts (Inter, Outfit) for typography
- Unsplash images for hero/category imagery (via direct URLs)

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit` - Database ORM and migrations
- `@tanstack/react-query` - Server state management
- `react-hook-form` + `@hookform/resolvers` - Form handling
- `zod` - Schema validation
- `framer-motion` - Animations
- `wouter` - Client-side routing