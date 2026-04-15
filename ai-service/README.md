# AI Service

FastAPI-based AI service for image processing, face recognition, and vector embeddings using InsightFace and FAISS.

## Overview

This service provides:
- **Image Processing**: Face detection and recognition
- **Vector Embeddings**: Generate and manage embeddings for similarity search
- **AI Engine**: Advanced ML models for image analysis
- **Vector Store**: FAISS-based vector database for efficient similarity matching

## Prerequisites

- Docker & Docker Compose
- GPU support (optional but recommended)
- Python 3.11+ (for local development)

## Project Structure

```
ai-service/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── dependencies.py      # Dependency injection
│   ├── models/              # Data models
│   ├── routes/
│   │   ├── processing.py    # Image processing endpoints
│   │   └── registration.py  # User registration endpoints
│   ├── schema/              # Request/response schemas
│   ├── services/
│   │   ├── ai_engine.py     # AI model inference
│   │   └── vector_store.py  # Vector database operations
│   └── utils/
│       └── helpers.py       # Utility functions
├── models/                  # Pre-trained model indices
├── docker-compose.yml
├── Dockerfile
└── requirements.txt
```

## Setup

### Using Docker

1. **Build and run the service:**
```bash
docker-compose up -d
```

2. **Access the API:**
- API Documentation: http://localhost:8000/docs
- Alternative API Docs: http://localhost:8000/redoc

### Local Development

1. **Create virtual environment:**
```bash
python -m venv venv
source venv/Scripts/activate  # On Windows
# or
source venv/bin/activate      # On Mac/Linux
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Run the application:**
```bash
uvicorn app.main:app --reload
```

## Environment Variables

Create a `.env` file in this directory:

```env
FAISS_INDEX_PATH=./models
LOG_LEVEL=INFO
```

## API Endpoints

### Image Processing (`/api/processing`)
- `POST /process` - Process image and extract features
- `POST /recognize` - Recognize faces in image

### User Registration (`/api/registration`)
- `POST /register` - Register new user with face embeddings
- `GET /users/{user_id}` - Get user information

## API Documentation

The service provides interactive API documentation via Swagger UI at `/docs` and ReDoc at `/redoc`.

## GPU Support

The Dockerfile uses NVIDIA CUDA 12.6.3 with cuDNN for GPU acceleration. Ensure you have:
- NVIDIA GPU with compute capability 3.5+
- NVIDIA Docker runtime installed

## Troubleshooting

**Issue: CUDA/GPU not detected**
- Verify NVIDIA Docker runtime is installed
- Check NVIDIA drivers: `nvidia-smi`

**Issue: Model files not found**
- Ensure model index files are in `./models/`
- Check file permissions

**Issue: Out of memory**
- Reduce batch size in requests
- Increase Docker memory allocation

## Development

### Adding new endpoints

1. Create a new route file in `app/routes/`
2. Import and include the router in `app/main.py`
3. Define request/response schemas in `app/schema/schemas.py`

### Running tests

```bash
pytest tests/ --cov
```

## Performance Tips

- Use GPU acceleration for better performance
- Batch requests when possible
- Monitor memory usage with large image batches
- Consider caching embeddings for frequently processed images

## Contributing

Follow Python PEP 8 guidelines and add docstrings to functions.

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [FAISS Documentation](https://github.com/facebookresearch/faiss)
- [InsightFace](https://github.com/deepinsight/insightface)
