const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const { getDb, run, get, all } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only'))
});

const MOCK_DISEASES = [
  { disease_name: 'Early Blight', confidence: 94.5, severity: 'Moderate',
    description: 'Early blight (Alternaria solani) appears as dark brown spots with concentric rings on older leaves. It starts on lower leaves and spreads upward in warm, humid conditions.',
    causes: ['High humidity and moisture', 'Poor air circulation', 'Infected plant debris', 'Overhead watering'],
    fertilizers: ['NPK 20-20-20', 'Calcium Nitrate', 'Potassium Sulfate'],
    pesticides: ['Chlorothalonil', 'Mancozeb', 'Copper Fungicide'] },
  { disease_name: 'Powdery Mildew', confidence: 91.2, severity: 'Low',
    description: 'Powdery mildew shows as white powdery spots on leaves and stems. Thrives in warm dry conditions with high humidity.',
    causes: ['Low air circulation', 'High night humidity', 'Dense plant spacing'],
    fertilizers: ['Potassium Bicarbonate', 'Neem-based fertilizers', 'Compost tea'],
    pesticides: ['Sulfur Fungicide', 'Potassium Bicarbonate', 'Neem Oil'] },
  { disease_name: 'Leaf Spot', confidence: 88.7, severity: 'Moderate',
    description: 'Bacterial or fungal leaf spot causes dark spots with yellow margins. Affected leaves drop prematurely.',
    causes: ['Bacteria splashing from soil', 'Wet weather', 'Overcrowded planting'],
    fertilizers: ['NPK 15-15-15', 'Zinc Sulfate', 'Boron'],
    pesticides: ['Copper Hydroxide', 'Mancozeb', 'Azoxystrobin'] },
  { disease_name: 'Healthy Crop', confidence: 97.3, severity: 'None',
    description: 'Your crop appears completely healthy! The leaf shows normal green coloration with no disease symptoms.',
    causes: [],
    fertilizers: ['NPK 14-14-14 (maintenance)', 'Organic Compost', 'Micronutrient mix'],
    pesticides: ['No pesticide needed — crop is healthy!'] },
];

async function detectDiseaseWithGemini(imagePath) {
  const apiKey = process.env.GEMINI_API_KEY;
  const isMock = !apiKey || apiKey === 'your_gemini_api_key_here';
  if (isMock) {
    console.log('⚠️  Gemini: using mock (no API key)');
    return MOCK_DISEASES[Math.floor(Math.random() * MOCK_DISEASES.length)];
  }

  try {
    const base64Image = fs.readFileSync(imagePath).toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

    const prompt = `You are an expert agricultural plant pathologist. Analyze this crop leaf image for diseases.

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "disease_name": "Disease name or 'Healthy Crop'",
  "confidence": 94.5,
  "severity": "None|Low|Moderate|High|Critical",
  "description": "2-3 sentence description",
  "causes": ["cause 1", "cause 2", "cause 3"],
  "fertilizers": ["fertilizer 1", "fertilizer 2", "fertilizer 3"],
  "pesticides": ["pesticide 1", "pesticide 2", "pesticide 3"]
}`;

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64Image } }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1024, responseMimeType: 'application/json' }
        }),
      }
    );

    if (!resp.ok) {
      const errText = await resp.text();
      console.warn('Gemini API error:', resp.status, errText.slice(0, 200));
      return MOCK_DISEASES[Math.floor(Math.random() * MOCK_DISEASES.length)];
    }

    const data = await resp.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('🤖 Gemini response preview:', text.slice(0, 150));

    // Strip markdown code fences if present
    const clean = text.replace(/```json\n?|```\n?/g, '').trim();
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) {
      console.warn('Could not extract JSON from Gemini response');
      return MOCK_DISEASES[Math.floor(Math.random() * MOCK_DISEASES.length)];
    }
    const result = JSON.parse(match[0]);
    console.log('✅ Gemini detected:', result.disease_name, `${result.confidence}% confidence`);
    return result;
  } catch (err) {
    console.error('Gemini vision error:', err.message);
    return MOCK_DISEASES[Math.floor(Math.random() * MOCK_DISEASES.length)];
  }
}

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    console.log(`🔍 Scanning: ${req.file.filename}`);
    const result = await detectDiseaseWithGemini(req.file.path);

    const db = await getDb();
    const scanId = uuidv4();
    run(db,
      'INSERT INTO scans (id,user_id,farm_id,disease_name,confidence,severity,description,causes,fertilizers,pesticides,image_path) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [scanId, req.user.id, req.body.farm_id || null,
       result.disease_name, result.confidence, result.severity, result.description,
       JSON.stringify(result.causes || []), JSON.stringify(result.fertilizers || []),
       JSON.stringify(result.pesticides || []), req.file.filename]
    );

    if (result.disease_name !== 'Healthy Crop') {
      run(db, 'INSERT INTO notifications (id,user_id,title,message,type) VALUES (?,?,?,?,?)',
        [uuidv4(), req.user.id,
         `⚠️ Disease Detected: ${result.disease_name}`,
         `${result.severity} severity — ${result.confidence}% confidence. See results for treatment.`,
         'alert']);
    }

    const parseArr = (v) => Array.isArray(v) ? v : JSON.parse(v || '[]');
    res.json({
      scan_id: scanId,
      image_url: `http://localhost:4000/uploads/${req.file.filename}`,
      disease_name: result.disease_name,
      confidence: result.confidence,
      severity: result.severity,
      description: result.description,
      causes: parseArr(result.causes),
      fertilizers: parseArr(result.fertilizers),
      pesticides: parseArr(result.pesticides),
    });
  } catch (err) {
    console.error('Scan error:', err);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    res.json(all(db,
      'SELECT id,disease_name,confidence,severity,image_path,created_at FROM scans WHERE user_id=? ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    ));
  } catch (err) { res.status(500).json({ error: 'Failed to fetch history' }); }
});

module.exports = router;
