import mongoose from 'mongoose';

const deviceFingerprintSchema = new mongoose.Schema({
  fingerprint: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userAgent: String,
  ip: String,
  deviceInfo: {
    type: mongoose.Schema.Types.Mixed
  },
  firstSeen: {
    type: Date,
    default: Date.now
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  loginCount: {
    type: Number,
    default: 1
  }
});

deviceFingerprintSchema.index({ fingerprint: 1 });
deviceFingerprintSchema.index({ userId: 1 });

export default mongoose.model('DeviceFingerprint', deviceFingerprintSchema);