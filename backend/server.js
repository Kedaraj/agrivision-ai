require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

require('./db'); // init DB

const app = express();
const PORT = process.env.PORT || 4000;
const isProd = process.env.NODE_ENV === 'production';

// In production, the frontend is served from the same domain — no CORS needed.
// In dev, allow Vite dev servers.
app.use(cors({
  origin: isProd ? true : ['http://localhost:5173','http://localhost:5174','http://localhost:5175'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve built React frontend in production
if (isProd) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
}


app.use('/api/auth',          require('./routes/auth'));
app.use('/api/scan',          require('./routes/scan'));
app.use('/api/chat',          require('./routes/chat'));
app.use('/api/farms',         require('./routes/farms'));
app.use('/api/weather',       require('./routes/weather'));
app.use('/api/analytics',     require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/market',        require('./routes/market'));

app.get('/api/health', (req, res) => {
  const hasGemini = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
  const hasWeather = process.env.OPENWEATHER_API_KEY && process.env.OPENWEATHER_API_KEY !== 'your_openweather_api_key_here';
  res.json({
    status: 'ok', service: 'AgriVision AI Backend', version: '1.0.0',
    gemini: hasGemini ? 'connected' : 'mock',
    weather: hasWeather ? 'connected' : 'mock',
    timestamp: new Date().toISOString(),
  });
});

// In production: serve React app for all non-API routes (React Router support)
if (isProd) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use((req, res) => res.status(404).json({ error: `Not found: ${req.method} ${req.path}` }));
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large (max 10MB)' });
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  const hasGemini = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
  const hasWeather = process.env.OPENWEATHER_API_KEY && process.env.OPENWEATHER_API_KEY !== 'your_openweather_api_key_here';
  console.log(`\n🚀 AgriVision AI Backend → http://localhost:${PORT}`);
  console.log(`📡 Health: http://localhost:${PORT}/api/health`);
  console.log(`🤖 Gemini API (gemini-2.5-flash): ${hasGemini ? '✅ Connected' : '⚠️  Mock mode'}`);
  console.log(`🌤️  Weather API: ${hasWeather ? '✅ Connected' : '⚠️  Mock mode (key activates in ~2h)'}`);
  console.log('');
});
