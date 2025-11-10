# Image Compression Application

A full-stack application for compressing images with customizable quality, size, and resolution settings. Built with React, Node.js, Express, and Docker.

## Features

- 📤 **Image Upload**: Drag and drop or click to upload images (JPEG, PNG, GIF, WebP)
- 🎛️ **Customizable Compression**:
  - Quality slider (10-100%)
  - Output format selection (JPEG, PNG, WebP)
  - Maximum width and height settings
  - Target file size (automatic quality adjustment)
- 🐳 **Docker Support**: Easy deployment with Docker Compose
- 🎨 **Modern UI**: Beautiful, responsive interface built with Tailwind CSS

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express.js
- Sharp (for image processing)
- Multer (for file uploads)

### Deployment
- Docker
- Docker Compose
- Nginx (for frontend)

## Project Structure

```
compressimage/
├── backend/
│   ├── routes/
│   │   └── compression.js
│   ├── uploads/
│   ├── compressed/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUploader.jsx
│   │   │   ├── CompressionOptions.jsx
│   │   │   └── CompressionResult.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for Docker deployment)

### Local Development

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create a `.env` file:
```env
PORT=5000
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:5000`.

### Docker Deployment

1. Make sure Docker and Docker Compose are installed.

2. Build and start all services:
```bash
docker-compose up --build
```

3. The application will be available at:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

4. To stop all services:
```bash
docker-compose down
```

## API Endpoints

### POST `/api/compress/image`
Compress an image with specified options.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `image`: Image file
  - `quality`: Number (10-100, default: 80)
  - `format`: String (jpeg, png, webp, default: jpeg)
  - `maxWidth`: Number (optional)
  - `maxHeight`: Number (optional)
  - `targetSize`: Number in KB (optional)

**Response:**
- Downloads the compressed image file

### GET `/api/compress/history`
Get compression history (not available - database removed).

**Response:**
```json
{
  "message": "Compression history is not available. Database has been removed from this project.",
  "history": []
}
```

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Environment Variables

### Backend
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:3000)

## Scaling Considerations

The application is designed to be scalable:

1. **Stateless Backend**: Each request is independent, allowing horizontal scaling
2. **File Cleanup**: Temporary files are automatically cleaned up after processing
3. **Docker**: Easy to scale services using Docker Swarm or Kubernetes

### Scaling with Docker Compose

To scale the backend service:
```bash
docker-compose up --scale backend=3
```

## Production Deployment

For production deployment:

1. Update environment variables in `docker-compose.yml`
2. Configure proper CORS settings
3. Set up SSL/TLS certificates
4. Use a reverse proxy (Nginx) for load balancing
5. Implement rate limiting
6. Set up monitoring and logging

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

