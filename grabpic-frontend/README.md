# GrabPic Frontend

Next.js-based frontend for the GrabPic event management and photo sharing platform.

## Overview

This is a modern React/Next.js application featuring:
- **Authentication**: User registration and login
- **Event Management**: Create, browse, and manage events
- **Photo Gallery**: View and organize event photos
- **User Dashboard**: Personalized user settings and profile
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript support

## Prerequisites

- Node.js 18+ and npm
- Docker & Docker Compose (optional)

## Project Structure

```
grabpic-frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout component
│   │   ├── globals.css         # Global styles
│   │   ├── events/
│   │   │   └── [eventSlug]/    # Event detail page
│   │   └── create/             # Event creation page
│   ├── components/
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   └── auth-shell.tsx
│   │   ├── home/
│   │   │   ├── authenticated-homepage.tsx
│   │   │   └── authenticated-navbar.tsx
│   │   ├── landing/
│   │   │   ├── hero.tsx
│   │   │   ├── features.tsx
│   │   │   ├── nav-bar.tsx
│   │   │   └── cta.tsx
│   │   └── ui/                 # Reusable UI components
│   ├── lib/
│   │   ├── api-client.ts       # API client configuration
│   │   ├── api-types.ts        # API type definitions
│   │   ├── auth.ts             # Authentication utilities
│   │   ├── navigation.ts       # Navigation utilities
│   │   └── utils.ts            # General utilities
│   └── pages/
│       ├── index.tsx           # Home page
│       ├── login.tsx
│       ├── register.tsx
│       ├── gallery.tsx
│       └── settings.tsx
├── public/
│   ├── events/                 # Event images
│   └── gallery/                # Gallery images
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## Setup

### Using Docker

1. **Create `.env.local` file:**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. **Build and run:**
```bash
docker-compose up -d
```

3. **Access the application:**
- Open http://localhost:3000 in your browser

### Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env.local` file:**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Run development server:**
```bash
npm run dev
```

4. **Open in browser:**
- Navigate to http://localhost:3000

### Building for Production

```bash
npm run build
npm run start
```

## Environment Variables

### Public Environment Variables (`.env.local`)

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Server-Side Environment Variables

These can be added to `.env.local` for server-side use:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-key
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking

# Other
npm run clean        # Clean build artifacts
```

## Pages and Routes

### Public Routes
- `/` - Landing page
- `/login` - User login
- `/register` - User registration

### Protected Routes
- `/events` - Events list and discovery
- `/events/[eventSlug]` - Event details
- `/events/create` - Create new event
- `/gallery` - User's photo gallery
- `/settings` - User settings and profile

## Components

### Authentication Components
- `LoginForm` - Login form with validation
- `RegisterForm` - Registration form
- `AuthShell` - Auth page layout wrapper

### Landing Components
- `Hero` - Hero section
- `Features` - Features showcase
- `NavBar` - Navigation bar
- `Footer` - Site footer
- `CTA` - Call-to-action section

### Home Components
- `AuthenticatedHomepage` - Authenticated user homepage
- `AuthenticatedNavbar` - Navigation for authenticated users

### UI Components
- `Button` - Reusable button component
- `Input` - Form input component
- `Card` - Card component
- `Badge` - Badge component
- `Label` - Form label component
- `Separator` - Visual separator

## API Integration

### API Client Setup

The API client is configured in `src/lib/api-client.ts`:

```typescript
import { apiClient } from '@/lib/api-client';

// Make API requests
const response = await apiClient.get('/events');
const eventData = await apiClient.post('/events', eventPayload);
```

### API Types

Type definitions for API responses are in `src/lib/api-types.ts`.

## Authentication

Authentication is managed using JWT tokens:
- Tokens are stored securely (httpOnly cookies recommended)
- Auth utilities in `src/lib/auth.ts`
- Protected routes use `auth.middleware.ts` from backend

## Styling

The project uses:
- **Tailwind CSS** for utility-first styling
- **PostCSS** for CSS processing
- Global styles in `src/app/globals.css`

## Performance Optimization

- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Static generation where possible
- API response caching strategies

## Testing

```bash
npm test              # Run tests
npm coverage          # Generate coverage report
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility

The application follows WCAG 2.1 guidelines:
- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Color contrast compliance

## SEO

- Meta tags for each page
- Open Graph tags for social sharing
- Sitemap generation
- Robots.txt configuration

## Deployment

### Build Process

```bash
npm run build
```

This creates an optimized production build in the `.next` directory.

### Docker Deployment

```dockerfile
# Build stage
FROM node:23-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:23-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/.next ./next
COPY package*.json ./
RUN npm install --production
EXPOSE 3000
CMD ["npm", "start"]
```

### Recommended Deployment Platforms

- Vercel (Next.js optimized)
- Netlify
- AWS Amplify
- Azure App Service
- Self-hosted with Docker

## Troubleshooting

**Issue: API calls returning 404**
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct
- Check backend server is running
- Verify CORS configuration on backend

**Issue: Build failing**
- Clear `.next` and `node_modules`: `npm run clean && npm install`
- Check TypeScript errors: `npm run type-check`

**Issue: Styles not loading**
- Verify Tailwind CSS configuration
- Clear Next.js cache: `rm -rf .next`

## Performance Tips

- Use Next.js Image component for images
- Implement request debouncing for search
- Cache API responses where appropriate
- Use React.memo for expensive components
- Monitor with Chrome DevTools

## Contributing

- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent naming conventions
- Add JSDoc comments for complex logic
- Test components before submitting

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
