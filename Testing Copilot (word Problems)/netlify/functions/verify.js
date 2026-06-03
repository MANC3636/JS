const sqlite3 = require('sqlite3').verbose();
const { init, DB_PATH } = require('./_init_db');
const url = require('url');

init();

exports.handler = async function(event) {
  const q = url.parse(event.rawUrl || event.path + '?' + (event.queryStringParameters || ''), true).query;
  const token = q.token || (event.queryStringParameters && event.queryStringParameters.token);
  if (!token) return { statusCode: 400, body: 'Missing token' };
  const db = new sqlite3.Database(DB_PATH);
  try {
    const row = await new Promise((res, rej) => db.get('SELECT * FROM users WHERE verificationToken = ?', [token], (err, r) => err ? rej(err) : res(r)));
    if (!row) { db.close(); return { statusCode: 404, body: 'Token not found' }; }
    await new Promise((res, rej) => db.run('UPDATE users SET verified=1 WHERE id=?', [row.id], (err) => err ? rej(err) : res()));
    db.close();
    return { statusCode: 200, body: 'Verified' };
  } catch (e) {
    db.close();
    return { statusCode: 500, body: String(e) };
  }
};
