# Pawtobooth - Photo Booth Application

## Overview

Pawtobooth is a modern web-based photo booth application designed for capturing and creating personalized photo layouts. The application allows users to take photos through their camera, select different print formats (4R grid or photo strip), customize backgrounds, and generate printable layouts. Built with a full-stack TypeScript architecture using React for the frontend and Express for the backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared components:

- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (configured but using in-memory storage currently)
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React hooks with TanStack Query for server state
- **Build System**: Vite for frontend, esbuild for backend bundling

## Key Components

### Frontend Architecture
- **Component Structure**: Uses shadcn/ui for consistent UI components
- **Routing**: Wouter for lightweight client-side routing
- **Camera Integration**: Custom hooks for camera access and photo capture
- **State Management**: Custom hooks for photo session management
- **Photo Processing**: Canvas-based photo layout generation

### Backend Architecture
- **API Layer**: RESTful Express.js server with route handlers
- **Storage Layer**: Abstracted storage interface with in-memory implementation
- **Middleware**: Request logging, JSON parsing, and error handling
- **Development**: Hot-reload with Vite integration in development

### Database Schema
- **Photo Sessions Table**: Stores session metadata including format, background, photos, and copy count
- **Primary Key**: UUID-based identification
- **Photo Storage**: JSON field for photo data arrays

## Data Flow

1. **Session Creation**: User configures print format, background color, and copy count
2. **Photo Capture**: Camera integration captures photos and stores them as base64 data URLs
3. **Session Management**: Photos are added to the session state with metadata
4. **Layout Generation**: Canvas API generates printable layouts based on selected format
5. **Export/Print**: Generated layouts can be downloaded or printed

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18+ with hooks, React Query for server state
- **Backend**: Express.js with TypeScript support
- **Database**: Drizzle ORM with PostgreSQL driver (@neondatabase/serverless)
- **UI Library**: Radix UI primitives via shadcn/ui components

### Development Dependencies
- **Build Tools**: Vite, esbuild, TypeScript compiler
- **Styling**: Tailwind CSS with PostCSS
- **Development**: tsx for running TypeScript directly

### Camera and Media
- **Browser APIs**: MediaDevices API for camera access
- **Canvas API**: For photo processing and layout generation

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Type Checking**: TypeScript compilation check without emit

### Environment Configuration
- **Development**: tsx runs server directly with hot-reload
- **Production**: Node.js runs bundled server code
- **Database**: PostgreSQL connection via DATABASE_URL environment variable

### File Structure
```
├── client/          # React frontend application
├── server/          # Express backend application
├── shared/          # Shared types and schemas
├── migrations/      # Database migration files
└── dist/           # Built application files
```

The application is designed to be deployed as a single Node.js application serving both the API and static frontend files, with PostgreSQL as the persistent storage layer.