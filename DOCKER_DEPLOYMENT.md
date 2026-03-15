# Docker Setup & Deployment Guide

## Overview

Your app now uses Docker with:
- **Multi-stage build**: Optimized for production (small final image)
- **yt-dlp**: Installed via pip (works on Linux/macOS/Windows)
- **ffmpeg**: Included for video processing
- **Health checks**: Automatic container health monitoring

## Local Development with Docker

### Build and Run Locally

```bash
# Build the Docker image
docker build -t video-downloader .

# Run the container
docker run -p 3000:3000 video-downloader

# Or use docker-compose (simpler)
docker-compose up
```

### Test the API

```bash
curl http://localhost:3000/
curl -X POST http://localhost:3000/api/video/info \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=..."}'
```

## Deployment to Heroku

### Option 1: Container Registry (Recommended)

```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Login to Heroku Container Registry
heroku container:login

# Push Docker image
heroku container:push web -a your-app-name

# Release the container
heroku container:release web -a your-app-name

# View logs
heroku logs --tail -a your-app-name
```

### Option 2: Git Push (Alternative)

```bash
# Create Heroku app
heroku create your-app-name

# Add Heroku remote
heroku git:remote -a your-app-name

# Push to Heroku
git push heroku main
```

## Environment Variables (Heroku)

If you need to set environment variables on Heroku:

```bash
heroku config:set PORT=3000 -a your-app-name
heroku config:set NODE_ENV=production -a your-app-name
```

## Verify Deployment

```bash
# Check if app is running
heroku open -a your-app-name

# View logs
heroku logs --tail -a your-app-name

# Test the API
curl https://your-app-name.herokuapp.com/
```

## What Changed

1. **Dockerfile**: Multi-stage build with yt-dlp installed via pip
2. **video.service.ts**: Now uses `yt-dlp` command instead of `.exe` binary
3. **.dockerignore**: Excludes unnecessary files from Docker build
4. **docker-compose.yml**: Local development setup
5. **heroku.yml**: Heroku stack configuration

## Troubleshooting

### If you get "yt-dlp not found"
- Rebuild: `docker-compose down && docker-compose up --build`

### If container crashes
```bash
heroku logs --tail -a your-app-name
```

### To SSH into running container
```bash
heroku dyno:exec bash -a your-app-name
```

### Clear Docker cache and rebuild
```bash
docker-compose build --no-cache
```

## Why This Works on Heroku Now

✅ No `.exe` files (Linux-compatible)  
✅ yt-dlp installed via pip (cross-platform)  
✅ ffmpeg included for video processing  
✅ Multi-stage build keeps image small  
✅ Health checks for reliability  
