const sqlite3 = require('sqlite3').verbose();
const { init, DB_PATH } = require('./_init_db');
const ExcelJS = require('exceljs');
const url = require('url');

init();

function startOfDay(ts) { const d = new Date(ts); d.setHours(0,0,0,0); return d.getTime(); }

exports.handler = async function(event) {
  const q = event.queryStringParameters || {};
  const range = q.range || 'total';
  const userId = q.userId || null;
  const format = q.format || 'csv';
  const db = new sqlite3.Database(DB_PATH);

  const sessions = await new Promise((res, rej) => db.all('SELECT * FROM sessions', [], (err, rows) => err ? rej(err) : res(rows)));
  const users = await new Promise((res, rej) => db.all('SELECT * FROM users', [], (err, rows) => err ? rej(err) : res(rows)));
  db.close();

  const now = Date.now();
  let rangeStart = 0;
  if (range === 'day') rangeStart = startOfDay(now);
  if (range === 'week') { const d = new Date(now); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); d.setDate(diff); d.setHours(0,0,0,0); rangeStart = d.getTime(); }
  if (range === 'month') { const d = new Date(now); d.setDate(1); d.setHours(0,0,0,0); rangeStart = d.getTime(); }
  if (range === 'last7') rangeStart = startOfDay(now - 6 * 24 * 60 * 60 * 1000);

  const filteredUsers = users.filter(u => !userId || u.id === userId);

  function overlap(sStart, sEnd, a, b) {
    const x = Math.max(sStart, a);
    const y = Math.min(sEnd || now, b);
    return Math.max(0, y - x);
  }

  if (format === 'xlsx') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Analytics');
    if (range === 'last7') {
      const headers = ['Username','Email','Grade'];
      for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); headers.push(d.toISOString().slice(0,10)); }
      headers.push('Total (min)');
      sheet.addRow(headers);
      filteredUsers.forEach(u => {
        const row = [u.username, u.email, u.grade];
        let total = 0;
        for (let i = 6; i >= 0; i--) {
          const dayStart = startOfDay(now - i * 24 * 60 * 60 * 1000);
          const dayEnd = dayStart + 24*60*60*1000 -1;
          const ms = sessions.filter(s => s.userId === u.id).reduce((acc,s) => acc + overlap(s.start, s.end, dayStart, dayEnd),0);
          row.push(Math.round(ms/60000*100)/100);
          total += ms;
        }
        row.push(Math.round(total/60000*100)/100);
        sheet.addRow(row);
      });
    } else {
      sheet.addRow(['Username','Email','Grade','Minutes']);
      filteredUsers.forEach(u => {
        const totalMs = sessions.filter(s => s.userId === u.id).reduce((acc,s) => acc + overlap(s.start, s.end, rangeStart, now), 0);
        sheet.addRow([u.username, u.email, u.grade, Math.round(totalMs/60000*100)/100]);
      });
    }
    const buffer = await workbook.xlsx.writeBuffer();
    return { statusCode: 200, headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="analytics_${range}.xlsx"` }, body: buffer.toString('base64'), isBase64Encoded: true };
  }

  // Default CSV
  const lines = [];
  if (range === 'last7') {
    const header = ['Username','Email','Grade'];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); header.push(d.toISOString().slice(0,10)); }
    header.push('Total (min)');
    lines.push(header.join(','));
    filteredUsers.forEach(u => {
      const row = [u.username, u.email, u.grade];
      let total = 0;
      for (let i = 6; i >= 0; i--) {
        const dayStart = startOfDay(now - i * 24 * 60 * 60 * 1000);
        const dayEnd = dayStart + 24*60*60*1000 -1;
        const ms = sessions.filter(s => s.userId === u.id).reduce((acc,s) => acc + overlap(s.start, s.end, dayStart, dayEnd),0);
        row.push(Math.round(ms/60000*100)/100);
        total += ms;
      }
      row.push(Math.round(total/60000*100)/100);
      lines.push(row.join(','));
    });
  } else {
    lines.push(['Username','Email','Grade','Minutes'].join(','));
    filteredUsers.forEach(u => {
      const totalMs = sessions.filter(s => s.userId === u.id).reduce((acc,s) => acc + overlap(s.start, s.end, rangeStart, now), 0);
      lines.push([u.username, u.email, u.grade, Math.round(totalMs/60000*100)/100].join(','));
    });
  }

  return { statusCode: 200, headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="analytics_${range}.csv"` }, body: lines.join('\n') };
};
