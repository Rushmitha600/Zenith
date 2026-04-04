import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyClaims } from '../../services/api';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PaymentCalendar from './PaymentCalendar';

const Dashboard = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewingPolicyId, setRenewingPolicyId] = useState(null);

  const fetchPoliciesWithStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get all active policies
      const policiesRes = await axios.get('http://localhost:5000/api/auth/my-policies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allPolicies = policiesRes.data || [];
      const activePolicies = allPolicies.filter(p => p.status === 'active');
      
      // Get payment status for each policy
      const policiesWithStatus = await Promise.all(activePolicies.map(async (policy) => {
        const paymentsRes = await axios.get(`http://localhost:5000/api/auth/policy-payments/${policy._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const payments = paymentsRes.data || [];
        const pendingPayments = payments.filter(p => p.status === 'pending');
        const paidPayments = payments.filter(p => p.status === 'paid');
        
        // A policy is complete (all 4 weeks paid) when there are 4 paid payments and no pending
        const isComplete = paidPayments.length === 4 && pendingPayments.length === 0;
        
        return {
          ...policy,
          paymentsPending: pendingPayments.length,
          paymentsPaid: paidPayments.length,
          totalPayments: payments.length,
          isComplete: isComplete
        };
      }));
      
      setPolicies(policiesWithStatus);
      
    } catch (error) {
      console.error('Error fetching policies:', error);
    }
  };

  const fetchClaimsData = async () => {
    try {
      const claimsRes = await getMyClaims();
      setClaims(claimsRes.data || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPoliciesWithStatus(),
        fetchClaimsData()
      ]);
      setLoading(false);
    };
    fetchAllData();
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
        await fetchPoliciesWithStatus();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to renew policy');
    } finally {
      setRenewingPolicyId(null);
    }
  };

  const stats = {
    activePolicies: policies.filter(p => !p.isComplete).length,
    completedPolicies: policies.filter(p => p.isComplete).length,
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

  // Separate policies into active (needs payment) and completed (all paid)
  const activePoliciesList = policies.filter(p => !p.isComplete);
  const completedPoliciesList = policies.filter(p => p.isComplete);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Welcome Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Daily Income: ₹{user?.dailyIncome}/day
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
          <div><p className="text-gray-500 text-sm">Active Policies</p><p className="text-3xl font-bold">{stats.activePolicies}</p></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
          <div><p className="text-gray-500 text-sm">Completed Policies</p><p className="text-3xl font-bold text-green-600">{stats.completedPolicies}</p></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
          <div><p className="text-gray-500 text-sm">Total Claims</p><p className="text-3xl font-bold">{stats.totalClaims}</p></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
          <div><p className="text-gray-500 text-sm">Total Protected</p><p className="text-3xl font-bold text-orange-600">₹{stats.totalProtected.toLocaleString()}</p></div>
        </div>
      </div>

      {/* Active Policies (Need Payment / Renewal) */}
      {activePoliciesList.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 dark:text-white">📋 Active Policies</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {activePoliciesList.map((policy) => {
              const paidCount = policy.paymentsPaid || 0;
              const remainingWeeks = 4 - paidCount;
              
              return (
                <div key={policy._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                  <div className={`p-4 text-white ${
                    policy.planType === 'basic' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                    policy.planType === 'standard' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                    'bg-gradient-to-r from-orange-500 to-orange-600'
                  }`}>
                    <div className="flex justify-between">
                      <div>
                        <div className="text-3xl">{policy.planType === 'basic' ? '🛡️' : policy.planType === 'standard' ? '⭐' : '👑'}</div>
                        <h3 className="font-bold text-lg capitalize">{policy.planType} Shield</h3>
                        <p className="text-xs opacity-90">Policy #{policy.policyNumber?.slice(-8)}</p>
                      </div>
                      <span className="px-2 py-1 bg-yellow-500 rounded-full text-xs font-semibold">
                        {remainingWeeks} payments left
                      </span>
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
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Started</span>
                        <span>{new Date(policy.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="text-blue-600">{paidCount}/4 payments done</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Policies (Show Renew Button) */}
      {completedPoliciesList.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 dark:text-white">✅ Completed Policies</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {completedPoliciesList.map((policy) => (
              <div key={policy._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className={`p-4 text-white ${
                  policy.planType === 'basic' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                  policy.planType === 'standard' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                  'bg-gradient-to-r from-orange-500 to-orange-600'
                }`}>
                  <div className="flex justify-between">
                    <div>
                      <div className="text-3xl">{policy.planType === 'basic' ? '🛡️' : policy.planType === 'standard' ? '⭐' : '👑'}</div>
                      <h3 className="font-bold text-lg capitalize">{policy.planType} Shield</h3>
                      <p className="text-xs opacity-90">Policy #{policy.policyNumber?.slice(-8)}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-500 rounded-full text-xs font-semibold">
                      Completed
                    </span>
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
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Completed on</span>
                      <span>{new Date(policy.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">Status</span>
                      <span className="text-green-600">✓ All 4 payments done</span>
                    </div>
                  </div>
                  
                  {/* Renew Button */}
                  <button
                    onClick={() => handleRenewPolicy(policy._id)}
                    disabled={renewingPolicyId === policy._id}
                    className="w-full mt-4 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition flex items-center justify-center gap-2"
                  >
                    <span>🔄</span> {renewingPolicyId === policy._id ? 'Renewing...' : 'Renew Policy for 4 More Weeks'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {policies.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg mb-8">
          <div className="text-6xl mb-4">🛡️</div>
          <p className="text-gray-500 text-lg">No policies yet</p>
          <Link to="/policies" className="inline-block mt-4 btn-primary">Buy Your First Policy</Link>
        </div>
      )}

      {/* Payment Calendar */}
      <div className="mb-8">
        <PaymentCalendar />
      </div>

      {/* Recent Claims */}
      {claims.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold dark:text-white">Recent Claims</h3>
            <Link to="/claims" className="text-sm text-blue-600 hover:underline">View All →</Link>
          </div>
          <div className="space-y-3">
            {claims.slice(0, 3).map((claim) => (
              <div key={claim._id} className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium capitalize">{claim.type?.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-500">{new Date(claim.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{claim.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      claim.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>{claim.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/policies" className="bg-white/20 rounded-xl p-4 text-center hover:bg-white/30">🛡️ Buy New Policy</Link>
          <Link to="/claims" className="bg-white/20 rounded-xl p-4 text-center hover:bg-white/30">📋 File a Claim</Link>
          <Link to="/track" className="bg-white/20 rounded-xl p-4 text-center hover:bg-white/30">📍 Live Tracking</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;