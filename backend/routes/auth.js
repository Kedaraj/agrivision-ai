const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb, run, get, all } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const db = await getDb();
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (get(db, 'SELECT id FROM users WHERE email=?', [email])) return res.status(409).json({ error: 'Email already registered' });

    const userId = uuidv4();
    run(db, 'INSERT INTO users (id,name,email,phone,password) VALUES (?,?,?,?,?)',
      [userId, name, email, phone || null, await bcrypt.hash(password, 10)]);

    const seeds = [
      ['Field A - Tomatoes', 'Tomato', 5.2, 85, 'Good', 'from-red-100 to-orange-50'],
      ['Field B - Wheat', 'Wheat', 6.3, 78, 'Fair', 'from-yellow-100 to-orange-50'],
    ];
    for (const [n, c, a, h, s, col] of seeds)
      run(db, 'INSERT INTO farms (id,user_id,name,crop,area_acres,health,health_status,color_class) VALUES (?,?,?,?,?,?,?,?)',
        [uuidv4(), userId, n, c, a, h, s, col]);

    run(db, 'INSERT INTO notifications (id,user_id,title,message,type) VALUES (?,?,?,?,?)',
      [uuidv4(), userId, 'Welcome to AgriVision AI! 🌱', 'Your smart farming journey starts now. Scan a leaf to detect diseases instantly.', 'info']);

    const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const user = get(db, 'SELECT id,name,email,phone,location,total_acres,created_at FROM users WHERE id=?', [userId]);
    res.status(201).json({ token, user });
  } catch (err) { console.error('Signup error:', err); res.status(500).json({ error: 'Server error' }); }
});

router.post('/login', async (req, res) => {
  try {
    const db = await getDb();
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = get(db, 'SELECT * FROM users WHERE email=?', [email]);
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password: _pw, ...safe } = user;
    res.json({ token, user: safe });
  } catch (err) { console.error('Login error:', err); res.status(500).json({ error: 'Server error' }); }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const user = get(db, 'SELECT id,name,email,phone,location,total_acres,created_at FROM users WHERE id=?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const farmCount = get(db, 'SELECT COUNT(*) as count FROM farms WHERE user_id=?', [req.user.id]);
    const scanCount = get(db, 'SELECT COUNT(*) as count FROM scans WHERE user_id=?', [req.user.id]);
    const totalAcres = get(db, 'SELECT COALESCE(SUM(area_acres),0) as total FROM farms WHERE user_id=?', [req.user.id]);
    res.json({ ...user, farm_count: farmCount?.count || 0, scan_count: scanCount?.count || 0, total_acres: parseFloat(totalAcres?.total || 0) });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const { name, phone, location } = req.body;
    run(db, 'UPDATE users SET name=?,phone=?,location=? WHERE id=?', [name, phone, location, req.user.id]);
    res.json(get(db, 'SELECT id,name,email,phone,location,total_acres FROM users WHERE id=?', [req.user.id]));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
