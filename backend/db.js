const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'agrivision.db');
let _db = null;

async function getDb() {
  if (_db) return _db;
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    _db = new SQL.Database(fileBuffer);
  } else {
    _db = new SQL.Database();
  }
  _db._save = function () {
    const data = this.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  };
  _db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
      phone TEXT, password TEXT NOT NULL, location TEXT DEFAULT 'Punjab, India',
      total_acres REAL DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS farms (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, name TEXT NOT NULL, crop TEXT NOT NULL,
      area_acres REAL NOT NULL, health INTEGER DEFAULT 85, health_status TEXT DEFAULT 'Good',
      color_class TEXT DEFAULT 'from-green-100 to-emerald-50', created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, farm_id TEXT, disease_name TEXT NOT NULL,
      confidence REAL NOT NULL, severity TEXT NOT NULL, description TEXT, causes TEXT,
      fertilizers TEXT, pesticides TEXT, image_path TEXT, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, role TEXT NOT NULL,
      content TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL,
      type TEXT DEFAULT 'info', is_read INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  _db._save();
  console.log('✅ Database initialized at', DB_PATH);
  return _db;
}

function run(db, sql, params = []) { db.run(sql, params); db._save(); }
function get(db, sql, params = []) {
  const stmt = db.prepare(sql); stmt.bind(params);
  if (stmt.step()) { const r = stmt.getAsObject(); stmt.free(); return r; }
  stmt.free(); return null;
}
function all(db, sql, params = []) {
  const results = []; const stmt = db.prepare(sql); stmt.bind(params);
  while (stmt.step()) results.push(stmt.getAsObject());
  stmt.free(); return results;
}

module.exports = { getDb, run, get, all };
