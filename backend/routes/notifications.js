const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb, run, get, all } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const notifications = all(db, 'SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 30', [req.user.id]);
    const unread = get(db, 'SELECT COUNT(*) as count FROM notifications WHERE user_id=? AND is_read=0', [req.user.id]);
    res.json({ notifications, unread_count: Number(unread?.count || 0) });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch notifications' }); }
});

router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    run(db, 'UPDATE notifications SET is_read=1 WHERE user_id=?', [req.user.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    run(db, 'UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    run(db, 'DELETE FROM notifications WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
