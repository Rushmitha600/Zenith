import React, { useState, useEffect } from 'react';
import { getMyPolicies } from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const PolicyManagement = () => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [calculatedPremiums, setCalculatedPremiums] = useState({});

  // City risk data (same as premium calculator)
  const cityRisk = {
    mumbai: { zone: 'High Risk', multiplier: 1.35, discount: '+35%' },
    delhi: { zone: 'High Risk', multiplier: 1.40, discount: '+40%' },
    bangalore: { zone: 'Safe Zone', multiplier: 0.85, discount: '-15%' },
    hyderabad: { zone: 'Medium Risk', multiplier: 1.05, discount: '+5%' },
    chennai: { zone: 'Medium Risk', multiplier: 1.10, discount: '+10%' },
    kolkata: { zone: 'Medium Risk', multiplier: 1.15, discount: '+15%' },
    pune: { zone: 'Safe Zone', multiplier: 0.90, discount: '-10%' },
    ahmedabad: { zone: 'Medium Risk', multiplier: 1.0, discount: '0%' },
    vijayawada: { zone: 'Low Risk', multiplier: 0.90, discount: '-10%' }
  };

  const plans = {
    basic: { 
      name: 'Basic Shield', 
      basePrice: 99, 
      coverage: 2000,
      features: ['✅ Rain Coverage (up to ₹500)', '✅ Heat Wave Protection (up to ₹300)', '✅ Cold Wave Coverage (up to ₹200)', '✅ 24/7 Customer Support'],
      color: 'from-blue-500 to-blue-600',
      icon: '🛡️'
    },
    standard: { 
      name: 'Standard Shield', 
      basePrice: 199, 
      coverage: 5000,
      features: ['✅ Rain Coverage (up to ₹1000)', '✅ Heat Wave Protection (up to ₹600)', '✅ Storm Coverage (up to ₹800)', '✅ Air Pollution Coverage (up to ₹500)', '✅ 24/7 Priority Support'],
      color: 'from-purple-500 to-purple-600',
      icon: '⭐',
      popular: true
    },
    premium: { 
      name: 'Premium Shield', 
      basePrice: 299, 
      coverage: 10000,
      features: ['✅ Rain Coverage (up to ₹2000)', '✅ Heat Wave Protection (up to ₹1200)', '✅ Storm Coverage (up to ₹1600)', '✅ Natural Disasters Coverage', '✅ Flood Coverage (up to ₹3000)', '✅ 24/7 Dedicated Support'],
      color: 'from-orange-500 to-orange-600',
      icon: '👑'
    }
  };

  // Calculate premium for a plan (SAME logic as premium calculator)
  const calculatePremiumForPlan = (planType) => {
    const plan = plans[planType];
    const cityInfo = cityRisk[user?.currentLocation?.city?.toLowerCase()] || { multiplier: 1.0, zone: 'Standard' };
    const deliveryCount = user?.deliveryLocations?.length || 1;
    const dailyIncomeAmount = user?.dailyIncome || 500;
    const monthlyIncome = dailyIncomeAmount * 30;
    
    let finalPrice = plan.basePrice;
    
    // 1. City risk adjustment
    finalPrice = finalPrice * cityInfo.multiplier;
    
    // 2. Delivery locations adjustment (each location adds 3%)
    finalPrice = finalPrice * (1 + (deliveryCount * 0.03));
    
    // 3. Income adjustment
    let incomeMultiplier = 1.0;
    if (monthlyIncome > 50000) incomeMultiplier = 1.2;
    else if (monthlyIncome > 30000) incomeMultiplier = 1.1;
    else if (monthlyIncome < 15000) incomeMultiplier = 0.9;
    finalPrice = finalPrice * incomeMultiplier;
    
    return Math.round(finalPrice * 100) / 100;
  };

  // Calculate all premiums when user data loads
  useEffect(() => {
    if (user) {
      const premiums = {
        basic: calculatePremiumForPlan('basic'),
        standard: calculatePremiumForPlan('standard'),
        premium: calculatePremiumForPlan('premium')
      };
      setCalculatedPremiums(premiums);
      console.log('Calculated Premiums:', premiums);
    }
    fetchPolicies();
  }, [user]);

  const fetchPolicies = async () => {
    try {
      const res = await getMyPolicies();
      setPolicies(res.data || []);
    } catch (error) { 
      toast.error('Failed to fetch policies'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handlePurchasePolicy = async (planType) => {
  if (!planType) {
    toast.error('Please select a plan');
    return;
  }
  
  const plan = plans[planType];
  const premiumAmount = calculatedPremiums[planType];
  
  setPurchasing(true);
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post('http://localhost:5000/api/auth/activate-policy', 
      { planType, premiumAmount },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (response.data.success) {
      const savedPremium = response.data.policy?.totalPremium || premiumAmount;
      toast.success(`Successfully purchased ${plan.name} at ₹${savedPremium}/week!`);
      setShowForm(false);
      setSelectedPlan(null);
      // Refresh policies
      await fetchPolicies();
    }
  } catch (error) { 
    console.error('Purchase error:', error);
    toast.error(error.response?.data?.message || 'Failed to purchase policy'); 
  } finally { 
    setPurchasing(false); 
  }
};

  if (loading && policies.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="spinner"></div>
      </div>
    );
  }

  const cityInfo = cityRisk[user?.currentLocation?.city?.toLowerCase()] || { zone: 'Standard', discount: '0%' };
  const deliveryCount = user?.deliveryLocations?.length || 1;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Insurance Policies</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Choose the right protection for your gig work</p>
          {user?.dailyIncome && (
            <p className="text-sm text-blue-600 mt-1">
              📍 Based on: ₹{user.dailyIncome}/day income | {user?.currentLocation?.city || 'Unknown'} city ({cityInfo.zone}) | {deliveryCount} delivery location(s)
            </p>
          )}
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ Buy New Policy'}
        </button>
      </div>

      {/* Buy Policy Form */}
      {showForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Choose Your Plan</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(plans).map(([key, plan]) => {
              const premiumAmount = calculatedPremiums[key] || plan.basePrice;
              return (
                <div
                  key={key}
                  onClick={() => setSelectedPlan(key)}
                  className={`bg-gradient-to-r ${plan.color} rounded-xl p-6 text-white cursor-pointer transition-all ${
                    selectedPlan === key ? 'ring-4 ring-yellow-400 transform scale-105' : 'hover:scale-105'
                  }`}
                >
                  <div className="text-4xl mb-2">{plan.icon}</div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-3xl font-bold mt-2">₹{premiumAmount}<span className="text-sm">/week</span></p>
                  <p className="text-sm mt-1">Coverage: ₹{plan.coverage.toLocaleString()}</p>
                  {plan.popular && (
                    <span className="inline-block mt-2 bg-yellow-400 text-purple-900 text-xs px-2 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          
          {selectedPlan && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <h4 className="font-bold mb-2 dark:text-white">✨ Premium Calculation Details:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price:</span>
                  <span>₹{plans[selectedPlan].basePrice}/week</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">City ({user?.currentLocation?.city || 'Unknown'}):</span>
                  <span className={cityInfo.multiplier < 1 ? 'text-green-600' : 'text-red-600'}>
                    {cityInfo.discount} ({cityInfo.zone})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Locations ({deliveryCount}):</span>
                  <span>+{deliveryCount * 3}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Income (₹{user?.dailyIncome}/day):</span>
                  <span>
                    {user?.dailyIncome * 30 > 50000 ? '+20%' : 
                     user?.dailyIncome * 30 > 30000 ? '+10%' : 
                     user?.dailyIncome * 30 < 15000 ? '-10%' : 'Standard'}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>✨ Your Weekly Premium:</span>
                    <span className="text-blue-600">₹{calculatedPremiums[selectedPlan]}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => handlePurchasePolicy(selectedPlan)}
              disabled={!selectedPlan || purchasing}
              className="btn-primary"
            >
              {purchasing ? 'Processing...' : `Buy ${selectedPlan ? plans[selectedPlan].name : 'Plan'} at ₹${selectedPlan ? calculatedPremiums[selectedPlan] : ''}/week`}
            </button>
          </div>
        </motion.div>
      )}

      {/* My Policies List */}
      {policies.length > 0 ? (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">My Active Policies</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies.map((policy) => (
              <div key={policy._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className={`bg-gradient-to-r ${
                  policy.planType === 'basic' ? 'from-blue-500 to-blue-600' :
                  policy.planType === 'standard' ? 'from-purple-500 to-purple-600' :
                  'from-orange-500 to-orange-600'
                } p-4 text-white`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-3xl mb-1">
                        {policy.planType === 'basic' ? '🛡️' : policy.planType === 'standard' ? '⭐' : '👑'}
                      </div>
                      <h3 className="font-bold text-lg capitalize">{policy.planType} Shield</h3>
                      <p className="text-xs opacity-90">Policy #{policy.policyNumber?.slice(-8)}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-500 rounded-full text-xs font-semibold">
                      Active
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Weekly Premium</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{policy.totalPremium}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Coverage</p>
                      <p className="font-semibold text-gray-900 dark:text-white">₹{policy.coverageAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Started</span>
                      <span className="text-gray-900 dark:text-white">{new Date(policy.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">Next Payment</span>
                      <span className="text-gray-900 dark:text-white">{new Date(new Date(policy.startDate).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛡️</div>
          <p className="text-gray-500 text-lg">No active policies</p>
          <p className="text-gray-400 mt-2">Click "Buy New Policy" to get protected!</p>
        </div>
      )}
    </div>
  );
};

export default PolicyManagement;