import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../../config/api';
import { useTheme } from '../../contexts/ThemeContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [adminUser, setAdminUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check if admin is logged in - only once
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    console.log('AdminDashboard - Token:', !!token);
    console.log('AdminDashboard - User:', user);
    
    if (!token || user.role !== 'admin') {
      console.log('Not authorized, redirecting to admin login');
      toast.error('Please login as admin');
      navigate('/admin/login');
      return;
    }
    
    setAdminUser(user);
    setAuthChecked(true);
    fetchData();
  }, []); // Empty dependency array - runs only once

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const statsRes = await axios.get(`${API_URL}/admin/stats`, { headers });
      setStats(statsRes.data);
      
      const usersRes = await axios.get(`${API_URL}/admin/users`, { headers });
      setUsers(usersRes.data);
      
      const claimsRes = await axios.get(`${API_URL}/admin/claims`, { headers });
      setClaims(claimsRes.data);
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      if (error.response?.status === 403) {
        toast.error('Admin access required');
        navigate('/admin/login');
      } else {
        toast.error('Failed to load admin data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClaim = async (claimId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/admin/claims/${claimId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Claim approved!');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve claim');
    }
  };

  const handleRejectClaim = async (claimId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/admin/claims/${claimId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Claim rejected!');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject claim');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    toast.success('Logged out successfully');
    window.location.href = '/admin/login';
    // navigate('/admin/login');
  };

  if (loading || !authChecked) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Admin Navbar */}
      <nav className={`sticky top-0 z-50 shadow-md transition-colors duration-300 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                Zenith Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition ${
                  darkMode 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                👤 {adminUser?.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {adminUser?.name || 'Admin'}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border-l-4 border-blue-500">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border-l-4 border-green-500">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Workers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalWorkers || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border-l-4 border-purple-500">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Claims</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalClaims || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border-l-4 border-orange-500">
            <p className="text-xs text-gray-500 dark:text-gray-400">Pending Claims</p>
            <p className="text-2xl font-bold text-orange-600">{stats.pendingClaims || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b dark:border-gray-700">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 font-medium transition ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>📊 Overview</button>
          <button onClick={() => setActiveTab('users')} className={`px-4 py-2 font-medium transition ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>👥 Users ({users.length})</button>
          <button onClick={() => setActiveTab('claims')} className={`px-4 py-2 font-medium transition ${activeTab === 'claims' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>📋 Claims ({stats.pendingClaims || 0} pending)</button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"><h3 className="font-semibold mb-2 dark:text-white">Pending Claims</h3><p className="text-3xl font-bold text-yellow-600">{stats.pendingClaims || 0}</p><p className="text-sm text-gray-500 mt-1">Need your approval</p></div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"><h3 className="font-semibold mb-2 dark:text-white">Approved Claims</h3><p className="text-3xl font-bold text-green-600">{stats.approvedClaims || 0}</p><p className="text-sm text-gray-500 mt-1">Successfully processed</p></div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"><h3 className="font-semibold mb-2 dark:text-white">Total Payout</h3><p className="text-3xl font-bold text-blue-600">₹{(stats.totalClaimAmount || 0).toLocaleString()}</p><p className="text-sm text-gray-500 mt-1">Total compensation</p></div>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white"><h3 className="text-xl font-bold mb-3">Quick Actions</h3><div className="flex gap-4"><button onClick={() => setActiveTab('claims')} className="bg-white/20 rounded-lg px-4 py-2 hover:bg-white/30">Review Pending Claims</button><button onClick={() => setActiveTab('users')} className="bg-white/20 rounded-lg px-4 py-2 hover:bg-white/30">Manage Users</button></div></div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th></tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((userItem) => (<tr key={userItem._id} className="hover:bg-gray-50"><td className="px-6 py-4 text-sm font-medium dark:text-white">{userItem.name}</td><td className="px-6 py-4 text-sm dark:text-gray-300">{userItem.email}</td><td className="px-6 py-4 text-sm dark:text-gray-300">{userItem.phone}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${userItem.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{userItem.role || 'worker'}</span></td><td className="px-6 py-4 text-sm dark:text-gray-300">{new Date(userItem.createdAt).toLocaleDateString()}</td></tr>))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Claims Tab */}
        {activeTab === 'claims' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claim ID</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {claims.map((claim) => (<tr key={claim._id} className="hover:bg-gray-50"><td className="px-6 py-4 text-sm font-mono dark:text-gray-300">{claim.claimNumber?.slice(-8)}</td><td className="px-6 py-4 text-sm dark:text-gray-300">{claim.userId?.name || 'Unknown'}</td><td className="px-6 py-4 text-sm capitalize dark:text-gray-300">{claim.type?.replace('_', ' ')}</td><td className="px-6 py-4 text-sm font-semibold dark:text-white">₹{claim.amount}</td><td className="px-6 py-4 text-sm dark:text-gray-300">{new Date(claim.createdAt).toLocaleDateString()}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${claim.status === 'approved' ? 'bg-green-100 text-green-800' : claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{claim.status}</span></td><td className="px-6 py-4">{claim.status === 'pending' && (<div className="flex gap-2"><button onClick={() => handleApproveClaim(claim._id)} className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600">Approve</button><button onClick={() => handleRejectClaim(claim._id)} className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">Reject</button></div>)}</td></tr>))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;