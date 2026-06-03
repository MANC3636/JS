const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { init, DB_PATH } = require('./_init_db');
const nodemailer = require('nodemailer');

init();

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const body = JSON.parse(event.body || '{}');
  const { email, username, grade } = body;
  if (!email || !username) return { statusCode: 400, body: 'Missing fields' };

  const db = new sqlite3.Database(DB_PATH);
  const token = uuidv4();
  const now = Date.now();

  const findUser = () => new Promise((res, rej) => db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], (err, row) => err ? rej(err) : res(row)));
  const insertUser = (id) => new Promise((res, rej) => db.run('INSERT INTO users (id,email,username,grade,verificationToken,createdAt) VALUES (?,?,?,?,?,?)', [id,email,username,grade,token,now], function(err){ if(err) rej(err); else res({id}); }));

  try {
    const existing = await findUser();
    if (existing) {
      db.close();
      return { statusCode: 200, body: JSON.stringify({ id: existing.id, created: false, verified: !!existing.verified }) };
    }
    const id = uuidv4();
    await insertUser(id);

    // optionally send verification email if SMTP env configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT||587), secure: false, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
        const verifyUrl = `${process.env.SITE_URL || ''}/.netlify/functions/verify?token=${token}`;
        await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: email, subject: 'Verify your account', text: `Click to verify: ${verifyUrl}` });
      } catch (e) {
        // ignore email errors for now
      }
    }

    db.close();
    return { statusCode: 200, body: JSON.stringify({ id, created: true, verified: false }) };
  } catch (err) {
    db.close();
    return { statusCode: 500, body: String(err) };
  }
};
