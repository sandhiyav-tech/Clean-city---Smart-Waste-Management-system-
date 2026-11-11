require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');
const routes = require('./routes');
const demoRouter = require('./mock/demoStore');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow Leaflet map tiles and external icons
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration supporting cookies and frontends
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // In serverless / same-domain deployment, origin may be undefined or match Vercel preview URLs
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for API demo usage
      }
    },
    credentials: true,
  })
);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint (always responds even if DB is connecting)
app.get('/api/health', (req, res) => {
  const isConnected = require('mongoose').connection.readyState === 1;
  res.status(200).json({
    success: true,
    status: 'healthy',
    backend: 'Express Serverless Function Active',
    mode: isConnected ? 'MongoDB Cloud Database (Connected)' : 'In-Memory Demo Database (Zero-Setup Active)',
    database: isConnected ? 'connected' : 'in-memory-fallback',
    timestamp: new Date().toISOString(),
  });
});

// Serverless DB connection middleware: attempts to connect to MongoDB, with seamless fallback to In-Memory Demo Database
app.use(async (req, res, next) => {
  if (require('mongoose').connection.readyState === 1) {
    return next();
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URL || '';
  const isPlaceholder = !uri || uri.includes('cluster0.demo.mongodb.net') || uri.includes('127.0.0.1');

  if (!isPlaceholder) {
    try {
      await connectDB();
      return next();
    } catch (err) {
      console.warn('[MongoDB Notice]: Real MongoDB not reachable (' + err.message + '). Seamlessly using In-Memory Demo Store.');
    }
  }

  // Fallback to In-Memory Demo Store so app always works out of the box
  req.useDemoFallback = true;
  next();
});

// API Routes (Real MongoDB) or Demo Router (Fallback)
app.use('/api', (req, res, next) => {
  if (req.useDemoFallback) {
    return demoRouter(req, res, next);
  }
  return routes(req, res, next);
});

// 404 for unmatched /api routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

// Serve frontend static files from client/dist (for Render, Railway, Docker, & standalone production)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
module.exports.default = app;

