const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb, run, get, all } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const COLORS = ['from-red-100 to-orange-50','from-green-100 to-emerald-50','from-yellow-100 to-orange-50','from-blue-100 to-cyan-50','from-purple-100 to-pink-50'];

function getStatus(h) { return h >= 90 ? 'Excellent' : h >= 75 ? 'Good' : h >= 60 ? 'Fair' : 'Poor'; }

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const farms = all(db, 'SELECT * FROM farms WHERE user_id=?', [req.user.id]);
    const totalAcres = farms.reduce((s, f) => s + Number(f.area_acres || 0), 0);
    const avgHealth = farms.length ? Math.round(farms.reduce((s, f) => s + Number(f.health || 0), 0) / farms.length) : 0;
    res.json({ total_farms: farms.length, total_acres: parseFloat(totalAcres.toFixed(1)), active_crops: farms.length, avg_health: avgHealth, health_status: getStatus(avgHealth) });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch stats' }); }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    res.json(all(db, 'SELECT * FROM farms WHERE user_id=? ORDER BY created_at ASC', [req.user.id]));
  } catch (err) { res.status(500).json({ error: 'Failed to fetch farms' }); }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, crop, area_acres, health = 80 } = req.body;
    if (!name || !crop || !area_acres) return res.status(400).json({ error: 'Name, crop, and area required' });
    const db = await getDb();
    const id = uuidv4();
    const h = parseInt(health);
    run(db, 'INSERT INTO farms (id,user_id,name,crop,area_acres,health,health_status,color_class) VALUES (?,?,?,?,?,?,?,?)',
      [id, req.user.id, name, crop, parseFloat(area_acres), h, getStatus(h), COLORS[Math.floor(Math.random() * COLORS.length)]]);
    res.status(201).json(get(db, 'SELECT * FROM farms WHERE id=?', [id]));
  } catch (err) { res.status(500).json({ error: 'Failed to create farm' }); }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const farm = get(db, 'SELECT * FROM farms WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!farm) return res.status(404).json({ error: 'Farm not found' });
    const { name, crop, area_acres, health } = req.body;
    const h = health !== undefined ? parseInt(health) : Number(farm.health);
    run(db, 'UPDATE farms SET name=?,crop=?,area_acres=?,health=?,health_status=? WHERE id=? AND user_id=?',
      [name || farm.name, crop || farm.crop, area_acres !== undefined ? parseFloat(area_acres) : Number(farm.area_acres), h, getStatus(h), req.params.id, req.user.id]);
    res.json(get(db, 'SELECT * FROM farms WHERE id=?', [req.params.id]));
  } catch (err) { res.status(500).json({ error: 'Failed to update farm' }); }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    if (!get(db, 'SELECT id FROM farms WHERE id=? AND user_id=?', [req.params.id, req.user.id])) return res.status(404).json({ error: 'Farm not found' });
    run(db, 'DELETE FROM farms WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed to delete farm' }); }
});

module.exports = router;
