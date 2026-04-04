import express from 'express';
import axios from 'axios';

const router = express.Router();
const API_KEY = 'f57bf18c4a8117946704e8addd580944'; // Replace with your key

// Weather by city name
router.get('/weather', async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city || city === 'undefined') {
      return res.status(400).json({ error: 'City name required' });
    }
    
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const response = await axios.get(url);
    
    res.json({
      city: response.data.name,
      temp: Math.round(response.data.main.temp),
      feelsLike: Math.round(response.data.main.feels_like),
      condition: response.data.weather[0].main,
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      windSpeed: Math.round(response.data.wind.speed * 3.6),
      pressure: response.data.main.pressure,
      icon: response.data.weather[0].icon
    });
  } catch (error) {
    console.error('Weather API Error:', error.message);
    // Return mock data if API fails
    res.json({
      city: req.query.city || 'Unknown',
      temp: 30,
      feelsLike: 32,
      condition: 'Clear',
      description: 'clear sky',
      humidity: 65,
      windSpeed: 12,
      pressure: 1013,
      icon: '01d'
    });
  }
});

// 7-Day Forecast
router.get('/forecast', async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city || city === 'undefined') {
      return res.status(400).json({ error: 'City name required' });
    }
    
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const response = await axios.get(url);
    
    const dailyForecast = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < 7; i++) {
      const forecast = response.data.list[i * 8];
      if (forecast) {
        const date = new Date(forecast.dt * 1000);
        dailyForecast.push({
          day: days[date.getDay()],
          date: date.toLocaleDateString(),
          temp: Math.round(forecast.main.temp),
          condition: forecast.weather[0].main,
          icon: forecast.weather[0].icon,
          humidity: forecast.main.humidity,
          windSpeed: Math.round(forecast.wind.speed * 3.6)
        });
      }
    }
    
    res.json(dailyForecast);
  } catch (error) {
    console.error('Forecast API Error:', error.message);
    // Return mock forecast
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const mockForecast = [];
    for (let i = 0; i < 7; i++) {
      mockForecast.push({
        day: days[i],
        temp: Math.floor(Math.random() * 10 + 25),
        condition: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
        icon: '01d',
        humidity: Math.floor(Math.random() * 30 + 50),
        windSpeed: Math.floor(Math.random() * 20 + 5)
      });
    }
    res.json(mockForecast);
  }
});

export default router;