import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const PaymentCalendar = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/upcoming-payments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter only pending payments
      const pendingPayments = response.data.filter(p => p.status === 'pending');
      setPayments(pendingPayments);
      
      console.log('Pending payments:', pendingPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    const interval = setInterval(fetchPayments, 30000);
    return () => clearInterval(interval);
  }, []);

  const processPayment = async (payment) => {
    setProcessingPayment(payment._id);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/auth/pay/${payment._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success(`Payment of ₹${payment.amount} for Week ${payment.weekNumber} completed!`);
        await fetchPayments();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed');
    } finally {
      setProcessingPayment(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex justify-center items-center h-40">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  const totalPending = payments.reduce((sum, p) => sum + p.amount, 0);
  const nextPayment = payments[0];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center dark:text-white">
        <span className="mr-2">📅</span> Upcoming Payments
      </h3>
      
      {payments.length > 0 ? (
        <div className="space-y-4">
          {/* Next Payment Highlight */}
          {nextPayment && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-90">Next Payment Due</p>
                  <p className="text-2xl font-bold">₹{nextPayment.amount}</p>
                  <p className="text-xs opacity-90">Week {nextPayment.weekNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    {new Date(nextPayment.dueDate).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => processPayment(nextPayment)}
                    disabled={processingPayment === nextPayment._id}
                    className="mt-2 px-3 py-1 bg-white text-purple-600 rounded-lg text-xs font-semibold"
                  >
                    {processingPayment === nextPayment._id ? '...' : 'Pay Now →'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Total Pending */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Total Pending</p>
            <p className="text-2xl font-bold">₹{totalPending}</p>
            <p className="text-xs text-gray-500">{payments.length} weeks remaining</p>
          </div>

          {/* All Payments List */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Payment Schedule</p>
            {payments.map((payment) => (
              <div key={payment._id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">Week {payment.weekNumber}</p>
                  <p className="text-xs text-gray-500">
                    Due: {new Date(payment.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{payment.amount}</p>
                  <button
                    onClick={() => processPayment(payment)}
                    disabled={processingPayment === payment._id}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    {processingPayment === payment._id ? '...' : 'Pay'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-gray-500">No pending payments</p>
          <p className="text-xs text-gray-400">All payments are up to date!</p>
        </div>
      )}
    </div>
  );
};

export default PaymentCalendar;