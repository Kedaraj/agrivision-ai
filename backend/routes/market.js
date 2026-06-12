const express = require('express');
const fetch = require('node-fetch');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Cache market data for 30 minutes
let cache = null;
let cacheTime = 0;
const CACHE_TTL = 30 * 60 * 1000;

function getSeason() {
  const m = new Date().getMonth() + 1;
  if (m >= 6 && m <= 9) return 'Kharif (Monsoon)';
  if (m >= 10 && m <= 11) return 'Post-Kharif';
  if (m >= 12 || m <= 3) return 'Rabi (Winter)';
  return 'Zaid (Summer)';
}

async function fetchMarketData() {
  const apiKey = process.env.GEMINI_API_KEY;
  const month = new Date().toLocaleString('en-IN', { month: 'long' });
  const year = new Date().getFullYear();
  const season = getSeason();

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return getFallbackData();
  }

  const prompt = `You are an Indian agricultural market expert. Generate a farming market report for ${month} ${year} (${season} season in India).

Return ONLY a valid JSON object with exactly this structure:
{
  "news": [
    {"id":1,"title":"headline","summary":"2-3 sentence summary","category":"Weather|Market|Technology|Government|Disease Alert|Export","time":"2 hours ago","important":true}
  ],
  "recommendations": [
    {"id":1,"crop":"name","reason":"1-2 sentence reason why ideal this season","profit_potential":"High","duration_days":75,"investment":"Low","water_need":"Medium","best_regions":["Punjab","Maharashtra"]}
  ],
  "prices": [
    {"id":1,"crop":"Tomato","price_per_kg":45,"trend":"up","change_percent":12.5,"market":"Delhi APMC","quality":"A Grade"}
  ],
  "market_summary":"2-3 sentence overall market outlook"
}

Generate 5 news, 5 crop recommendations best for ${season} season, and prices for these 15 crops: Tomato, Wheat, Rice, Onion, Potato, Cotton, Corn, Soybean, Chilli, Turmeric, Garlic, Brinjal, Cabbage, Cauliflower, Sugarcane.
Use realistic Indian mandi prices for ${month} ${year}. No markdown, just the JSON object.`;

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 3000 }
        }),
      }
    );
    if (!resp.ok) throw new Error(`Gemini API error: ${resp.status}`);
    const data = await resp.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Gemini response');
    const parsed = JSON.parse(jsonMatch[0]);
    parsed.generated_at = new Date().toISOString();
    parsed.season = season;
    parsed.month = month;
    console.log(`📰 Market data generated via Gemini for ${month} ${year}`);
    return parsed;
  } catch (err) {
    console.error('Market Gemini error:', err.message, '— using fallback');
    return getFallbackData();
  }
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const now = Date.now();
    if (cache && (now - cacheTime) < CACHE_TTL) {
      return res.json({ ...cache, cached: true });
    }
    const data = await fetchMarketData();
    cache = data;
    cacheTime = now;
    res.json(data);
  } catch (err) {
    console.error('Market route error:', err);
    res.json(getFallbackData());
  }
});

// Force refresh endpoint
router.post('/refresh', authMiddleware, async (req, res) => {
  cache = null; cacheTime = 0;
  const data = await fetchMarketData();
  cache = data; cacheTime = Date.now();
  res.json(data);
});

