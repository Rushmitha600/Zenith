import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_URL } from '../../config/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [otpPreviewUrl, setOtpPreviewUrl] = useState('');
  const { login, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  
  // Captcha states
  const [captcha, setCaptcha] = useState(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(false);
  
  // Load captcha on component mount
  useEffect(() => {
    loadCaptcha();
  }, []);
  
  const loadCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const response = await axios.get(`${API_URL}/auth/captcha`);
      setCaptcha(response.data);
      setCaptchaAnswer('');
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (error.code === 'ERR_NETWORK' ? 'Cannot reach server. Check API URL / internet.' : null) ||
        'Could not load captcha.';
      toast.error(msg);
      console.error('Captcha error:', error);
    } finally {
      setCaptchaLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (!captchaAnswer) {
      toast.error('Please solve the captcha');
      return;
    }
    
    if (!captcha?.captchaId) {
      toast.error('Captcha not loaded. Please wait or refresh.');
      loadCaptcha();
      return;
    }

    setLoading(true);
    const result = await login(email, password, captcha.captchaId, captchaAnswer);
    
    if (result.success) {
      toast.success('Login successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1000);
    } else {
      toast.error(result.error || 'Login failed');
      loadCaptcha(); // Refresh captcha on failure
    }
    setLoading(false);
  };

  const closeForgotModal = () => {
    setShowForgotPassword(false);
    setForgotStep(1);
    setForgotEmail('');
    setResetOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setOtpPreviewUrl('');
  };

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error('Enter your email');
      return;
    }
    setForgotLoading(true);
    const result = await forgotPassword(forgotEmail.trim());
    setForgotLoading(false);
    if (result.success) {
      if (result.previewUrl) setOtpPreviewUrl(result.previewUrl);
      setForgotStep(2);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!resetOtp.trim()) {
      toast.error('Enter the code from your email');
      return;
    }
    setForgotLoading(true);
    const result = await resetPassword({
      email: forgotEmail.trim(),
      otp: resetOtp.trim(),
      newPassword
    });
    setForgotLoading(false);
    if (result.success) {
      closeForgotModal();
      loadCaptcha();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <button onClick={() => navigate('/landing')} className="fixed top-6 left-6 flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition z-50">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Home</span>
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your Zenith➕ account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com" 
                className="input-field" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password" 
                className="input-field" 
                required 
              />
            </div>
          </div>

          {/* Word + Number Captcha Section */}
          {captcha && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-2 flex items-center justify-between">
                <span>🔒 Verify you are human:</span>
                <button 
                  type="button" 
                  onClick={loadCaptcha} 
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  🔄 Refresh
                </button>
              </p>
              
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-lg text-center mb-3">
                <p className="text-2xl font-bold tracking-wide text-gray-800">
                  {captcha.captchaText}
                </p>
                <p className="text-xs text-gray-500 mt-1">Enter the word followed by the number (no spaces)</p>
              </div>
              
              <div className="flex gap-3">
                <input
                  type="text"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value.toUpperCase())}
                  placeholder="e.g., RAIN42"
                  className="input-field flex-1 text-center uppercase"
                  autoComplete="off"
                />
              </div>
              
              <p className="text-xs text-gray-400 mt-2">
                Example: If you see "RAIN - 42", enter <strong className="text-blue-600">RAIN42</strong>
              </p>
            </div>
          )}

          <div className="flex justify-end mt-2">
            <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm text-blue-600 hover:text-blue-700">
              Forgot Password?
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full btn-primary mt-6 py-3"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>

        {/* Captcha Example */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 Example Captcha: <strong>RAIN - 42</strong> → Type: <strong>RAIN42</strong>
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeForgotModal}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="forgot-title"
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(ev) => ev.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 id="forgot-title" className="text-xl font-bold text-gray-900">
                  Reset password
                </h3>
                <button
                  type="button"
                  onClick={closeForgotModal}
                  className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {forgotStep === 1 && (
                <form onSubmit={handleSendResetCode} className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Enter the email for your account. We will send a 6-digit code to reset your password.
                  </p>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field w-full"
                    required
                  />
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full btn-primary py-3"
                  >
                    {forgotLoading ? 'Sending…' : 'Send code'}
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Code sent to <strong>{forgotEmail}</strong>. Enter the code and your new password.
                  </p>
                  {otpPreviewUrl && (
                    <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded">
                      Dev email: open{' '}
                      <a href={otpPreviewUrl} target="_blank" rel="noreferrer" className="underline">
                        preview link
                      </a>{' '}
                      to read the OTP (test SMTP).
                    </p>
                  )}
                  <input
                    type="text"
                    inputMode="numeric"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    placeholder="6-digit code"
                    className="input-field w-full"
                    required
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 characters)"
                    className="input-field w-full"
                    required
                    minLength={6}
                  />
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="input-field w-full"
                    required
                  />
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full btn-primary py-3"
                  >
                    {forgotLoading ? 'Updating…' : 'Update password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="w-full text-sm text-blue-600 hover:underline"
                  >
                    ← Use a different email
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;