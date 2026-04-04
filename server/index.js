import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import policyRoutes from './routes/policies.js';
import claimRoutes from './routes/claims.js';
import trackingRoutes from './routes/tracking.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: '*',
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const labels = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: mongoState === 1 ? 'OK' : 'DEGRADED',
    message: 'Server is running',
    mongo: labels[mongoState] ?? 'unknown',
    mongoReadyState: mongoState,
    hasMongoUri: Boolean(process.env.MONGODB_URI?.trim()),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

function requireMongo(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database not connected. Set MONGODB_URI in Render environment and redeploy.',
      mongoReadyState: mongoose.connection.readyState
    });
  }
  next();
}

// Tracking uses OpenWeather only — no Mongo
app.use('/api/tracking', trackingRoutes);

app.use('/api/auth', requireMongo, authRoutes);
app.use('/api/policies', requireMongo, policyRoutes);
app.use('/api/claims', requireMongo, claimRoutes);
app.use('/api/admin', requireMongo, adminRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  const MONGODB_URI = process.env.MONGODB_URI?.trim();

  if (!MONGODB_URI) {
    console.error('FATAL: MONGODB_URI is missing. In Render: Environment → add MONGODB_URI (MongoDB Atlas connection string).');
    process.exit(1);
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 20000
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB failed:', err.message);
    console.error('→ Atlas: Network Access must allow 0.0.0.0/0 (or Render outbound IPs)');
    console.error('→ URI: user/password must be URL-encoded if they contain special chars');
    process.exit(1);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server listening on ${PORT}`);
  });
}

start();
