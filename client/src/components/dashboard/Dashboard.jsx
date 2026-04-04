import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyClaims } from '../../services/api';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewingPolicyId, setRenewingPolicyId] = useState(null);
  const [payingPaymentId, setPayingPaymentId] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const claimsRes = await getMyClaims();
      setClaims(claimsRes.data || []);
      
      const paymentsRes = await axios.get('http://localhost:5000/api/auth/upcoming-payments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUpcomingPayments(paymentsRes.data || []);
      
      const policiesRes = await axios.get('http://localhost:5000/api/auth/my-policies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allPolicies = policiesRes.data || [];
      const activePolicies = allPolicies.filter(p => p.status === 'active');
      
      const policiesWithCounts = await Promise.all(activePolicies.map(async (policy) => {
        const paymentsRes = await axios.get(`http://localhost:5000/api/auth/policy-payments/${policy._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const payments = paymentsRes.data || [];
        const paidCount = payments.filter(p => p.status === 'paid').length;
        const pendingCount = payments.filter(p => p.status === 'pending').length;
        const totalPayments = payments.length;
        const isComplete = pendingCount === 0 && totalPayments > 0;
        
        return {
          ...policy,
          paymentsPaid: paidCount,
          paymentsPending: pendingCount,
          totalPayments: totalPayments,
          isComplete: isComplete
        };
      }));
      
      setPolicies(policiesWithCounts);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRenewPolicy = async (policyId) => {
    setRenewingPolicyId(policyId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/auth/renew-policy', 
        { policyId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Policy renewed successfully for 4 more weeks!');
        await fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to renew policy');
    } finally {
      setRenewingPolicyId(null);
    }
  };

  const handlePayPayment = async (paymentId) => {
    setPayingPaymentId(paymentId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/auth/pay/${paymentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success('Payment successful!');
        await fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setPayingPaymentId(null);
    }
  };

  const stats = {
    activePolicies: policies.length,
    totalClaims: claims.length,
    approvedClaims: claims.filter(c => c.status === 'approved').length,
    totalProtected: policies.reduce((sum, p) => sum + (p.coverageAmount || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Daily Income: <span className="font-semibold text-blue-600">₹{user?.dailyIncome}/day</span>
            </p>
          </div>
          <div className="mt-3 md:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              🟢 {stats.activePolicies} Active Policy{stats.activePolicies !== 1 ? 'ies' : ''}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <p className="text-xs text-gray-500">Active Policies</p>
          <p className="text-2xl font-bold">{stats.activePolicies}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <p className="text-xs text-gray-500">Total Claims</p>
          <p className="text-2xl font-bold">{stats.totalClaims}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <p className="text-xs text-gray-500">Approved Claims</p>
          <p className="text-2xl font-bold text-green-600">{stats.approvedClaims}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <p className="text-xs text-gray-500">Total Protected</p>
          <p className="text-2xl font-bold text-orange-600">₹{stats.totalProtected.toLocaleString()}</p>
        </div>
      </div>

      {/* 1. UPCOMING PAYMENTS */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <span>💰</span> Upcoming Payments
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {upcomingPayments.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {upcomingPayments.map((payment) => (
                <div key={payment._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Week {payment.weekNumber} - {payment.policyId?.planType} Shield
                      </p>
                      <p className="text-sm text-gray-500">
                        Due: {new Date(payment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <p className="font-bold text-xl text-blue-600">₹{payment.amount}</p>
                      <button
                        onClick={() => handlePayPayment(payment._id)}
                        disabled={payingPaymentId === payment._id}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                      >
                        {payingPaymentId === payment._id ? 'Processing...' : 'Pay Now'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">✅</div>
              <p className="text-gray-500">No pending payments</p>
              <p className="text-sm text-gray-400">All caught up! 🎉</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. ACTIVE POLICIES */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <span>🛡️</span> Active Policies
        </h2>
        {policies.length > 0 ? (
          <div className="space-y-4">
            {policies.map((policy) => {
              const paidCount = policy.paymentsPaid || 0;
              const totalPayments = policy.totalPayments || 4;
              const isComplete = policy.isComplete;
              const progressPercent = (paidCount / totalPayments) * 100;
              
              return (
                <div key={policy._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                  <div className={`p-4 text-white ${
                    policy.planType === 'basic' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                    policy.planType === 'standard' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                    'bg-gradient-to-r from-orange-500 to-orange-600'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{policy.planType === 'basic' ? '🛡️' : policy.planType === 'standard' ? '⭐' : '👑'}</span>
                        <div>
                          <h3 className="font-bold text-lg capitalize">{policy.planType} Shield</h3>
                          <p className="text-xs opacity-90">Policy #{policy.policyNumber?.slice(-8)}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-500 rounded-full text-xs font-semibold">Active</span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Weekly Premium</p>
                        <p className="text-2xl font-bold">₹{policy.totalPremium}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Coverage</p>
                        <p className="font-semibold">₹{policy.coverageAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Payment Progress</span>
                        <span>{paidCount}/{totalPayments} weeks paid</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm pt-3 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500">Started</span>
                      <span>{new Date(policy.startDate).toLocaleDateString()}</span>
                    </div>
                    
                    {isComplete && (
                      <button
                        onClick={() => handleRenewPolicy(policy._id)}
                        disabled={renewingPolicyId === policy._id}
                        className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg transition flex items-center justify-center gap-2 font-medium"
                      >
                        <span>🔄</span> {renewingPolicyId === policy._id ? 'Renewing...' : 'Renew Policy'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">🛡️</div>
            <p className="text-gray-500 text-lg">No active policies</p>
            <Link to="/policies" className="inline-block mt-4 btn-primary">Buy Your First Policy</Link>
          </div>
        )}
      </div>

      {/* 3. RECENT CLAIMS */}
      {claims.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <span>📋</span> Recent Claims
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {claims.slice(0, 3).map((claim) => (
                <div key={claim._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">
                        {claim.type === 'weather_disruption' && '🌧️'}
                        {claim.type === 'accident' && '🚗'}
                        {claim.type === 'curfew' && '🚫'}
                        {claim.type === 'bundh' && '🚧'}
                        {!claim.type && '📋'}
                      </div>
                      <div>
                        <p className="font-medium capitalize text-gray-900 dark:text-white">
                          {claim.type?.replace('_', ' ') || 'Manual Claim'}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(claim.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">₹{claim.amount}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        claim.status === 'approved' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {claim.status === 'approved' ? '✓ Approved' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 text-center">
              <Link to="/claims" className="text-sm text-blue-600 hover:underline">View All Claims →</Link>
            </div>
          </div>
        </div>
      )}

      {/* 4. QUICK ACTIONS */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <span>⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            to="/policies" 
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white text-center hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-3xl mb-2">🛡️</div>
            <p className="font-semibold">Buy New Policy</p>
            <p className="text-xs opacity-90">Get protected today</p>
          </Link>
          
          <Link 
            to="/claims" 
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white text-center hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-3xl mb-2">📋</div>
            <p className="font-semibold">File a Claim</p>
            <p className="text-xs opacity-90">Quick and easy</p>
          </Link>
          
          <Link 
            to="/track" 
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white text-center hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-3xl mb-2">📍</div>
            <p className="font-semibold">Live Tracking</p>
            <p className="text-xs opacity-90">Real-time weather</p>
          </Link>
          
          <Link 
            to="/payment-history" 
            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white text-center hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-3xl mb-2">📜</div>
            <p className="font-semibold">Payment History</p>
            <p className="text-xs opacity-90">View all payments</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;