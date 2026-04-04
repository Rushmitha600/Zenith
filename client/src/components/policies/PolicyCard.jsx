import React from 'react';
import { motion } from 'framer-motion';
import { formatters } from '../../utils/formatters';

const PolicyCard = ({ policy, expired, onUpdatePremium }) => {
  const planColors = {
    basic: 'from-blue-500 to-blue-600',
    standard: 'from-purple-500 to-purple-600',
    premium: 'from-orange-500 to-orange-600'
  };

  const getPlanIcon = (planType) => {
    const icons = {
      basic: '🛡️',
      standard: '⭐',
      premium: '👑'
    };
    return icons[planType] || '📋';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      <div className={`bg-gradient-to-r ${planColors[policy.planType]} p-4 text-white`}>
        <div className="flex justify-between items-start">
          <div>
            <div className="text-3xl mb-1">{getPlanIcon(policy.planType)}</div>
            <h3 className="font-bold text-lg capitalize">{policy.planType} Shield</h3>
            <p className="text-xs opacity-90">Policy #{policy.policyNumber?.slice(-8)}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            !expired && policy.status === 'active' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-500 text-white'
          }`}>
            {expired ? 'Expired' : policy.status}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-xs text-gray-500">Weekly Premium</p>
            <p className="text-2xl font-bold text-gray-900">₹{policy.totalPremium}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Coverage</p>
            <p className="font-semibold text-gray-900">₹{policy.coverageAmount.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-3 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Started</span>
            <span className="text-gray-900">{formatters.date(policy.startDate)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Expires</span>
            <span className="text-gray-900">{formatters.date(policy.endDate)}</span>
          </div>
          {policy.location && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Location</span>
              <span className="text-gray-900">{policy.location.zone || policy.location.city}</span>
            </div>
          )}
        </div>
        
        {!expired && policy.status === 'active' && (
          <button
            onClick={onUpdatePremium}
            className="w-full mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            🔄 Update Premium
          </button>
        )}
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Risk Score: {Math.round(policy.riskScore * 100)}%</span>
            <span>Auto-Renew: Enabled</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PolicyCard;