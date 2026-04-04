import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { autoClaim } from '../../services/api';
import toast from 'react-hot-toast';

const AutoClaimSimulator = ({ policies, onClose, onClaimGenerated }) => {
  const [selectedTrigger, setSelectedTrigger] = useState('heavy_rain');
  const [intensity, setIntensity] = useState(75);
  const [loading, setLoading] = useState(false);

  const triggers = [
    {
      id: 'heavy_rain',
      name: 'Heavy Rainfall',
      icon: '🌧️',
      description: 'Rainfall exceeding 50mm',
      threshold: 50,
      compensation: 500,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'heat_wave',
      name: 'Extreme Heat',
      icon: '🔥',
      description: 'Temperature above 40°C',
      threshold: 40,
      compensation: 300,
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'air_pollution',
      name: 'Air Pollution',
      icon: '😷',
      description: 'AQI above 300',
      threshold: 300,
      compensation: 200,
      color: 'from-gray-500 to-gray-700'
    },
    {
      id: 'storm',
      name: 'Thunderstorm',
      icon: '⛈️',
      description: 'Storm with lightning',
      threshold: 1,
      compensation: 400,
      color: 'from-purple-500 to-purple-700'
    },
    {
      id: 'flood',
      name: 'Flood Warning',
      icon: '🌊',
      description: 'Flood risk detected',
      threshold: 1,
      compensation: 600,
      color: 'from-cyan-500 to-blue-700'
    }
  ];

  const getWeatherData = () => {
    const trigger = triggers.find(t => t.id === selectedTrigger);
    
    switch(selectedTrigger) {
      case 'heavy_rain':
        return { rainfall: intensity, temp: 28, aqi: 150, storm: false, floodRisk: 'low' };
      case 'heat_wave':
        return { rainfall: 0, temp: intensity, aqi: 180, storm: false, floodRisk: 'low' };
      case 'air_pollution':
        return { rainfall: 0, temp: 32, aqi: intensity, storm: false, floodRisk: 'low' };
      case 'storm':
        return { rainfall: 45, temp: 28, aqi: 120, storm: true, floodRisk: 'medium' };
      case 'flood':
        return { rainfall: 120, temp: 26, aqi: 110, storm: true, floodRisk: 'high' };
      default:
        return { rainfall: 0, temp: 28, aqi: 100, storm: false, floodRisk: 'low' };
    }
  };

  const handleSimulate = async () => {
    if (policies.length === 0) {
      toast.error('No active policy found. Please buy a policy first.');
      return;
    }

    setLoading(true);
    const weatherData = getWeatherData();
    const trigger = triggers.find(t => t.id === selectedTrigger);
    
    // Show simulation animation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const response = await autoClaim(weatherData, policies[0]._id);
      if (response.data.claim) {
        toast.success(`Auto-claim generated! ₹${trigger.compensation} approved.`);
        onClaimGenerated();
        setTimeout(onClose, 2000);
      } else {
        toast.error('No trigger conditions met. Increase intensity.');
      }
    } catch (error) {
      toast.error('Failed to simulate auto-claim');
    } finally {
      setLoading(false);
    }
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
        className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">🤖 Auto-Claim Simulator</h2>
              <p className="text-white/80 text-sm mt-1">Test how our AI detects weather disruptions</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">✕</button>
          </div>
        </div>

        <div className="p-6">
          {/* Trigger Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Select Weather Trigger</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {triggers.map((trigger) => (
                <button
                  key={trigger.id}
                  onClick={() => setSelectedTrigger(trigger.id)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    selectedTrigger === trigger.id
                      ? `bg-gradient-to-r ${trigger.color} text-white shadow-lg scale-105`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">{trigger.icon}</div>
                  <p className="text-xs font-medium">{trigger.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Intensity Slider */}
          {selectedTrigger !== 'storm' && selectedTrigger !== 'flood' && (
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Intensity</h3>
                <span className="text-sm text-blue-600 font-semibold">
                  {selectedTrigger === 'heavy_rain' && `${intensity}mm`}
                  {selectedTrigger === 'heat_wave' && `${intensity}°C`}
                  {selectedTrigger === 'air_pollution' && `AQI ${intensity}`}
                </span>
              </div>
              <input
                type="range"
                min={selectedTrigger === 'air_pollution' ? 200 : 30}
                max={selectedTrigger === 'air_pollution' ? 500 : 55}
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>Threshold</span>
                <span>Extreme</span>
              </div>
            </div>
          )}

          {/* Current Trigger Info */}
          {(() => {
            const trigger = triggers.find(t => t.id === selectedTrigger);
            const weatherData = getWeatherData();
            let isTriggered = false;
            
            if (selectedTrigger === 'heavy_rain') isTriggered = weatherData.rainfall >= trigger.threshold;
            if (selectedTrigger === 'heat_wave') isTriggered = weatherData.temp >= trigger.threshold;
            if (selectedTrigger === 'air_pollution') isTriggered = weatherData.aqi >= trigger.threshold;
            if (selectedTrigger === 'storm') isTriggered = weatherData.storm;
            if (selectedTrigger === 'flood') isTriggered = weatherData.floodRisk === 'high';
            
            return (
              <div className={`p-4 rounded-xl mb-6 ${
                isTriggered ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold mb-1">
                      {isTriggered ? '✓ Trigger Condition Met' : '⚠️ Below Threshold'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {trigger.description} • Compensation: ₹{trigger.compensation}
                    </p>
                  </div>
                  <div className="text-2xl">{trigger.icon}</div>
                </div>
              </div>
            );
          })()}

          {/* Simulation Preview */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">📊 Simulation Preview</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Rainfall</p>
                <p className="font-semibold">{getWeatherData().rainfall}mm</p>
              </div>
              <div>
                <p className="text-gray-500">Temperature</p>
                <p className="font-semibold">{getWeatherData().temp}°C</p>
              </div>
              <div>
                <p className="text-gray-500">Air Quality</p>
                <p className="font-semibold">AQI {getWeatherData().aqi}</p>
              </div>
              <div>
                <p className="text-gray-500">Storm Risk</p>
                <p className="font-semibold">{getWeatherData().storm ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Active Policy Info */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              📋 Active Policy: {policies.length > 0 ? 
                `${policies[0].planType} Shield - ₹${policies[0].coverageAmount.toLocaleString()} coverage` : 
                'No active policy found'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSimulate}
              disabled={loading || policies.length === 0}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Simulating...
                </span>
              ) : (
                '🚀 Run Auto-Claim Simulation'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AutoClaimSimulator;