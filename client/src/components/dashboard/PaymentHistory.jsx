import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/auth/payment-history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPayments(response.data.slice(0, 3)); // Show only last 3 payments
      } catch (error) {
        console.error('Error fetching payment history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentHistory();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex justify-center items-center h-40">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center dark:text-white">
          <span className="mr-2">📜</span> Recent Payments
        </h3>
        <Link to="/payment-history" className="text-sm text-blue-600 hover:underline">
          View All →
        </Link>
      </div>
      
      {payments.length > 0 ? (
        <div className="space-y-3">
          {payments.map((payment) => (
            <motion.div
              key={payment._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3"
            >
              <div>
                <p className="font-semibold dark:text-white">Week {payment.weekNumber}</p>
                <p className="text-xs text-gray-500">
                  {new Date(payment.paidDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">₹{payment.amount}</p>
                <p className="text-xs text-green-500">✓ Paid</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500 dark:text-gray-400">No payments yet</p>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;