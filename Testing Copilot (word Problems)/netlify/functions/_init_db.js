const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data.db');

function init() {
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      username TEXT UNIQUE,
      grade TEXT,
      verified INTEGER DEFAULT 0,
      verificationToken TEXT,
      createdAt INTEGER
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      userId TEXT,
      start INTEGER,
      end INTEGER
    )`);
  });
  db.close();
}

module.exports = { init, DB_PATH };
