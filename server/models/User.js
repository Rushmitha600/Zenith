import mongoose from 'mongoose';

const deliveryLocationSchema = new mongoose.Schema({
  name: { type: String },
  city: { type: String },
  area: { type: String },
  pincode: { type: String }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  dailyIncome: { type: Number, default: 0 },
  aadharNumber: { type: String, default: '' },
  panNumber: { type: String, default: '' },
  gigWorkerId: { type: String, default: '' },
  // Policy fields - make them optional
  selectedPlan: { type: String, enum: ['basic', 'standard', 'premium'], default: undefined },
  weeklyPremium: { type: Number, default: 0 },
  coverageAmount: { type: Number, default: 0 },
  policyStatus: { type: String, enum: ['active', 'expired', 'inactive'], default: 'inactive' },
  policyStartDate: { type: Date },
  policyEndDate: { type: Date },
  bankDetails: {
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    bankName: { type: String, default: '' },
    accountHolderName: { type: String, default: '' },
    upiId: { type: String, default: '' }
  },
  currentLocation: {
    city: { type: String, default: '' },
    area: { type: String, default: '' },
    address: { type: String, default: '' }
  },
  deliveryLocations: [deliveryLocationSchema],
  role: { type: String, enum: ['worker', 'admin'], default: 'worker' },
  createdAt: { type: Date, default: Date.now }
});

// Remove existing model if exists
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model('User', userSchema);