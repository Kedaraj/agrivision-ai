const express = require('express');
const { getDb, get, all } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const userId = req.user.id;
    const totalScans = Number(get(db, 'SELECT COUNT(*) as count FROM scans WHERE user_id=?', [userId])?.count || 0);
    const diseaseScans = Number(get(db, "SELECT COUNT(*) as count FROM scans WHERE user_id=? AND disease_name != 'Healthy Crop'", [userId])?.count || 0);
    const farms = all(db, 'SELECT * FROM farms WHERE user_id=?', [userId]);
    const avgHealth = farms.length ? Math.round(farms.reduce((s, f) => s + Number(f.health || 0), 0) / farms.length) : 88;
    const totalAcres = farms.reduce((s, f) => s + Number(f.area_acres || 0), 0);
    const diseaseHistory = all(db,
      "SELECT disease_name as name, COUNT(*) as cases FROM scans WHERE user_id=? AND disease_name != 'Healthy Crop' GROUP BY disease_name ORDER BY cases DESC LIMIT 5",
      [userId]
    );
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const n = Math.max(new Date().getMonth() + 1, 6);
    const growthData = months.slice(0, n).map((month, i) => ({ month, value: Math.max(60, Math.min(99, avgHealth - 12 + i * 2)) }));
    const base = Math.max(totalAcres * 500, 5000);
    const revenueData = months.slice(0, n).map((month, i) => ({ month, value: Math.round(base * (0.55 + i * 0.08)) }));
    const cols = [['bg-red-100','text-red-600'],['bg-orange-100','text-orange-600'],['bg-yellow-100','text-yellow-600'],['bg-purple-100','text-purple-600'],['bg-blue-100','text-blue-600']];
    res.json({
      summary: { total_scans: totalScans, disease_detected: diseaseScans, healthy_crops: totalScans - diseaseScans,
        avg_health: avgHealth, active_fields: farms.length, total_acres: parseFloat(totalAcres.toFixed(1)),
        yield_estimate: `${Math.round(totalAcres * 5.8)}T`, revenue_estimate: `$${(base / 1000).toFixed(1)}K` },
      growth_data: growthData, revenue_data: revenueData,
      disease_history: diseaseHistory.length > 0
        ? diseaseHistory.map((d, i) => ({ id: i+1, name: d.name, cases: Number(d.cases), bgColor: cols[i]?.[0] || 'bg-gray-100', textColor: cols[i]?.[1] || 'text-gray-600' }))
        : [{ id: 1, name: 'No diseases yet — great job! 🌿', cases: 0, bgColor: 'bg-green-100', textColor: 'text-green-600' }],
    });
  } catch (err) { console.error('Analytics error:', err); res.status(500).json({ error: 'Failed to fetch analytics' }); }
});

module.exports = router;
