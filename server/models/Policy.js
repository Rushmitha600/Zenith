import mongoose from 'mongoose';

const policySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  policyNumber: { type: String, unique: true },
  planType: { type: String, enum: ['basic', 'standard', 'premium'], required: true },
  basePremium: { type: Number, required: true },
  totalPremium: { type: Number, required: true },
  coverageAmount: { type: Number, required: true },
  status: { type: String, default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: Date
});

policySchema.pre('save', function(next) {
  if (!this.policyNumber) {
    this.policyNumber = `GS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

export default mongoose.model('Policy', policySchema);