import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';  // Add this line
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const LocationTracker = () => {
  const { user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load locations from user profile
  useEffect(() => {
    if (user) {
      const locationList = [];
      
      // Add current location from user's profile
      if (user.currentLocation?.city) {
        locationList.push({
          id: 'current',
          name: '📍 My Current Location',
          city: user.currentLocation.city,
          area: user.currentLocation.area,
          type: 'current',
          address: user.currentLocation.address
        });
      }
      
      // Add delivery locations from user's registration
      if (user.deliveryLocations && user.deliveryLocations.length > 0) {
        user.deliveryLocations.forEach((loc, index) => {
          locationList.push({
            id: `delivery-${index}`,
            name: loc.name || `Delivery Location ${index + 1}`,
            city: loc.city,
            area: loc.area,
            pincode: loc.pincode,
            type: 'delivery'
          });
        });
      }
      
      setLocations(locationList);
      
      // Auto-select first location (current location)
      if (locationList.length > 0) {
        setSelectedLocation(locationList[0]);
        getWeatherForLocation(locationList[0]);
      }
    }
  }, [user]);

  const getWeatherForLocation = async (location) => {
    if (!location?.city) {
      toast.error('Location city not found');
      return;
    }
    
    setLoading(true);
    setSelectedLocation(location);
    
    try {
      const weatherRes = await axios.get(`${API_URL}/tracking/weather?city=${encodeURIComponent(location.city)}`);
      setWeather(weatherRes.data);
      
      const forecastRes = await axios.get(`${API_URL}/tracking/forecast?city=${encodeURIComponent(location.city)}`);
      setForecast(forecastRes.data);
      
      toast.success(`Weather for ${location.name} loaded!`);
    } catch (error) {
      console.error('Weather fetch error:', error);
      toast.error('Failed to get weather data');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getPrecaution = () => {
    if (weather?.temp > 38) return '🔥 Extreme heat! Stay hydrated, take breaks in shade';
    if (weather?.condition === 'Rain') return '🌧️ Rain alert! Use rain cover, drive carefully';
    if (weather?.windSpeed > 40) return '💨 Strong winds! Be cautious while riding';
    if (weather?.condition === 'Thunderstorm') return '⛈️ Storm alert! Find safe shelter';
    return '✅ Weather conditions are favorable for work';
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">📍 Live Weather & Safety</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Weather updates for your registered locations</p>

      {/* Location Selector Buttons */}
      {locations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 dark:text-white">Select Location:</h2>
          <div className="flex flex-wrap gap-3">
            {locations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => getWeatherForLocation(loc)}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedLocation?.id === loc.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {loc.type === 'current' ? '📍 ' : '🚚 '}{loc.name}
                {loc.city && <span className="text-xs ml-1 opacity-70">({loc.city})</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Weather Display */}
      {weather && selectedLocation && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Location Info Card */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-4 mb-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-90">Selected Location</p>
                <p className="text-xl font-bold">{selectedLocation.name}</p>
                <p className="text-sm opacity-80">{selectedLocation.city}, {selectedLocation.area}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{weather.temp}°C</p>
                <p className="text-sm capitalize">{weather.condition}</p>
              </div>
            </div>
          </div>

          {/* Current Weather Details */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold mb-4 dark:text-white">🌤️ Current Weather</h3>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <img src={getWeatherIcon(weather.icon)} alt={weather.condition} className="w-20 h-20" />
                <div>
                  <p className="text-5xl font-bold dark:text-white">{weather.temp}°C</p>
                  <p className="text-gray-600 dark:text-gray-400 capitalize">{weather.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Feels like</p>
                <p className="text-xl font-semibold dark:text-white">{weather.feelsLike}°C</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Humidity</p>
                <p className="text-lg font-semibold">{weather.humidity}%</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Wind Speed</p>
                <p className="text-lg font-semibold">{weather.windSpeed} km/h</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Pressure</p>
                <p className="text-lg font-semibold">{weather.pressure} hPa</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Condition</p>
                <p className="text-lg font-semibold capitalize">{weather.condition}</p>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${
              weather.temp > 38 ? 'bg-red-100 dark:bg-red-900/30' : 
              weather.condition === 'Rain' ? 'bg-blue-100 dark:bg-blue-900/30' : 
              'bg-green-100 dark:bg-green-900/30'
            }`}>
              <p className="text-sm font-medium">⚠️ Precaution:</p>
              <p className="text-sm mt-1">{getPrecaution()}</p>
            </div>
          </div>

          {/* 7-Day Forecast */}
          {forecast && forecast.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 dark:text-white">📅 7-Day Forecast for {selectedLocation.city}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {forecast.map((day, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-center">
                    <p className="font-bold text-sm dark:text-white">{day.day}</p>
                    <img src={getWeatherIcon(day.icon)} alt={day.condition} className="w-12 h-12 mx-auto my-1" />
                    <p className="font-bold dark:text-white">{day.temp}°C</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{day.condition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {locations.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">📍</div>
          <p className="text-gray-500 text-lg">No locations found</p>
          <p className="text-gray-400 mt-2">Please update your profile with current city and delivery locations</p>
          <Link to="/profile" className="inline-block mt-4 btn-primary">Update Profile</Link>
        </div>
      )}

      {locations.length > 0 && !weather && !loading && (
        <div className="text-center py-12">
          <div className="spinner mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading weather data...</p>
        </div>
      )}
    </div>
  );
};

export default LocationTracker;