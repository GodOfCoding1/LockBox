# Local Development Setup Guide

This guide will help you run both the backend and frontend locally.

## Prerequisites

- Node.js (v14 or higher recommended)
- npm (comes with Node.js)
- MongoDB (local instance or MongoDB Atlas connection string)
- Cloudinary account (for file storage)

## Step 1: Backend Setup

### 1.1 Install Dependencies

```bash
cd corrupted-files-api
npm install
```

### 1.2 Environment Variables

Create a `.env` file in the `corrupted-files-api` directory with the following variables:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/lockbox
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/lockbox

# JWT Secret Key (use a strong random string)
JWT_KEY=your-secret-jwt-key-here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_ACCESS_KEY=your-cloudinary-api-key
CLOUDINARY_SECRET_ACCESS_KEY=your-cloudinary-secret-key

# Server Port (optional, defaults to 8000)
PORT=8000
```

### 1.3 Start the Backend Server

For development (with auto-reload):
```bash
npm run dev
```

For production:
```bash
npm start
```

The backend will run on `http://localhost:8000`

## Step 2: Frontend Setup

### 2.1 Install Dependencies

```bash
cd frontend
npm install
```

### 2.2 Configure API Proxy (Optional but Recommended)

The frontend uses `/api` as the base URL. To proxy API requests to the backend during development, add a `proxy` field to `frontend/package.json`:

```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "proxy": "http://localhost:8000",
  ...
}
```

**Note:** If you don't add the proxy, you'll need to configure CORS on the backend or update the axios baseURL to point to `http://localhost:8000/api`.

### 2.3 Start the Frontend Development Server

```bash
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## Step 3: Running Both Servers

You'll need **two terminal windows/tabs**:

### Terminal 1 - Backend:
```bash
cd corrupted-files-api
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

## Quick Start Commands

If you want to start both servers quickly, you can use these commands in separate terminals:

**Backend:**
```bash
cd corrupted-files-api && npm run dev
```

**Frontend:**
```bash
cd frontend && npm start
```

## Troubleshooting

### Backend Issues

1. **MongoDB Connection Error**: Make sure MongoDB is running locally or your MongoDB Atlas connection string is correct.
2. **Port Already in Use**: Change the `PORT` in your `.env` file or kill the process using port 8000.
3. **Missing Environment Variables**: Ensure all required variables are set in your `.env` file.

### Frontend Issues

1. **API Requests Failing**: 
   - Add the `proxy` field to `frontend/package.json` pointing to `http://localhost:8000`
   - Or ensure CORS is enabled on the backend
2. **Port 3000 Already in Use**: React will prompt you to use a different port, or you can specify one: `PORT=3001 npm start`

### CORS Issues

If you're not using the proxy and getting CORS errors, you may need to enable CORS in the backend. The backend already has `cors` as a dev dependency, but you may need to configure it in `server.js`.

## Environment Variables Summary

**Backend Required:**
- `MONGO_URI` - MongoDB connection string
- `JWT_KEY` - Secret key for JWT tokens and sessions
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_ACCESS_KEY` - Your Cloudinary API key
- `CLOUDINARY_SECRET_ACCESS_KEY` - Your Cloudinary secret key
- `PORT` - Server port (optional, defaults to 8000)

**Frontend:**
- No environment variables required for basic setup

## Accessing the Application

Once both servers are running:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- WebSocket: ws://localhost:8000 (for file decryption)