function getFallbackData() {
  const season = getSeason();
  const month = new Date().toLocaleString('en-IN', { month: 'long' });
  return {
    news: [
      { id: 1, title: 'Government Increases MSP for Kharif Crops by 8%', summary: 'The Cabinet Committee on Economic Affairs approved higher MSP for major crops, benefiting crores of farmers. This is one of the highest increases in recent years.', category: 'Government', time: '3 hours ago', important: true },
      { id: 2, title: 'Tomato Prices Surge 30% Across Major Markets', summary: 'Unseasonal rains damaged crops in key producing states. Prices in Delhi, Mumbai and Bengaluru wholesale markets have spiked sharply.', category: 'Market', time: '5 hours ago', important: true },
      { id: 3, title: 'New AI Drone for Pest Detection Launched', summary: 'A Pune-based startup launched affordable AI drones to detect crop pests early, reducing pesticide use by up to 40% in trial farms.', category: 'Technology', time: '1 day ago', important: false },
      { id: 4, title: 'IMD Forecasts Normal Monsoon This Year', summary: 'India Meteorological Department forecasts a normal to above-normal monsoon, boosting expectations for kharif crop production.', category: 'Weather', time: '6 hours ago', important: false },
      { id: 5, title: 'PM Kisan Installment Released to 9 Crore Farmers', summary: 'The government has released the latest PM-KISAN installment, transferring ₹2000 each to over 9 crore eligible farmer families across India.', category: 'Government', time: '2 days ago', important: false },
    ],
    recommendations: [
      { id: 1, crop: 'Tomato', reason: 'High demand and elevated prices make tomato very profitable this season. Short duration of 75 days ensures quick return.', profit_potential: 'High', duration_days: 75, investment: 'Medium', water_need: 'Medium', best_regions: ['Maharashtra', 'Karnataka', 'AP'] },
      { id: 2, crop: 'Onion', reason: 'Strong export demand from SE Asia. Prices expected to remain firm through harvest due to lower-than-usual arrivals.', profit_potential: 'High', duration_days: 90, investment: 'Medium', water_need: 'Low', best_regions: ['Maharashtra', 'Madhya Pradesh', 'Gujarat'] },
      { id: 3, crop: 'Wheat', reason: `${season} is ideal for wheat. Government MSP has been increased, ensuring a guaranteed floor price for farmers.`, profit_potential: 'Medium', duration_days: 120, investment: 'Low', water_need: 'Medium', best_regions: ['Punjab', 'Haryana', 'UP'] },
      { id: 4, crop: 'Chilli', reason: 'Export market is booming with record demand from Europe and Gulf countries. High value crop with strong domestic consumption.', profit_potential: 'High', duration_days: 140, investment: 'Medium', water_need: 'Low', best_regions: ['Andhra Pradesh', 'Telangana', 'Karnataka'] },
      { id: 5, crop: 'Soybean', reason: 'Global edible oil prices are rising, pushing soybean demand. Low input cost makes it ideal for new farmers.', profit_potential: 'Medium', duration_days: 100, investment: 'Low', water_need: 'Low', best_regions: ['MP', 'Maharashtra', 'Rajasthan'] },
    ],
    prices: [
      { id: 1, crop: 'Tomato', price_per_kg: 45, trend: 'up', change_percent: 30.0, market: 'Delhi APMC', quality: 'A Grade' },
      { id: 2, crop: 'Wheat', price_per_kg: 22, trend: 'stable', change_percent: 0.5, market: 'Ludhiana Mandi', quality: 'A Grade' },
      { id: 3, crop: 'Rice', price_per_kg: 35, trend: 'up', change_percent: 3.2, market: 'Karnal Mandi', quality: 'Premium' },
      { id: 4, crop: 'Onion', price_per_kg: 28, trend: 'up', change_percent: 12.0, market: 'Nashik APMC', quality: 'A Grade' },
      { id: 5, crop: 'Potato', price_per_kg: 18, trend: 'down', change_percent: -5.3, market: 'Agra Mandi', quality: 'A Grade' },
      { id: 6, crop: 'Cotton', price_per_kg: 68, trend: 'stable', change_percent: 1.1, market: 'Rajkot APMC', quality: 'Premium' },
      { id: 7, crop: 'Corn', price_per_kg: 19, trend: 'up', change_percent: 4.5, market: 'Gulbarga Mandi', quality: 'B Grade' },
      { id: 8, crop: 'Soybean', price_per_kg: 42, trend: 'up', change_percent: 6.2, market: 'Indore APMC', quality: 'A Grade' },
      { id: 9, crop: 'Chilli', price_per_kg: 120, trend: 'up', change_percent: 8.7, market: 'Guntur APMC', quality: 'Premium' },
      { id: 10, crop: 'Turmeric', price_per_kg: 85, trend: 'stable', change_percent: -0.5, market: 'Nizamabad APMC', quality: 'A Grade' },
      { id: 11, crop: 'Garlic', price_per_kg: 55, trend: 'down', change_percent: -8.2, market: 'MP Mandi', quality: 'A Grade' },
      { id: 12, crop: 'Brinjal', price_per_kg: 22, trend: 'stable', change_percent: 0.8, market: 'Chennai APMC', quality: 'A Grade' },
      { id: 13, crop: 'Cabbage', price_per_kg: 12, trend: 'down', change_percent: -3.1, market: 'Bengaluru APMC', quality: 'B Grade' },
      { id: 14, crop: 'Cauliflower', price_per_kg: 20, trend: 'up', change_percent: 5.4, market: 'Delhi APMC', quality: 'A Grade' },
      { id: 15, crop: 'Sugarcane', price_per_kg: 4, trend: 'stable', change_percent: 0, market: 'UP Mandi', quality: 'A Grade' },
    ],
    market_summary: `Overall market conditions are favorable for ${season} season. Vegetable prices are elevated due to supply disruptions. Spice and oilseed prices remain strong on export demand.`,
    generated_at: new Date().toISOString(),
    season,
    month,
  };
}

module.exports = router;
