import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Register = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Email OTP States (Demo)
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dailyIncome: '',
    password: '',
    confirmPassword: '',
    role: 'worker',
    aadharNumber: '',
    panNumber: '',
    gigWorkerId: '',
    bankAccountNumber: '',
    bankIfscCode: '',
    bankName: '',
    accountHolderName: '',
    upiId: '',
    currentCity: '',
    currentArea: '',
    currentAddress: '',
    deliveryLocations: []
  });

  const [currentDeliveryLocation, setCurrentDeliveryLocation] = useState({
    name: '',
    city: '',
    area: '',
    pincode: ''
  });

  const [errors, setErrors] = useState({});

  // Send Email OTP (Demo - Shows in Alert)
  const sendEmailOtp = () => {
    if (!formData.email) {
      toast.error('Please enter email address');
      return;
    }
    
    const demoOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(demoOtp);
    setEmailOtpSent(true);
    
    // Show OTP in alert popup
    alert(`📧 Your Email Verification OTP is: ${demoOtp}\n\nUse this OTP to verify your email address.`);
    toast.success(`OTP sent to ${formData.email}`);
  };

  // Verify Email OTP
  const verifyEmailOtp = () => {
    if (!emailOtp) {
      toast.error('Please enter OTP');
      return;
    }
    
    if (emailOtp === generatedOtp) {
      setEmailVerified(true);
      toast.success('Email verified successfully!');
    } else {
      toast.error('Invalid OTP. Please try again.');
    }
  };

  // Resend OTP
  const resendEmailOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    alert(`📧 Your new Email OTP is: ${newOtp}`);
    toast.success('New OTP sent!');
  };

  const addDeliveryLocation = () => {
    if (!currentDeliveryLocation.name || !currentDeliveryLocation.city) {
      toast.error('Please enter location name and city');
      return;
    }
    setFormData({
      ...formData,
      deliveryLocations: [...formData.deliveryLocations, { 
        name: currentDeliveryLocation.name,
        city: currentDeliveryLocation.city,
        area: currentDeliveryLocation.area,
        pincode: currentDeliveryLocation.pincode
      }]
    });
    setCurrentDeliveryLocation({ name: '', city: '', area: '', pincode: '' });
    toast.success('Delivery location added');
  };

  const removeDeliveryLocation = (index) => {
    const newLocations = [...formData.deliveryLocations];
    newLocations.splice(index, 1);
    setFormData({ ...formData, deliveryLocations: newLocations });
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name required';
    if (!formData.email) newErrors.email = 'Email required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone) newErrors.phone = 'Phone required';
    else if (!/^[6-9][0-9]{9}$/.test(formData.phone)) newErrors.phone = 'Invalid 10-digit number';
    if (!formData.dailyIncome) newErrors.dailyIncome = 'Daily income required';
    else if (formData.dailyIncome < 100) newErrors.dailyIncome = 'Minimum ₹100 per day';
    if (!formData.password) newErrors.password = 'Password required';
    else if (formData.password.length < 6) newErrors.password = 'Min 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.aadharNumber) newErrors.aadharNumber = 'Aadhar required';
    else if (!/^[2-9][0-9]{11}$/.test(formData.aadharNumber)) newErrors.aadharNumber = 'Invalid Aadhar';
    if (!formData.panNumber) newErrors.panNumber = 'PAN required';
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) newErrors.panNumber = 'Invalid PAN';
    if (!formData.gigWorkerId) newErrors.gigWorkerId = 'Gig Worker ID required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.accountHolderName) newErrors.accountHolderName = 'Account holder name required';
    if (!formData.bankName) newErrors.bankName = 'Bank name required';
    if (!formData.bankAccountNumber) newErrors.bankAccountNumber = 'Account number required';
    if (!formData.bankIfscCode) newErrors.bankIfscCode = 'IFSC code required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors = {};
    if (!formData.currentCity) newErrors.currentCity = 'Current city required';
    if (formData.deliveryLocations.length === 0) {
      newErrors.deliveryLocations = 'Add at least one delivery location';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!emailVerified) {
        toast.error('Please verify your email first');
        return;
      }
      setStep(2);
    } else if (step === 2 && validateStep1()) setStep(3);
    else if (step === 3 && validateStep2()) setStep(4);
    else if (step === 4 && validateStep3()) setStep(5);
    else if (step === 5 && validateStep4()) handleSubmit();
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!emailVerified) {
      toast.error('Please verify your email first');
      return;
    }
    
    setLoading(true);
    const { confirmPassword, ...userData } = formData;
    const result = await register({
      ...userData,
      dailyIncome: parseFloat(formData.dailyIncome),
      emailVerified: true,
      bankDetails: {
        accountNumber: formData.bankAccountNumber,
        ifscCode: formData.bankIfscCode,
        bankName: formData.bankName,
        accountHolderName: formData.accountHolderName,
        upiId: formData.upiId
      },
      currentLocation: {
        city: formData.currentCity,
        area: formData.currentArea,
        address: formData.currentAddress
      },
      deliveryLocations: formData.deliveryLocations
    });
    
    if (result.success) {
      toast.success('Registration successful! Please login.');
      setTimeout(() => navigate('/login'), 2000);
    }
    setLoading(false);
  };

  const steps = [
    { number: 1, title: 'Verify Email', icon: '📧' },
    { number: 2, title: 'Personal', icon: '👤' },
    { number: 3, title: 'KYC', icon: '🆔' },
    { number: 4, title: 'Bank', icon: '🏦' },
    { number: 5, title: 'Location', icon: '📍' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <button onClick={() => navigate('/landing')} className="fixed top-6 left-6 flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition z-50">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Home</span>
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((s) => (
              <div key={s.number} className="flex-1 text-center">
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                  step >= s.number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {s.icon}
                </div>
                <p className={`text-xs mt-2 ${step >= s.number ? 'text-blue-600' : 'text-gray-400'}`}>
                  {s.title}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(step / steps.length) * 100}%` }} />
          </div>
        </div>

        {/* Step 1: Email Verification */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Verify Your Email</h2>
            <p className="text-gray-600 text-center">We'll send a 6-digit OTP to your email</p>
            
            <div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Email Address"
                className="input-field"
                disabled={emailVerified}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            {!emailOtpSent ? (
              <button onClick={sendEmailOtp} className="btn-primary w-full">
                Send OTP
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="input-field text-center text-xl"
                />
                <div className="flex gap-3">
                  <button onClick={resendEmailOtp} className="btn-secondary flex-1">
                    Resend
                  </button>
                  <button onClick={verifyEmailOtp} className="btn-primary flex-1">
                    Verify OTP
                  </button>
                </div>
              </div>
            )}
            
            {emailVerified && (
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-green-600">✓ Email verified successfully!</p>
              </div>
            )}
            
            <button 
              onClick={handleNext} 
              disabled={!emailVerified} 
              className="w-full btn-primary mt-4 disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        )}

        {/* Step 2: Personal Info */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Personal Information</h2>
            <div><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Full Name" className={`input-field ${errors.name ? 'border-red-500' : ''}`} /><p className="text-red-500 text-xs">{errors.name}</p></div>
            <div><input type="email" value={formData.email} className="input-field bg-gray-100" disabled /><p className="text-green-600 text-xs">✓ Email verified</p></div>
            <div><input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="Phone Number (10 digits)" className={`input-field ${errors.phone ? 'border-red-500' : ''}`} /><p className="text-red-500 text-xs">{errors.phone}</p></div>
            <div><input type="number" value={formData.dailyIncome} onChange={(e) => setFormData({...formData, dailyIncome: e.target.value})} placeholder="Daily Income (₹) *" className={`input-field ${errors.dailyIncome ? 'border-red-500' : ''}`} /><p className="text-red-500 text-xs">{errors.dailyIncome}</p><p className="text-gray-400 text-xs">Your average daily earnings from deliveries</p></div>
            <div><input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Password (min 6 chars)" className={`input-field ${errors.password ? 'border-red-500' : ''}`} /><p className="text-red-500 text-xs">{errors.password}</p></div>
            <div><input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} placeholder="Confirm Password" className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`} /><p className="text-red-500 text-xs">{errors.confirmPassword}</p></div>
            <div className="flex space-x-3 mt-4">
              <button onClick={handleBack} className="btn-secondary flex-1">← Back</button>
              <button onClick={handleNext} className="btn-primary flex-1">Next →</button>
            </div>
          </div>
        )}

        {/* Step 3: KYC */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">KYC Verification</h2>
            <div><input type="text" value={formData.aadharNumber} onChange={(e) => setFormData({...formData, aadharNumber: e.target.value})} placeholder="Aadhar Number (12 digits)" maxLength={12} className={`input-field ${errors.aadharNumber ? 'border-red-500' : ''}`} /><p className="text-red-500 text-xs">{errors.aadharNumber}</p></div>
            <div><input type="text" value={formData.panNumber} onChange={(e) => setFormData({...formData, panNumber: e.target.value.toUpperCase()})} placeholder="PAN Number (ABCDE1234F)" maxLength={10} className={`input-field ${errors.panNumber ? 'border-red-500' : ''}`} /><p className="text-red-500 text-xs">{errors.panNumber}</p></div>
            <div><input type="text" value={formData.gigWorkerId} onChange={(e) => setFormData({...formData, gigWorkerId: e.target.value})} placeholder="Gig Worker ID" className={`input-field ${errors.gigWorkerId ? 'border-red-500' : ''}`} /><p className="text-red-500 text-xs">{errors.gigWorkerId}</p></div>
            <div className="flex space-x-3 mt-4"><button onClick={handleBack} className="btn-secondary flex-1">← Back</button><button onClick={handleNext} className="btn-primary flex-1">Next →</button></div>
          </div>
        )}

        {/* Step 4: Bank Details */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">🏦 Bank Details for Claims</h2>
            <div><input type="text" value={formData.accountHolderName} onChange={(e) => setFormData({...formData, accountHolderName: e.target.value})} placeholder="Account Holder Name" className={`input-field ${errors.accountHolderName ? 'border-red-500' : ''}`} /><p className="text-red-500 text-xs">{errors.accountHolderName}</p></div>
            <div><input type="text" value={formData.bankName} onChange={(e) => setFormData({...formData, bankName: e.target.value})} placeholder="Bank Name" className={`input-field ${errors.bankName ? 'border-red-500' : ''}`} /><p className="text-red-500 text-xs">{errors.bankName}</p></div>
            <div><input type="text" value={formData.bankAccountNumber} onChange={(e) => setFormData({...formData, bankAccountNumber: e.target.value})} placeholder="Account Number" className={`input-field ${errors.bankAccountNumber ? 'border-red-500' : ''}`} /><p className="text-red-500 text-xs">{errors.bankAccountNumber}</p></div>
            <div><input type="text" value={formData.bankIfscCode} onChange={(e) => setFormData({...formData, bankIfscCode: e.target.value.toUpperCase()})} placeholder="IFSC Code" className={`input-field ${errors.bankIfscCode ? 'border-red-500' : ''}`} /><p className="text-red-500 text-xs">{errors.bankIfscCode}</p></div>
            <div><input type="text" value={formData.upiId} onChange={(e) => setFormData({...formData, upiId: e.target.value})} placeholder="UPI ID (Optional)" className="input-field" /></div>
            <div className="flex space-x-3"><button onClick={handleBack} className="btn-secondary flex-1">← Back</button><button onClick={handleNext} className="btn-primary flex-1">Next →</button></div>
          </div>
        )}

        {/* Step 5: Locations */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">📍 Your Locations</h2>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">📍 Your Current Location</h3>
              <input type="text" value={formData.currentCity} onChange={(e) => setFormData({...formData, currentCity: e.target.value})} placeholder="City" className="input-field mb-2" />
              <input type="text" value={formData.currentArea} onChange={(e) => setFormData({...formData, currentArea: e.target.value})} placeholder="Area / Locality" className="input-field mb-2" />
              <input type="text" value={formData.currentAddress} onChange={(e) => setFormData({...formData, currentAddress: e.target.value})} placeholder="Full Address" className="input-field" />
              {errors.currentCity && <p className="text-red-500 text-xs">{errors.currentCity}</p>}
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">🚚 Your Delivery Locations</h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <input type="text" value={currentDeliveryLocation.name} onChange={(e) => setCurrentDeliveryLocation({...currentDeliveryLocation, name: e.target.value})} placeholder="Location Name" className="input-field text-sm" />
                <input type="text" value={currentDeliveryLocation.city} onChange={(e) => setCurrentDeliveryLocation({...currentDeliveryLocation, city: e.target.value})} placeholder="City" className="input-field text-sm" />
                <input type="text" value={currentDeliveryLocation.area} onChange={(e) => setCurrentDeliveryLocation({...currentDeliveryLocation, area: e.target.value})} placeholder="Area" className="input-field text-sm" />
                <input type="text" value={currentDeliveryLocation.pincode} onChange={(e) => setCurrentDeliveryLocation({...currentDeliveryLocation, pincode: e.target.value})} placeholder="Pincode" className="input-field text-sm" />
              </div>
              <button onClick={addDeliveryLocation} className="btn-secondary w-full text-sm">+ Add Delivery Location</button>
              {formData.deliveryLocations.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.deliveryLocations.map((loc, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <div><p className="font-medium text-sm">{loc.name}</p><p className="text-xs text-gray-500">{loc.city}, {loc.area}</p></div>
                      <button onClick={() => removeDeliveryLocation(idx)} className="text-red-500 text-sm">Remove</button>
                    </div>
                  ))}
                </div>
              )}
              {errors.deliveryLocations && <p className="text-red-500 text-xs mt-2">{errors.deliveryLocations}</p>}
            </div>
            <div className="flex space-x-3 mt-4">
              <button onClick={handleBack} className="btn-secondary flex-1">← Back</button>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Register;