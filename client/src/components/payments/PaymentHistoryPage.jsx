import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PaymentHistoryPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPaid, setTotalPaid] = useState(0);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/auth/payment-history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPayments(response.data);
        
        // Calculate total paid amount
        const total = response.data.reduce((sum, payment) => sum + payment.amount, 0);
        setTotalPaid(total);
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
      <div className="flex justify-center items-center h-96">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment History</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View all your past payments</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 text-white text-center min-w-[150px]">
          <p className="text-sm opacity-90">Total Paid</p>
          <p className="text-2xl font-bold">₹{totalPaid.toLocaleString()}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Total Payments</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{payments.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
          <div className="text-3xl mb-2">💰</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Average Payment</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{payments.length > 0 ? Math.round(totalPaid / payments.length) : 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
          <div className="text-3xl mb-2">📅</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Last Payment</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {payments.length > 0 ? new Date(payments[0]?.paidDate).toLocaleDateString() : '-'}
          </p>
        </div>
      </div>

      {/* Payment History Table */}
      {payments.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Week</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {payments.map((payment, index) => (
                  <motion.tr
                    key={payment._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Week {payment.weekNumber}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">₹{payment.amount}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {new Date(payment.paidDate).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(payment.dueDate).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {payment.transactionId?.slice(-12) || 'TXN****'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        ✓ Paid
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">📜</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">No payment history yet</p>
          <p className="text-gray-400 mt-2">Your payments will appear here once you make a payment</p>
          <Link to="/policies" className="inline-block mt-4 btn-primary">
            Buy a Policy
          </Link>
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryPage;