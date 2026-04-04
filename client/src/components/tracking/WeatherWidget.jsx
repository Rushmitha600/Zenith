import React from 'react';

const WeatherWidget = ({ weatherData, city }) => {
  const getWeatherIcon = (condition) => {
    const icons = { 'Clear': '☀️', 'Clouds': '☁️', 'Rain': '🌧️', 'Thunderstorm': '⛈️', 'Snow': '❄️', 'Mist': '🌫️' };
    return icons[condition] || '🌡️';
  };

  const getPrecaution = () => {
    if (weatherData.temp > 38) return '🔥 Extreme heat! Stay hydrated, take breaks in shade';
    if (weatherData.temp < 10) return '❄️ Cold weather! Wear warm clothes';
    if (weatherData.rain > 30) return '🌧️ Heavy rain! Use rain cover, drive carefully';
    if (weatherData.windSpeed > 40) return '💨 Strong winds! Be cautious while riding';
    return '✅ Weather conditions are favorable for work';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">🌤️ Weather in {city}</h3>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4"><span className="text-6xl">{getWeatherIcon(weatherData.condition)}</span><div><p className="text-4xl font-bold">{weatherData.temp}°C</p><p className="text-gray-600 capitalize">{weatherData.condition}</p></div></div>
        <div><p className="text-sm text-gray-500">Feels like</p><p className="text-xl font-semibold">{weatherData.feelsLike || weatherData.temp}°C</p></div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Humidity</p><p className="text-lg font-semibold">{weatherData.humidity}%</p></div>
        <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Wind Speed</p><p className="text-lg font-semibold">{weatherData.windSpeed} km/h</p></div>
        <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Rainfall</p><p className="text-lg font-semibold">{weatherData.rainfall || 0} mm</p></div>
        <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Air Quality</p><p className="text-lg font-semibold">AQI {weatherData.aqi || 120}</p></div>
      </div>
      <div className="p-4 bg-blue-100 rounded-lg"><p className="text-sm font-medium">⚠️ Precaution:</p><p className="text-sm mt-1">{getPrecaution()}</p></div>
    </div>
  );
};

export default WeatherWidget;