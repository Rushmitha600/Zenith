import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_URL } from '../../config/api';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const [captcha, setCaptcha] = useState(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(false);

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
        (error.code === 'ERR_NETWORK' ? 'Cannot reach server.' : null) ||
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
  
  setLoading(true);
  
  try {
    const response = await axios.post(`${API_URL}/auth/admin/login`, {
      email,
      password
    });
    
    if (response.data.success) {
      // Clear old data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Set new data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      console.log('Admin login successful, redirecting...');
      toast.success('Admin login successful!');
      
      // Force navigation to admin dashboard
      window.location.href = '/admin/dashboard';
      // OR use navigate
      // navigate('/admin-dashboard');
    }
  } catch (error) {
    console.error('Login error:', error);
    toast.error(error.response?.data?.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center py-12 px-4">
      <button
        type="button"
        onClick={() => navigate('/landing')}
        className="fixed top-6 left-6 flex items-center space-x-2 text-slate-300 hover:text-white transition z-50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Home</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900/80 border border-slate-700 rounded-2xl shadow-2xl p-8 backdrop-blur"
      >
        <div className="text-center mb-8">
          <p className="text-indigo-400 text-sm font-semibold tracking-wide uppercase mb-2">Zenith➕</p>
          <h2 className="text-3xl font-bold text-white">Admin sign in</h2>
          <p className="text-slate-400 mt-2">Verify and approve worker claims</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field bg-slate-800 border-slate-600 text-white placeholder-slate-500"
                placeholder="admin@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field bg-slate-800 border-slate-600 text-white placeholder-slate-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {captcha && (
            <div className="mt-4 p-4 bg-slate-800/80 rounded-lg border border-slate-600">
              <p className="text-sm font-medium mb-2 text-slate-200 flex items-center justify-between">
                <span>Verify you are human</span>
                <button
                  type="button"
                  onClick={loadCaptcha}
                  className="text-indigo-400 hover:text-indigo-300 text-sm"
                >
                  Refresh
                </button>
              </p>
              <div className="bg-slate-700/50 p-4 rounded-lg text-center mb-3">
                <p className="text-2xl font-bold tracking-wide text-white">{captcha.captchaText}</p>
                <p className="text-xs text-slate-400 mt-1">Word then number, no spaces</p>
              </div>
              <input
                type="text"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value.toUpperCase())}
                placeholder="e.g. RAIN42"
                className="input-field bg-slate-800 border-slate-600 text-white text-center uppercase"
                autoComplete="off"
              />
            </div>
          )}

          <button type="submit" disabled={loading || captchaLoading} className="w-full mt-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-50">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-6">
          Need an admin account?{' '}
          <Link to="/admin/register" className="text-indigo-400 hover:underline">
            Register
          </Link>
        </p>
        <p className="text-center text-slate-500 text-sm mt-3">
          <Link to="/login" className="hover:text-slate-300">
            Worker login →
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
