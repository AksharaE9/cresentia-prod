import './loadEnv.js';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import connectDB, { isConnected, connectionError } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Robust CORS Middleware (MUST BE BEFORE ANY OTHER MIDDLEWARE OR DB CHECKS)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Set origin header - reflect requesting origin to support all Vercel previews and localhost
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Range, X-Api-Version');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
  
  // Handle preflight requests immediately with 204
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Connect to database on startup (non-blocking for serverless)
connectDB().then(connected => {
  if (connected) {
    console.log('✅ Database ready for requests');
  } else {
    console.warn('⚠️ Database connection initial check pending');
  }
}).catch(err => {
  console.error('⚠️ DB connection error:', err.message);
});

// Middleware to ensure DB connection before processing DB routes
app.use(async (req, res, next) => {
  // Skip health check and root
  if (req.path === '/api/health' || req.path === '/health' || req.path === '/') {
    return next();
  }
  
  // Check if already connected
  if (isConnected()) {
    return next();
  }
  
  // Attempt connection for cold start
  const connected = await connectDB();
  if (!connected) {
    return res.status(503).json({ 
      message: 'Database connection is waking up. Please retry in a moment.',
      error: connectionError || 'Connection timeout'
    });
  }
  
  next();
});

// Health check endpoints
app.get(['/', '/api', '/api/health', '/health'], (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Crescentia API',
    database: isConnected() ? 'connected' : 'connecting',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

// Mount routes for BOTH '/api/...' and '/...' to handle any Vercel proxy or rewrite variations
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/courses', courseRoutes);
app.use('/courses', courseRoutes);

app.use('/api/enrollments', enrollmentRoutes);
app.use('/enrollments', enrollmentRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/uploads', uploadRoutes);
app.use('/uploads', uploadRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/notifications', notificationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
