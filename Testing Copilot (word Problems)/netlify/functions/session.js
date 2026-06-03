const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const { init, DB_PATH } = require('./_init_db');

init();

exports.handler = async function(event) {
  // POST expected with { action: 'start'|'stop'|'heartbeat', userId, sessionId? }
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const body = JSON.parse(event.body || '{}');
  const { action, userId, sessionId } = body;
  if (!action || !userId) return { statusCode: 400, body: 'Missing fields' };
  const db = new sqlite3.Database(DB_PATH);
  try {
    if (action === 'start') {
      const id = uuidv4();
      const now = Date.now();
      await new Promise((res, rej) => db.run('INSERT INTO sessions (id,userId,start,end) VALUES (?,?,?,?)', [id,userId,now,null], (err) => err ? rej(err) : res()));
      db.close();
      return { statusCode: 200, body: JSON.stringify({ sessionId: id, start: now }) };
    } else if (action === 'stop') {
      const now = Date.now();
      if (!sessionId) { db.close(); return { statusCode: 400, body: 'Missing sessionId' }; }
      await new Promise((res, rej) => db.run('UPDATE sessions SET end = ? WHERE id = ?', [now, sessionId], (err) => err ? rej(err) : res()));
      db.close();
      return { statusCode: 200, body: JSON.stringify({ sessionId, end: now }) };
    } else if (action === 'heartbeat') {
      // extend the end of the latest open session for this user
      const now = Date.now();
      const row = await new Promise((res, rej) => db.get('SELECT * FROM sessions WHERE userId = ? AND end IS NULL ORDER BY start DESC LIMIT 1', [userId], (err, r) => err ? rej(err) : res(r)));
      if (row) {
        await new Promise((res, rej) => db.run('UPDATE sessions SET end = ? WHERE id = ?', [now, row.id], (err) => err ? rej(err) : res()));
        db.close();
        return { statusCode: 200, body: JSON.stringify({ sessionId: row.id, end: now }) };
      }
      // no open session, create one
      const id = uuidv4();
      await new Promise((res, rej) => db.run('INSERT INTO sessions (id,userId,start,end) VALUES (?,?,?,?)', [id,userId,now,now], (err) => err ? rej(err) : res()));
      db.close();
      return { statusCode: 200, body: JSON.stringify({ sessionId: id, start: now, end: now }) };
    }
    db.close();
    return { statusCode: 400, body: 'Unknown action' };
  } catch (e) {
    db.close();
    return { statusCode: 500, body: String(e) };
  }
};
