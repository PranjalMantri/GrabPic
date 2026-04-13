# Use NVIDIA CUDA base image with cuDNN for GPU-accelerated inference
FROM nvidia/cuda:12.6.3-cudnn-runtime-ubuntu22.04

# Prevent interactive prompts during package install
ENV DEBIAN_FRONTEND=noninteractive

# 1. Install Python 3.11 and system libraries for OpenCV, InsightFace, and Video
RUN apt-get update && apt-get install -y \
    software-properties-common \
    && add-apt-repository ppa:deadsnakes/ppa \
    && apt-get update && apt-get install -y \
    python3.11 \
    python3.11-venv \
    python3.11-dev \
    python3-pip \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    ffmpeg \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 2. Make python3.11 the default python
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.11 1 \
    && update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1

# 3. Install pip for Python 3.11
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.11

# 4. Set the working directory inside the container
WORKDIR /app

# 5. Copy requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy your entire project into the container
COPY . .

# 7. Tell Python where to find your modules
ENV PYTHONPATH=/app

# 8. Run the FastAPI app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]