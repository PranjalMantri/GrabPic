# GrabPic Backend

Node.js/Express.js backend API for GrabPic event management and photo organization platform.

## Overview

This backend service provides:
- **User Authentication**: JWT-based auth with registration and login
- **Event Management**: Create, update, and manage events
- **Media Handling**: Upload and manage photos with Cloudinary integration
- **User Profiles**: Manage user information and settings
- **Notifications**: Real-time notifications for events and activities

## Prerequisites

- Node.js 18+ and npm
- Docker & Docker Compose
- MongoDB database
- Cloudinary account (for image hosting)

## Project Structure

```
grabpic-backend/
├── src/
│   ├── app.ts              # Express app configuration
│   ├── server.ts           # Server entry point
│   ├── config/
│   │   ├── cloudinary.ts   # Cloudinary configuration
│   │   └── db.ts           # Database connection
│   ├── controller/
│   │   ├── auth.controller.ts
│   │   ├── event.controller.ts
│   │   ├── notification.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── upload.ts       # File upload middleware
│   ├── models/
│   │   ├── event.model.ts
│   │   ├── media.model.ts
│   │   ├── notification.model.ts
│   │   └── user.model.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── event.routes.ts
│   │   ├── notification.routes.ts
│   │   └── user.routes.ts
│   ├── utils/
│   │   ├── cloudinary.ts   # Cloudinary utilities
│   │   └── jwt.ts          # JWT utilities
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Setup

### Using Docker

1. **Create `.env` file:**
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/grabpic
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

2. **Build and run:**
```bash
docker-compose up -d
```

### Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env` file** with above variables

3. **Run in development:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
npm run start
```

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/grabpic

# Authentication
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh-token` - Refresh JWT token

### Events (`/api/events`)
- `GET /` - Get all events
- `POST /` - Create new event
- `GET /:id` - Get event details
- `PUT /:id` - Update event
- `DELETE /:id` - Delete event
- `POST /:id/join` - Join an event
- `POST /:id/leave` - Leave an event

### Users (`/api/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /:id` - Get user by ID
- `DELETE /:id` - Delete user account

### Notifications (`/api/notifications`)
- `GET /` - Get all notifications
- `GET /:id` - Get notification details
- `PUT /:id/read` - Mark as read
- `DELETE /:id` - Delete notification

### Media (`/api/media`)
- `POST /upload` - Upload media to event
- `GET /:eventId` - Get event media
- `DELETE /:id` - Delete media

## API Documentation

API documentation is available at `/api-docs` (Swagger UI) if configured.

## Database Models

- **User**: User account information and authentication
- **Event**: Event details and metadata
- **Media**: Photo/media files associated with events
- **Notification**: User notifications for events and activities

## File Upload

The service uses Multer for file uploads and Cloudinary for storage:
- Maximum file size: 10MB
- Allowed formats: JPEG, PNG, GIF, WebP
- Files are uploaded to Cloudinary and stored with reference in database

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Performance Optimization

- Implement pagination for list endpoints
- Use database indexing on frequently queried fields
- Cache frequently accessed data
- Optimize image uploads with Cloudinary
- Use connection pooling for database

## Security

- JWT authentication for protected routes
- Password hashing with bcrypt
- CORS configuration
- Input validation and sanitization
- Rate limiting (recommended to implement)

## Deployment

### Docker Production Build

```bash
docker build -t grabpic-backend:latest .
docker run -p 3000:3000 --env-file .env grabpic-backend:latest
```

### Environment Recommendations for Production

- Use strong JWT_SECRET
- Enable HTTPS
- Configure proper CORS origins
- Use environment-specific database connections
- Enable rate limiting
- Configure monitoring and logging

## Contributing

- Follow TypeScript best practices
- Use meaningful variable names
- Add JSDoc comments to functions
- Maintain consistent code formatting

## References

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Cloudinary API](https://cloudinary.com/documentation/image_upload_api)
- [JWT.io](https://jwt.io/)
