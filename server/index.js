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
    hint:
      mongoState !== 1
        ? 'Add MONGODB_URI in Render → Environment (Atlas string). Atlas → Network Access → allow 0.0.0.0/0'
        : undefined,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

function requireMongo(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database not connected. Set MONGODB_URI in Render and redeploy.',
      mongoReadyState: mongoose.connection.readyState
    });
  }
  next();
}

app.use('/api/tracking', trackingRoutes);

// Auth: captcha & email OTP work without DB; DB checks are inside auth.js for login/register/etc.
app.use('/api/auth', authRoutes);
app.use('/api/policies', requireMongo, policyRoutes);
app.use('/api/claims', requireMongo, claimRoutes);
app.use('/api/admin', requireMongo, adminRoutes);

const PORT = process.env.PORT || 5000;

async function connectMongo() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    console.error(
      '⚠️  MONGODB_URI is not set. Render → Environment → add your MongoDB Atlas connection string.'
    );
    console.error('   Server is running; login/register will return 503 until DB is configured.');
    return;
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 25000
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('   Check: Atlas Network Access (0.0.0.0/0), user/password in URI (URL-encode special chars).');
    console.error('   Server keeps running — fix env and redeploy, or use Atlas “Test” connection.');
  }
}

async function start() {
  await connectMongo();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
