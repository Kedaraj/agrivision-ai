const express = require('express');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const { getDb, run, all } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const FARMING_RESPONSES = [
  'Based on current weather and your crop type, apply NPK 20-20-20 fertilizer within 3 days for optimal absorption. Water thoroughly after application.',
  'For disease prevention, ensure proper plant spacing for air circulation. Use copper-based fungicides preventively during humid seasons.',
  'Test your soil pH — most crops thrive between 6.0–7.0. Add lime to raise pH or sulfur to lower it for optimal nutrient uptake.',
  'Water crops early in the morning to reduce evaporation and prevent fungal diseases. Drip irrigation is most efficient for water conservation.',
  'Start with biological controls like neem oil before chemical pesticides. This preserves beneficial insects and maintains soil health long-term.',
  'For best harvest, observe crop color, texture, and firmness. Harvest in early morning when temperatures are cool for longer shelf life.',
  'Rotate crops each season — avoid planting the same family in the same field. This breaks pest cycles and naturally replenishes soil nutrients.',
  'Apply nitrogen-rich Urea (46-0-0) 2–3 weeks before flowering to boost vegetative growth and maximize your yield.',
];

async function chatWithGemini(userMessage, history) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return FARMING_RESPONSES[Math.floor(Math.random() * FARMING_RESPONSES.length)];
  }
  try {
    const systemInstruction = `You are AgriVision AI — an expert agricultural assistant. Answer farming questions about crop diseases, fertilizers, pesticides, weather, soil, and irrigation. Be concise (2-4 sentences), practical, and farmer-friendly.`;
    const contents = history.slice(-8).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));
    contents.push({ role: 'user', parts: [{ text: userMessage }] });

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
        }),
      }
    );
    if (!resp.ok) {
      console.warn('Gemini chat error:', resp.status);
      return FARMING_RESPONSES[Math.floor(Math.random() * FARMING_RESPONSES.length)];
    }
    const data = await resp.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('🤖 Gemini chat reply:', reply?.slice(0, 80));
    return reply || FARMING_RESPONSES[0];
  } catch (err) {
    console.error('Gemini chat error:', err.message);
    return FARMING_RESPONSES[Math.floor(Math.random() * FARMING_RESPONSES.length)];
  }
}

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });
    const db = await getDb();
    const history = all(db,
      'SELECT role,content FROM chat_messages WHERE user_id=? ORDER BY created_at DESC LIMIT 16',
      [req.user.id]
    ).reverse();
    run(db, 'INSERT INTO chat_messages (id,user_id,role,content) VALUES (?,?,?,?)',
      [uuidv4(), req.user.id, 'user', message.trim()]);
    const aiResponse = await chatWithGemini(message.trim(), history);
    run(db, 'INSERT INTO chat_messages (id,user_id,role,content) VALUES (?,?,?,?)',
      [uuidv4(), req.user.id, 'assistant', aiResponse]);
    res.json({ reply: aiResponse });
  } catch (err) { console.error('Chat error:', err); res.status(500).json({ error: 'Failed to get AI response' }); }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    res.json(all(db,
      'SELECT id,role,content,created_at FROM chat_messages WHERE user_id=? ORDER BY created_at ASC LIMIT 50',
      [req.user.id]
    ));
  } catch (err) { res.status(500).json({ error: 'Failed to fetch history' }); }
});

module.exports = router;
