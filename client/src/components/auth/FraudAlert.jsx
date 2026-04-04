import React from 'react';
import { motion } from 'framer-motion';

const FraudAlert = ({ alert, onClose }) => {
  const getRiskColor = (score) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskLevel = (score) => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`p-6 ${
          alert.fraudScore >= 70 ? 'bg-red-50' : 
          alert.fraudScore >= 40 ? 'bg-yellow-50' : 
          'bg-green-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-4xl">⚠️</span>
              <div>
                <h3 className="text-lg font-bold">Fraud Detection Alert</h3>
                <p className="text-sm text-gray-600">Our AI has detected suspicious activity</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">{alert.message}</p>
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Fraud Risk Score</span>
                <span className={getRiskColor(alert.fraudScore)}>
                  {alert.fraudScore}% - {getRiskLevel(alert.fraudScore)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    alert.fraudScore >= 70 ? 'bg-red-600' :
                    alert.fraudScore >= 40 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${alert.fraudScore}%` }}
                />
              </div>
            </div>
          </div>

          {alert.riskFactors && alert.riskFactors.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-2">Risk Factors:</h4>
              <ul className="space-y-2">
                {alert.riskFactors.map((factor, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start space-x-2">
                    <span className="text-red-500">•</span>
                    <span>{factor.factor?.replace(/_/g, ' ').toUpperCase()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              🔒 To protect your account, we've added additional verification steps.
              This helps ensure that only you can access your account.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Continue with Verification
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FraudAlert;