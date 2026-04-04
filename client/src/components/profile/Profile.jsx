import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_URL } from '../../config/api';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    dailyIncome: user?.dailyIncome || '',
    currentCity: user?.currentLocation?.city || '',
    currentArea: user?.currentLocation?.area || '',
    currentAddress: user?.currentLocation?.address || ''
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        dailyIncome: parseFloat(formData.dailyIncome) || 0,
        currentLocation: {
          city: formData.currentCity,
          area: formData.currentArea,
          address: formData.currentAddress
        }
      };
      
      console.log('Saving profile data:', updateData);
      
      const response = await axios.put(
        `${API_URL}/auth/update-profile`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Response:', response.data);

      if (response.data.success) {
        // Update user in context
        const updatedUser = { ...user, ...response.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);

        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl text-blue-600 font-bold shadow-lg">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name || 'User'}</h1>
              <p className="text-white/80">{user?.email || 'No email'}</p>
              <p className="text-white/80">{user?.phone || 'No phone'}</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="p-6 space-y-6">
          {!isEditing ? (
            <>
              {/* View Mode */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">📧 Email</h3>
                  <p className="text-gray-900 dark:text-white">{user?.email || '-'}</p>
                </div>
                <div className="border rounded-lg p-4 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">📱 Phone</h3>
                  <p className="text-gray-900 dark:text-white">{user?.phone || '-'}</p>
                </div>
                <div className="border rounded-lg p-4 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">💰 Daily Income</h3>
                  <p className="text-gray-900 dark:text-white">₹{user?.dailyIncome || 0}/day</p>
                </div>
                <div className="border rounded-lg p-4 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">📍 Current City</h3>
                  <p className="text-gray-900 dark:text-white">{user?.currentLocation?.city || 'Not added'}</p>
                </div>
                <div className="border rounded-lg p-4 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">📍 Current Area</h3>
                  <p className="text-gray-900 dark:text-white">{user?.currentLocation?.area || 'Not added'}</p>
                </div>
                <div className="border rounded-lg p-4 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">🏦 Role</h3>
                  <p className="text-gray-900 dark:text-white capitalize">{user?.role || 'Worker'}</p>
                </div>
              </div>

              {/* Delivery Locations Section */}
              {user?.deliveryLocations && user.deliveryLocations.length > 0 && (
                <div className="border rounded-lg p-4 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">🚚 Delivery Locations</h3>
                  <div className="space-y-2">
                    {user.deliveryLocations.map((loc, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <p className="font-medium dark:text-white">{loc.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{loc.city}, {loc.area}</p>
                        <p className="text-xs text-gray-400">Pincode: {loc.pincode}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bank Details Section */}
              {user?.bankDetails?.accountNumber && (
                <div className="border rounded-lg p-4 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">🏦 Bank Details</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Account Holder:</span> {user.bankDetails.accountHolderName}</div>
                    <div><span className="text-gray-500">Bank Name:</span> {user.bankDetails.bankName}</div>
                    <div><span className="text-gray-500">Account Number:</span> ****{user.bankDetails.accountNumber?.slice(-4)}</div>
                    <div><span className="text-gray-500">IFSC Code:</span> {user.bankDetails.ifscCode}</div>
                  </div>
                </div>
              )}

              {/* Edit Button */}
              <button
                onClick={() => setIsEditing(true)}
                className="w-full btn-primary py-3"
              >
                Edit Profile
              </button>
            </>
          ) : (
            <>
              {/* Edit Mode */}
              <h3 className="text-xl font-bold mb-4 dark:text-white">Edit Profile</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Daily Income (₹)</label>
                  <input
                    type="number"
                    value={formData.dailyIncome}
                    onChange={(e) => setFormData({ ...formData, dailyIncome: e.target.value })}
                    className="input-field"
                    placeholder="Your average daily earnings"
                  />
                  <p className="text-xs text-gray-500 mt-1">This helps us calculate your premium accurately</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current City</label>
                  <input
                    type="text"
                    value={formData.currentCity}
                    onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Bangalore, Mumbai, Delhi"
                    list="cities"
                  />
                  <datalist id="cities">
                    <option>Bangalore</option>
                    <option>Mumbai</option>
                    <option>Delhi</option>
                    <option>Hyderabad</option>
                    <option>Chennai</option>
                    <option>Kolkata</option>
                    <option>Pune</option>
                    <option>Ahmedabad</option>
                  </datalist>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Area / Locality</label>
                  <input
                    type="text"
                    value={formData.currentArea}
                    onChange={(e) => setFormData({ ...formData, currentArea: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Koramangala, Hitech City, Andheri East"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Address</label>
                  <textarea
                    value={formData.currentAddress}
                    onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                    className="input-field"
                    rows="2"
                    placeholder="Your complete address"
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;