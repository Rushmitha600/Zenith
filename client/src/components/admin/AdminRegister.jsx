import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

const AdminRegister = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  // Send OTP
  const sendOtp = () => {
    if (!formData.email) {
      toast.error('Please enter email address');
      return;
    }
    const demoOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(demoOtp);
    setOtpSent(true);
    alert(`📧 Your Admin Registration OTP is: ${demoOtp}`);
    toast.success('OTP sent to email');
  };

  // Verify OTP
  const verifyOtp = () => {
    if (!otp) {
      toast.error('Please enter OTP');
      return;
    }
    if (otp === generatedOtp) {
      setOtpVerified(true);
      toast.success('OTP verified successfully!');
    } else {
      toast.error('Invalid OTP');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name required';
    if (!formData.email) newErrors.email = 'Email required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone) newErrors.phone = 'Phone required';
    else if (!/^[6-9][0-9]{9}$/.test(formData.phone)) newErrors.phone = 'Invalid phone';
    if (!formData.password) newErrors.password = 'Password required';
    else if (formData.password.length < 6) newErrors.password = 'Min 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!termsAccepted) newErrors.terms = 'Please accept terms';
    if (!otpVerified) newErrors.otp = 'Please verify OTP first';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/admin/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      
      if (response.data.success) {
        toast.success('Admin registration successful! Please login.');
        setTimeout(() => navigate('/admin/login'), 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <button onClick={() => navigate('/')} className="fixed top-6 left-6 flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition z-50">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Home</span>
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Admin Registration</h2>
          <p className="text-gray-600 mt-2">Create admin account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Full Name" className={`input-field ${errors.name ? 'border-red-500' : ''}`} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <div className="flex gap-2">
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Email Address" className={`input-field flex-1 ${errors.email ? 'border-red-500' : ''}`} disabled={otpVerified} />
                {!otpVerified && !otpSent && (
                  <button type="button" onClick={sendOtp} className="btn-secondary px-4">Send OTP</button>
                )}
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {otpSent && !otpVerified && (
              <div className="flex gap-2">
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" maxLength={6} className="input-field flex-1 text-center" />
                <button type="button" onClick={verifyOtp} className="btn-primary px-4">Verify</button>
              </div>
            )}
            {otpVerified && <p className="text-green-600 text-sm">✓ OTP verified</p>}
            {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}

            <div>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="Phone Number" className={`input-field ${errors.phone ? 'border-red-500' : ''}`} />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Password" className={`input-field ${errors.password ? 'border-red-500' : ''}`} />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} placeholder="Confirm Password" className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`} />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="w-4 h-4" />
              <label htmlFor="terms" className="text-sm text-gray-600">I agree to the terms and conditions</label>
            </div>
            {errors.terms && <p className="text-red-500 text-xs">{errors.terms}</p>}
          </div>

          <button type="submit" disabled={loading || !otpVerified} className="w-full btn-primary mt-6 py-3">
            {loading ? 'Registering...' : 'Register as Admin'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an admin account?{' '}
          <Link to="/admin/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminRegister;