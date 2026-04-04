import React, { useState, useEffect } from 'react';
import { getMyClaims, submitClaim, getMyPolicies } from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ClaimsManagement = () => {
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    policyId: '',
    type: 'weather_disruption',
    description: '',
    amount: '',
    location: '',
    dateOfIncident: ''
  });

  // Claim types with details
  const claimTypes = [
    { 
      value: 'weather_disruption', 
      label: '🌧️ Weather Disruption', 
      description: 'Heavy rain, storm, flood, heat wave, etc.',
      minAmount: 200,
      maxAmount: 1000,
      icon: '🌧️'
    },
    { 
      value: 'curfew', 
      label: '🚫 Sudden Curfew', 
      description: 'Government imposed curfew affecting work',
      minAmount: 300,
      maxAmount: 800,
      icon: '🚫'
    },
    { 
      value: 'bundh', 
      label: '🚧 Sudden Bundh / Hartal', 
      description: 'Bandh / Hartal affecting deliveries',
      minAmount: 300,
      maxAmount: 800,
      icon: '🚧'
    }

  ];

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    try {
      const [claimsRes, policiesRes] = await Promise.all([
        getMyClaims(), 
        getMyPolicies()
      ]);
      setClaims(claimsRes.data || []);
      setPolicies((policiesRes.data || []).filter(p => p.status === 'active'));
    } catch (error) { 
      toast.error('Failed to fetch data'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!formData.policyId || !formData.amount || !formData.description) { 
      toast.error('Please fill all required fields'); 
      return; 
    }
    
    setLoading(true);
    try {
      await submitClaim({
        ...formData,
        amount: parseFloat(formData.amount),
        dateOfIncident: formData.dateOfIncident || new Date()
      });
      toast.success('Claim submitted successfully!');
      setShowForm(false);
      setFormData({ 
        policyId: '', type: 'weather_disruption', description: '', 
        amount: '', location: '', dateOfIncident: '' 
      });
      fetchData();
    } catch (error) { 
      toast.error(error.response?.data?.message || 'Failed to submit claim'); 
    } finally { 
      setLoading(false); 
    }
  };

  const getClaimIcon = (type) => {
    const icons = {
      weather_disruption: '🌧️',
      curfew: '🚫',
      bundh: '🚧'
    };
    return icons[type] || '📋';
  };

  const getClaimTypeLabel = (type) => {
    const labels = {
      weather_disruption: 'Weather Disruption',
      curfew: 'Sudden Curfew',
      bundh: 'Sudden Bundh/Hartal'
    };
    return labels[type] || type;
  };

  if (loading && claims.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Claims Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">File claims for weather disruptions, curfew, bundh, and more</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ File New Claim'}
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Claims</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{claims.length}</p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Approved Claims</p>
              <p className="text-3xl font-bold text-green-600">
                {claims.filter(c => c.status === 'approved').length}
              </p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">In review (pending / verified)</p>
              <p className="text-3xl font-bold text-yellow-600">
                {claims.filter(c => c.status === 'pending' || c.status === 'verified').length}
              </p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Compensation</p>
              <p className="text-3xl font-bold text-blue-600">
                ₹{claims.filter(c => c.status === 'approved').reduce((s, c) => s + c.amount, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
      </div>

      {/* Claim Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4 dark:text-white">File a Claim</h2>
          <form onSubmit={handleSubmitClaim}>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Policy Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Policy *</label>
                <select
                  value={formData.policyId}
                  onChange={(e) => setFormData({ ...formData, policyId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select a policy</option>
                  {policies.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.planType} Shield - ₹{p.coverageAmount.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Claim Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Claim Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                  required
                >
                  {claimTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label} (₹{type.minAmount} - ₹{type.maxAmount})
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Incident Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City / Area where incident occurred"
                  className="input-field"
                  required
                />
              </div>

              {/* Date of Incident */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Incident *</label>
                <input
                  type="date"
                  value={formData.dateOfIncident}
                  onChange={(e) => setFormData({ ...formData, dateOfIncident: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Claim Amount (₹) *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="input-field"
                  required
                />
                {formData.type && (
                  <p className="text-xs text-gray-500 mt-1">
                    Range: ₹{claimTypes.find(t => t.value === formData.type)?.minAmount} - ₹{claimTypes.find(t => t.value === formData.type)?.maxAmount}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Describe what happened (e.g., Heavy rain from 2 PM to 6 PM, couldn't do deliveries)"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Submitting...' : 'Submit Claim'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Quick Claim Tips */}
      <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4">
        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 What can you claim?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🌧️</span>
            <span className="text-gray-700 dark:text-gray-300">Weather Disruptions (Rain, Storm, Heat Wave)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">🚫</span>
            <span className="text-gray-700 dark:text-gray-300">Sudden Curfew</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">🚧</span>
            <span className="text-gray-700 dark:text-gray-300">Sudden Bundh / Hartal</span>
          </div>
        </div>
      </div>

      {/* Claims List */}
      {claims.length > 0 ? (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-2xl">
                    {getClaimIcon(claim.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg dark:text-white">
                      {getClaimTypeLabel(claim.type)}
                    </h3>
                    <p className="text-sm text-gray-500">Claim #{claim.claimNumber?.slice(-8)}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  claim.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  claim.status === 'verified' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {claim.status?.toUpperCase()}
                </span>
              </div>
              
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">₹{claim.amount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Submitted</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{new Date(claim.createdAt).toLocaleDateString()}</p>
                </div>
                {claim.location && (
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{claim.location}</p>
                  </div>
                )}
                <div className="md:col-span-1">
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{claim.description}</p>
                </div>
              </div>
              
              {claim.status === 'approved' && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <p className="text-green-800 dark:text-green-400 text-sm">✅ Claim approved! Amount will be credited within 24 hours.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">No claims yet</p>
          <p className="text-gray-400 dark:text-gray-500 mt-2">File a claim for weather disruptions, curfew, or bundh</p>
        </div>
      )}
    </div>
  );
};

export default ClaimsManagement;