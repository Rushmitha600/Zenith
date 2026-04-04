import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getWeatherByCity, getSafetyTipsByLocation } from '../../services/api';
import toast from 'react-hot-toast';

const ManualWeatherInput = ({ onWeatherData, onSafetyTips }) => {
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentCities, setRecentCities] = useState(() => {
    const saved = localStorage.getItem('recentCities');
    return saved ? JSON.parse(saved) : [];
  });

  const handleGetWeather = async (e) => {
    e.preventDefault();
    if (!city.trim()) {
      toast.error('Please enter a city name');
      return;
    }

    setLoading(true);
    try {
      const weatherRes = await getWeatherByCity(city);
      const tipsRes = await getSafetyTipsByLocation({ city });
      
      onWeatherData(weatherRes.data);
      onSafetyTips(tipsRes.data);
      
      // Save to recent cities
      const updatedCities = [city, ...recentCities.filter(c => c !== city)].slice(0, 5);
      setRecentCities(updatedCities);
      localStorage.setItem('recentCities', JSON.stringify(updatedCities));
      
      toast.success(`Weather data for ${city} loaded!`);
    } catch (error) {
      toast.error('City not found. Please check the name and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const weatherRes = await getWeatherByCoords(position.coords.latitude, position.coords.longitude);
            const tipsRes = await getSafetyTipsByLocation({ 
              lat: position.coords.latitude, 
              lng: position.coords.longitude 
            });
            onWeatherData(weatherRes.data);
            onSafetyTips(tipsRes.data);
            setCity(weatherRes.data.city);
            toast.success('Location detected! Weather data loaded.');
          } catch (error) {
            toast.error('Failed to get weather for your location');
          } finally {
            setLoading(false);
          }
        },
        () => {
          toast.error('Unable to get your location');
          setLoading(false);
        }
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <span className="mr-2">🌤️</span> Get Weather & Safety Tips
      </h3>
      
      <form onSubmit={handleGetWeather} className="mb-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name (e.g., Mumbai, Delhi, Bangalore)"
            className="input-field flex-1"
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Loading...' : 'Get Weather'}
          </button>
        </div>
      </form>

      <div className="flex gap-3 mb-4">
        <button
          onClick={handleUseCurrentLocation}
          disabled={loading}
          className="btn-secondary flex-1"
        >
          📍 Use My Current Location
        </button>
      </div>

      {recentCities.length > 0 && (
        <div>
          <p className="text-sm text-gray-500 mb-2">Recent searches:</p>
          <div className="flex flex-wrap gap-2">
            {recentCities.map((c, i) => (
              <button
                key={i}
                onClick={() => {
                  setCity(c);
                  handleGetWeather({ preventDefault: () => {} });
                }}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualWeatherInput;