import mongoose from 'mongoose';

const fraudAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fraudScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  level: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  riskFactors: [{
    factor: String,
    score: Number,
    details: mongoose.Schema.Types.Mixed
  }],
  action: {
    type: String,
    enum: ['allow', 'enhanced_verification', 'manual_review', 'block'],
    required: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'failed'],
    default: 'pending'
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
fraudAlertSchema.index({ userId: 1, createdAt: -1 });
fraudAlertSchema.index({ fraudScore: -1 });
fraudAlertSchema.index({ level: 1, resolvedAt: 1 });

export default mongoose.model('FraudAlert', fraudAlertSchema);