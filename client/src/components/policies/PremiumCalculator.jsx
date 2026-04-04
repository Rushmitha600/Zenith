import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PremiumCalculator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [deliveryLocations, setDeliveryLocations] = useState([]);
  const [dailyIncome, setDailyIncome] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('standard');
  const [premiumResult, setPremiumResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', city: '' });

  // Plan details
  const plans = {
    basic: { name: 'Basic Shield', basePrice: 99, coverage: 2000, color: 'from-blue-500 to-blue-600', icon: '🛡️' },
    standard: { name: 'Standard Shield', basePrice: 199, coverage: 5000, color: 'from-purple-500 to-purple-600', icon: '⭐' },
    premium: { name: 'Premium Shield', basePrice: 299, coverage: 10000, color: 'from-orange-500 to-orange-600', icon: '👑' }
  };

  // City risk data
  const cityRisk = {
    mumbai: { zone: 'High Risk', multiplier: 1.35 },
    delhi: { zone: 'High Risk', multiplier: 1.40 },
    bangalore: { zone: 'Safe Zone', multiplier: 0.85 },
    hyderabad: { zone: 'Medium Risk', multiplier: 1.05 },
    chennai: { zone: 'Medium Risk', multiplier: 1.10 },
    kolkata: { zone: 'Medium Risk', multiplier: 1.15 },
    pune: { zone: 'Safe Zone', multiplier: 0.90 },
    ahmedabad: { zone: 'Medium Risk', multiplier: 1.0 },
    vijayawada: { zone: 'Low Risk', multiplier: 0.90 }
  };

  // Auto load data from user profile
  useEffect(() => {
    if (user) {
      if (user.currentLocation?.city) {
        setCity(user.currentLocation.city);
      }
      if (user.dailyIncome) {
        setDailyIncome(user.dailyIncome.toString());
      }
      if (user.deliveryLocations && user.deliveryLocations.length > 0) {
        const locations = user.deliveryLocations.map(loc => ({
          name: loc.name || 'Delivery Location',
          city: loc.city,
          isFromProfile: true
        }));
        setDeliveryLocations(locations);
      }
    }
  }, [user]);

  // Calculate premium function
  const calculatePremiumAmount = () => {
    const plan = plans[selectedPlan];
    const cityInfo = cityRisk[city?.toLowerCase()] || { multiplier: 1.0, zone: 'Standard' };
    
    let finalPrice = plan.basePrice;
    
    // 1. City risk adjustment
    finalPrice = finalPrice * cityInfo.multiplier;
    
    // 2. Delivery locations adjustment (each location adds 3%)
    const locationCount = deliveryLocations.length;
    const locationMultiplier = 1 + (locationCount * 0.03);
    finalPrice = finalPrice * locationMultiplier;
    
    // 3. Income adjustment (based on daily income)
    const dailyIncomeAmount = parseFloat(dailyIncome) || 500;
    const monthlyIncome = dailyIncomeAmount * 30;
    let incomeMultiplier = 1.0;
    if (monthlyIncome > 50000) incomeMultiplier = 1.2;
    else if (monthlyIncome > 30000) incomeMultiplier = 1.1;
    else if (monthlyIncome < 15000) incomeMultiplier = 0.9;
    finalPrice = finalPrice * incomeMultiplier;
    
    return {
      weeklyPremium: Math.round(finalPrice * 100) / 100,
      coverage: plan.coverage,
      planName: plan.name,
      cityZone: cityInfo.zone,
      locationCount: locationCount,
      dailyIncome: dailyIncomeAmount,
      monthlyIncome: monthlyIncome,
      incomeMultiplier: incomeMultiplier,
      cityMultiplier: cityInfo.multiplier
    };
  };

  const calculatePremium = () => {
    if (!city) {
      toast.error('City not found in profile');
      return;
    }
    if (!dailyIncome) {
      toast.error('Daily income not found in profile');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = calculatePremiumAmount();
      setPremiumResult(result);
      toast.success(`Premium calculated: ₹${result.weeklyPremium}/week`);
      setLoading(false);
    }, 500);
  };

  const addDeliveryLocation = () => {
    if (!newLocation.name || !newLocation.city) {
      toast.error('Please enter location name and city');
      return;
    }
    
    setDeliveryLocations([...deliveryLocations, { 
      name: newLocation.name, 
      city: newLocation.city,
      isFromProfile: false,
      isTemporary: true
    }]);
    setNewLocation({ name: '', city: '' });
    setShowAddLocation(false);
    toast.success('Location added for calculation');
  };

  const removeDeliveryLocation = (index) => {
    const location = deliveryLocations[index];
    if (location.isFromProfile) {
      toast.error('Cannot remove profile location. Update in Profile page.');
      return;
    }
    const newLocations = deliveryLocations.filter((_, i) => i !== index);
    setDeliveryLocations(newLocations);
    toast.success('Location removed');
  };

  // Buy policy button click handler
  const handleBuyPolicy = () => {
    if (!premiumResult) {
      toast.error('Please calculate premium first');
      return;
    }
    // Store selected plan in localStorage or state
    localStorage.setItem('selectedPlanForPurchase', selectedPlan);
    localStorage.setItem('calculatedPremium', premiumResult.weeklyPremium);
    // Navigate to policies page
    navigate('/policies');
  };

  return (
    <div className="card max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">💰 Premium Calculator</h2>
      <p className="text-gray-600 mb-6">Calculate your personalized weekly premium</p>
      
      <div className="space-y-4">
        {/* Primary City - Readonly */}
        <div>
          <label className="block text-sm font-medium mb-1">📍 Your Primary City</label>
          <input
            type="text"
            value={city}
            readOnly
            disabled
            className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">From your profile</p>
        </div>
        
        {/* Daily Income - Readonly */}
        <div>
          <label className="block text-sm font-medium mb-1">💰 Daily Income (₹)</label>
          <input
            type="number"
            value={dailyIncome}
            readOnly
            disabled
            className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">From your profile</p>
        </div>
        
        {/* Delivery Locations */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">🚚 Delivery Locations</label>
            <button
              type="button"
              onClick={() => setShowAddLocation(!showAddLocation)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              + Add Location
            </button>
          </div>
          
          {deliveryLocations.map((loc, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={loc.name}
                readOnly
                disabled={loc.isFromProfile}
                className={`input-field flex-1 ${loc.isFromProfile ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white'}`}
              />
              <input
                type="text"
                value={loc.city}
                readOnly
                disabled={loc.isFromProfile}
                className={`input-field flex-1 ${loc.isFromProfile ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white'}`}
              />
              {!loc.isFromProfile && (
                <button
                  type="button"
                  onClick={() => removeDeliveryLocation(index)}
                  className="text-red-500 px-3 hover:text-red-700"
                >
                  ✕
                </button>
              )}
              {loc.isFromProfile && (
                <span className="text-xs text-green-500 flex items-center ml-1">Profile</span>
              )}
            </div>
          ))}
          
          {showAddLocation && (
            <div className="mt-3 p-3 border border-dashed border-gray-300 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">Add temporary location</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                  placeholder="Location name"
                  className="input-field flex-1 text-sm"
                />
                <input
                  type="text"
                  value={newLocation.city}
                  onChange={(e) => setNewLocation({...newLocation, city: e.target.value})}
                  placeholder="City"
                  className="input-field flex-1 text-sm"
                  list="cities"
                />
                <button
                  type="button"
                  onClick={addDeliveryLocation}
                  className="btn-primary text-sm px-3"
                >
                  Add
                </button>
              </div>
              <datalist id="cities">
                <option>Bangalore</option><option>Mumbai</option><option>Delhi</option>
                <option>Hyderabad</option><option>Chennai</option><option>Pune</option>
              </datalist>
            </div>
          )}
        </div>
        
        {/* Plan Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">🎯 Select Plan</label>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(plans).map(([key, plan]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedPlan(key);
                  setPremiumResult(null);
                }}
                className={`p-3 rounded-lg text-center transition ${
                  selectedPlan === key 
                    ? `bg-gradient-to-r ${plan.color} text-white shadow-lg` 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-2xl mb-1">{plan.icon}</div>
                <p className="font-semibold text-sm">{plan.name}</p>
                <p className="text-xs">₹{plan.basePrice}/week</p>
              </button>
            ))}
          </div>
        </div>
        
        {/* Calculate Button */}
        <button onClick={calculatePremium} disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Calculating...' : '🔢 Calculate Premium'}
        </button>
        
        {/* Results */}
        {premiumResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <h3 className="font-bold text-lg mb-3">📊 Your Premium Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Selected Plan:</span>
                <span className="font-semibold">{premiumResult.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price:</span>
                <span>₹{plans[selectedPlan].basePrice}/week</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Your City:</span>
                <span>{city} ({premiumResult.cityZone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">City Factor:</span>
                <span>{premiumResult.cityMultiplier > 1 ? `+${((premiumResult.cityMultiplier - 1) * 100).toFixed(0)}%` : `${((1 - premiumResult.cityMultiplier) * 100).toFixed(0)}% discount`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Locations:</span>
                <span>{premiumResult.locationCount} locations (+{premiumResult.locationCount * 3}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Income:</span>
                <span>₹{premiumResult.dailyIncome}/day</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>✨ Your Weekly Premium:</span>
                  <span className="text-blue-600">₹{premiumResult.weeklyPremium}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Coverage up to ₹{premiumResult.coverage.toLocaleString()}</p>
              </div>
            </div>
            
            {/* Buy Policy Button */}
            <button 
              onClick={handleBuyPolicy}
              className="w-full btn-primary mt-4 py-3 text-base"
            >
              🛡️ Buy This Policy Now
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PremiumCalculator;