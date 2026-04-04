import React from 'react';
import { motion } from 'framer-motion';
import { formatters } from '../../utils/formatters';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Active Policies',
      value: stats.activePolicies,
      icon: '🛡️',
      color: 'from-blue-500 to-blue-600',
      change: stats.policyChange
    },
    {
      title: 'Total Claims',
      value: stats.totalClaims,
      icon: '📋',
      color: 'from-purple-500 to-purple-600',
      change: stats.claimsChange
    },
    {
      title: 'Approved Claims',
      value: stats.approvedClaims,
      icon: '✅',
      color: 'from-green-500 to-green-600',
      change: stats.approvedChange
    },
    {
      title: 'Total Protected',
      value: formatters.currency(stats.totalProtected),
      icon: '💰',
      color: 'from-orange-500 to-orange-600',
      change: stats.protectedChange
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className={`bg-gradient-to-r ${card.color} p-4`}>
            <div className="flex justify-between items-center">
              <span className="text-3xl">{card.icon}</span>
              <span className="text-white/80 text-sm">{card.change || '0%'}</span>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-500">{card.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;