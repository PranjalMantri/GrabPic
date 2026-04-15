# GrabPic

A comprehensive event management and photo sharing platform built with a modern full-stack architecture. GrabPic enables users to create events, share memories, and organize photos efficiently with AI-powered features.

## 🎯 Project Overview

GrabPic is a monorepo containing three main services:

1. **Frontend** (`grabpic-frontend/`) - Next.js React application
2. **Backend** (`grabpic-backend/`) - Node.js/Express API
3. **AI Service** (`ai-service/`) - Python/FastAPI ML service

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GrabPic Platform                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │   Frontend       │  │   Documentation  │             │
│  │  (Next.js)       │  │   & Assets       │             │
│  │  Port: 3000      │  └──────────────────┘             │
│  └────────┬─────────┘                                    │
│           │                                              │
│           │ HTTP/REST                                    │
│           ▼                                              │
│  ┌──────────────────┐         ┌──────────────────┐      │
│  │    Backend API   │◄────────┤  AI Service      │      │
│  │  (Node.js/Exp)   │         │  (Python/FastAPI)│      │
│  │  Port: 3001      │         │  Port: 8000      │      │
│  └────────┬─────────┘         └──────────────────┘      │
│           │                            │                 │
│           └──────────────┬─────────────┘                 │
│                          │                               │
│                    ┌─────▼────────┐                      │
│                    │ Databases    │                      │
│                    │ & Models     │                      │
│                    └──────────────┘                      │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
GrabPic/
├── grabpic-frontend/          # Next.js frontend application
│   ├── README.md              # Frontend documentation
│   ├── Dockerfile             # Frontend container
│   ├── docker-compose.yml     # Frontend services
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
├── grabpic-backend/           # Node.js/Express backend API
│   ├── README.md              # Backend documentation
│   ├── Dockerfile             # Backend container
│   ├── docker-compose.yml     # Backend services
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
│
├── ai-service/                # Python/FastAPI AI service
│   ├── README.md              # AI service documentation
│   ├── Dockerfile             # AI service container
│   ├── docker-compose.yml     # AI service services
│   ├── app/
│   ├── requirements.txt
│   └── models/
│
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local AI service development)
- MongoDB (included in Docker services)

### Using Docker Compose (Recommended)

1. **Start all services:**
```bash
# Frontend
cd grabpic-frontend && docker-compose up -d && cd ..

# Backend
cd grabpic-backend && docker-compose up -d && cd ..

# AI Service
cd ai-service && docker-compose up -d && cd ..
```

2. **Verify services are running:**
```bash
docker ps
```

3. **Access the applications:**
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000/api
- AI Service Docs: http://localhost:8000/docs

### Local Development

#### 1. Frontend Setup
```bash
cd grabpic-frontend
npm install
npm run dev
# Open http://localhost:3000
```

#### 2. Backend Setup
```bash
cd grabpic-backend
npm install
cp .env.example .env
npm run dev
# Runs on http://localhost:3001/api
```

#### 3. AI Service Setup
```bash
cd ai-service
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
# Runs on http://localhost:8000
```

## 🔧 Environment Setup

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (.env)
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/grabpic
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### AI Service (.env)
```env
FAISS_INDEX_PATH=./models
LOG_LEVEL=INFO
```

## 📚 Service Documentation

Each service has comprehensive documentation:

- **[Frontend Documentation](grabpic-frontend/README.md)** - Next.js, React, Tailwind CSS
- **[Backend Documentation](grabpic-backend/README.md)** - Express.js, MongoDB, REST API
- **[AI Service Documentation](ai-service/README.md)** - FastAPI, ML models, Vector embeddings

## 🔌 API Integration

### Frontend ↔ Backend Communication
- REST API with JSON payloads
- JWT token-based authentication
- CORS enabled for frontend origin

### Backend ↔ AI Service Communication
- REST API for image processing
- Vector embedding generation
- Face detection and recognition

## 🐳 Docker Orchestration

### Running Individual Services

```bash
# Frontend
cd grabpic-frontend
docker-compose up -d

# Backend
cd grabpic-backend
docker-compose up -d

# AI Service
cd ai-service
docker-compose up -d
```

### Full Stack Composition

To run all services together, you can create a root `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build: ./grabpic-frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  backend:
    build: ./grabpic-backend
    ports:
      - "3001:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/grabpic
    depends_on:
      - mongo
      - ai-service

  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Environment variable management
- Input validation and sanitization
- Rate limiting (recommended)

## 📊 Features

### Core Features
- ✅ User registration and authentication
- ✅ Event creation and management
- ✅ Photo upload and gallery
- ✅ User profiles and settings
- ✅ Event notifications
- ✅ Photo sharing

### AI Features
- ✅ Face detection and recognition
- ✅ Image embeddings and similarity search
- ✅ Automated photo organization
- ✅ Vector-based search capabilities

### Frontend Features
- ✅ Responsive design
- ✅ Real-time updates
- ✅ Dark mode support
- ✅ Mobile-optimized UI
- ✅ Accessibility compliance

## 🗄️ Database Schema

### Collections
- **Users** - User accounts and profiles
- **Events** - Event information and metadata
- **Media** - Photo/media files
- **Notifications** - User notifications
- **Embeddings** - AI-generated embeddings for images

## 📈 Performance Optimization

- Image optimization with CDN (Cloudinary)
- Database indexing
- Caching strategies
- Code splitting
- Lazy loading
- GPU acceleration for AI models

## 🧪 Testing

### Frontend
```bash
cd grabpic-frontend
npm test
npm run type-check
```

### Backend
```bash
cd grabpic-backend
npm test
```

### AI Service
```bash
cd ai-service
pytest tests/
```

## 🔄 Development Workflow

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request
5. Code review and merge

## 📦 Deployment

### Vercel (Frontend)
```bash
# Automatic deployment from git
```

### AWS/Azure (Backend & AI Service)
```bash
docker push your-registry/grabpic-backend:latest
docker push your-registry/ai-service:latest
```

## 🐛 Troubleshooting

### Services Won't Start
1. Check Docker daemon is running
2. Verify port availability (3000, 3001, 8000, 27017)
3. Review environment variables
4. Check logs: `docker-compose logs -f`

### API Connection Issues
1. Verify backend is running
2. Check CORS configuration
3. Confirm environment variables
4. Test with curl/Postman

### Database Connection Issues
1. Ensure MongoDB is running
2. Verify connection string
3. Check authentication credentials
4. Review network connectivity

## 📞 Support

For issues and questions:
- Check service-specific READMEs
- Review error logs
- Verify environment configuration
- Check Docker container status

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

- Frontend Team: React/Next.js specialists
- Backend Team: Node.js/Express experts
- ML Team: Python/AI specialists

## 🗺️ Roadmap

- [ ] Real-time collaboration features
- [ ] Advanced AI-powered search
- [ ] Video support
- [ ] Social sharing features
- [ ] Mobile native apps
- [ ] Analytics dashboard

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [FastAPI Tutorial](https://fastapi.tiangolo.com/)
- [Docker Documentation](https://docs.docker.com/)
- [MongoDB University](https://university.mongodb.com/)

---

**Last Updated:** April 15, 2026

For detailed service documentation, see:
- 📖 [Frontend Guide](grabpic-frontend/README.md)
- 📖 [Backend Guide](grabpic-backend/README.md)
- 📖 [AI Service Guide](ai-service/README.md)