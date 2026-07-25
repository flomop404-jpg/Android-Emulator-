const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('../utils/logger');

const db = new sqlite3.Database(
  process.env.DATABASE_URL || path.join('/data', 'emulator.db'),
  (err) => {
    if (err) logger.error('Database connection failed:', err);
    else logger.info('Connected to SQLite database');
  }
);

const initSchema = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id TEXT UNIQUE,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        rom_path TEXT,
        partition TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        result TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS emulator_state (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        status TEXT DEFAULT 'offline',
        boot_time DATETIME,
        last_heartbeat DATETIME DEFAULT CURRENT_TIMESTAMP,
        device_info TEXT
      )
    `);

    logger.info('Database schema initialized');
  });
};

initSchema();

module.exports = db;