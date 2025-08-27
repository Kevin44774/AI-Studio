# Overview

This is an AI-powered image generation studio built as a full-stack TypeScript application. Users can upload images, add creative prompts, select artistic styles, and generate transformed versions of their images. The application features a modern React-based interface with a Node.js/Express backend and PostgreSQL database integration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client is built with React and TypeScript using Vite as the build tool. It follows a component-based architecture with:

- **UI Components**: Built on shadcn/ui components with Radix UI primitives and Tailwind CSS for styling
- **State Management**: React hooks and Tanstack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Styling**: Tailwind CSS with CSS variables for theming support

## Backend Architecture

The server uses Express.js with TypeScript and follows a RESTful API design:

- **File Upload**: Multer middleware for handling image uploads with memory storage
- **API Routes**: Centralized route registration with request/response logging
- **Error Handling**: Global error middleware for consistent error responses
- **Development**: Vite middleware integration for hot reloading in development

## Data Layer

**Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Separate shared schema module for type consistency between client and server
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development
- **Migration**: Drizzle Kit for schema migrations

**Key Models**:
- `generations`: Stores image generation records with original and generated image URLs
- `users`: User authentication data (currently defined but not implemented)

## Image Processing

- **Upload Flow**: Files are processed through Multer, converted to base64 data URLs
- **Validation**: File type and size restrictions (PNG/JPG, 10MB limit)
- **Client-side Processing**: Image resizing and compression utilities for optimization

## External Dependencies

- **Database**: Neon PostgreSQL serverless database
- **UI Framework**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with custom design tokens
- **Validation**: Zod for runtime type validation
- **File Handling**: Multer for multipart form data processing
- **Date Utilities**: date-fns for date formatting and manipulation
- **Build Tools**: Vite for development and production builds

The application uses a modular architecture with clear separation between client and server code, shared type definitions, and a flexible storage abstraction that can be easily extended for production database integration.
