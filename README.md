
# AI Studio

An AI-powered image generation studio built with React, TypeScript, and Express. Users can upload images, add creative prompts, select artistic styles, and generate transformed versions of their images using a modern, accessible interface.

## Features

- **Image Upload**: Drag & drop or click to upload PNG/JPG images (up to 10MB)
- **Style Selection**: Choose from 6 artistic styles (Editorial, Streetwear, Vintage, Minimalist, Cyberpunk, Watercolor)
- **Creative Controls**: Adjust creativity and strength parameters for fine-tuned results
- **Generation History**: View and manage your recent generations with local storage
- **Responsive Design**: Mobile-friendly interface with adaptive layouts
- **Accessibility**: Full keyboard navigation and screen reader support

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16 

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   npm run db:push
   ```

### Running the Application

1. **Development mode:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5000`

2. **Production build:**
   ```bash
   npm run build
   npm start
   ```

### Testing

1. **Run unit tests:**
   ```bash
   npm test
   ```

2. **Run end-to-end tests:**
   ```bash
   npx cypress open
   ```
   or
   ```bash
   npx cypress run
   ```

3. **Type checking:**
   ```bash
   npm run check
   ```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and configurations
│   │   ├── pages/         # Page components
│   │   └── types/         # TypeScript type definitions
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database abstraction layer
│   └── vite.ts           # Development middleware
├── shared/               # Shared types and schemas
├── cypress/              # E2E tests
└── dist/                 # Production build output
```

## API Endpoints

- `POST /api/upload` - Upload and process images
- `POST /api/generate` - Generate styled images
- `GET /api/generations` - Fetch generation history
- `GET /api/generations/:id` - Get specific generation

## Design Architecture

### Frontend Architecture

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React hooks + TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture

- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **File Upload**: Multer middleware with memory storage
- **Validation**: Zod schemas for request/response validation
- **Development**: Hot reloading with Vite middleware integration

### Key Design Decisions

1. **Modular Component Architecture**: Components are designed to be reusable and composable with clear prop interfaces
2. **Type Safety**: End-to-end TypeScript with shared schemas between client and server
3. **Accessibility First**: ARIA labels, keyboard navigation, and semantic HTML throughout
4. **Progressive Enhancement**: Works without JavaScript for basic functionality
5. **Error Resilience**: Retry mechanisms, graceful degradation, and comprehensive error handling

### Database Schema

- **generations**: Stores image generation records
  - `id`: Unique identifier
  - `imageUrl`: Generated image URL
  - `originalImageUrl`: Original uploaded image data URL
  - `prompt`: User's creative prompt
  - `style`: Selected artistic style
  - `createdAt`: Timestamp

### Performance Optimizations

- **Image Processing**: Client-side compression and resizing
- **Lazy Loading**: Components and routes loaded on demand
- **Caching**: TanStack Query for intelligent server state caching
- **Bundle Splitting**: Automatic code splitting with Vite

### Testing Strategy

- **Unit Tests**: React Testing Library + Vitest for component testing
- **Integration Tests**: Cypress for full user workflow testing
- **Accessibility Tests**: Automated a11y testing in Cypress
- **Type Checking**: Continuous TypeScript validation

## Environment Variables

No additional environment variables required for basic functionality. The application uses:

- `NODE_ENV`: Set automatically by npm scripts
- `PORT`: Defaults to 5000 (configured in .replit)

## Browser Support

- Chrome/Edge 90+
- Firefox 90+
- Safari 14+

## Contributing

1. Follow the existing code style (Prettier formatting)
2. Write tests for new functionality
3. Ensure accessibility compliance
4. Update documentation as needed
