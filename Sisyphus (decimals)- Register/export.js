// export.js — storage helpers and CSV export utilities (no DOM operations)
export function getStoredStudents() {
  const raw = localStorage.getItem('sisyphusStudents');
  return raw ? JSON.parse(raw) : [];
}

export function saveStoredStudents(students) {
  localStorage.setItem('sisyphusStudents', JSON.stringify(students));
}

export function getUsageLog() {
  const raw = localStorage.getItem('sisyphusUsageLog');
  return raw ? JSON.parse(raw) : [];
}

export function saveUsageLog(logs) {
  localStorage.setItem('sisyphusUsageLog', JSON.stringify(logs));
}

export function getWeekLabel(date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString().slice(0, 10);
}

export function buildCsvRow(row) {
  return row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',');
}

export function createStudentsCsvBlob(students) {
  const header = ['First Name', 'Last Name', 'Grade', 'Email'];
  const rows = [header, ...students.map((student) => [student.firstName, student.lastName, student.grade, student.email])];
  const csvContent = rows.map(buildCsvRow).join('\r\n');
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}

export function createUsageCsvBlob(logs) {
  const header = ['Week Of', 'Usage Minutes', 'First Name', 'Last Name', 'Grade', 'Email', 'Action'];
  const rows = [header, ...logs.map((entry) => [entry.weekOf, entry.usageMinutes, entry.firstName, entry.lastName, entry.grade, entry.email, entry.action])];
  const csvContent = rows.map(buildCsvRow).join('\r\n');
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}

export function getWeeklyReportSchedulerDesign() {
  return {
    name: 'Weekly Student Registry Report',
    schedule: {
      frequency: 'weekly',
      dayOfWeek: 'Monday',
      time: '09:00',
      timezone: 'local',
    },
    export: {
      format: 'csv',
      filename: 'student_registry.csv',
      fields: ['First Name', 'Last Name', 'Grade', 'Email'],
    },
    delivery: {
      method: 'email',
      recipient: 'ttyson@blackstudentfund.org',
      subject: 'Weekly Student Registry Report',
    },
    notes: [
      'Requires a backend or server-side scheduler.',
      'The scheduler should read the stored student registry, generate the CSV, and email it weekly.',
      'If email delivery is not available, the scheduler can upload the report to secure cloud storage and notify the recipient.',
    ],
  };
}

export default {
  getStoredStudents, saveStoredStudents, getUsageLog, saveUsageLog, getWeekLabel, buildCsvRow,
  createStudentsCsvBlob, createUsageCsvBlob, getWeeklyReportSchedulerDesign,
};
