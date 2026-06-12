const express = require('express');
const fetch = require('node-fetch');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function getMockWeather(city = 'Ludhiana') {
  const conditions = [
    { description: 'Partly Cloudy', temp: 28 }, { description: 'Clear Sky', temp: 32 },
    { description: 'Light Rain', temp: 24 }, { description: 'Mostly Sunny', temp: 30 },
  ];
  const w = conditions[new Date().getDay() % conditions.length];
  return { city, country: 'IN', temperature: w.temp, feels_like: w.temp - 2, humidity: 65, wind_speed: 12, cloud_cover: 20, description: w.description, source: 'mock' };
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { lat, lon, city = 'Ludhiana' } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey || apiKey === 'your_openweather_api_key_here') return res.json(getMockWeather(city));

    const url = lat && lon
      ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      : `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${apiKey}&units=metric`;

    const resp = await fetch(url);
    if (!resp.ok) {
      const err = await resp.json();
      console.warn('OpenWeather error:', err.message);
      return res.json(getMockWeather(city));
    }
    const d = await resp.json();
    console.log('🌤️ Live weather:', d.name, Math.round(d.main.temp) + '°C');
    res.json({
      city: d.name, country: d.sys.country, temperature: Math.round(d.main.temp),
      feels_like: Math.round(d.main.feels_like), humidity: d.main.humidity,
      wind_speed: Math.round(d.wind.speed * 3.6), cloud_cover: d.clouds.all,
      description: d.weather[0].description.replace(/\b\w/g, l => l.toUpperCase()),
      icon: d.weather[0].icon, source: 'live'
    });
  } catch (err) { console.error('Weather error:', err.message); res.json(getMockWeather()); }
});

module.exports = router;
