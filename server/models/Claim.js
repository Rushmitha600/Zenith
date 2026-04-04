import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema({
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  claimNumber: { type: String, unique: true },
  type: { 
    type: String, 
    enum: [
      'curfew',           // New
      'bundh',            // New
      'weather_disruption' // New
    ], 
    required: true 
  },
  description: String,
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'verified', 'approved', 'rejected'],
    default: 'pending'
  },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectedAt: Date,
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminNotes: { type: String, default: '' },
  location: {
    city: String,
    area: String
  },
  dateOfIncident: Date,
  createdAt: { type: Date, default: Date.now }
});

claimSchema.pre('save', function(next) {
  if (!this.claimNumber) {
    this.claimNumber = `CLM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

export default mongoose.model('Claim', claimSchema);