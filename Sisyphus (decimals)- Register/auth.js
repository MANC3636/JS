// auth.js — authentication and storage helpers
import * as ex from './export.js';

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function getStoredStudents() {
  return ex.getStoredStudents();
}

export function saveStoredStudents(students) {
  return ex.saveStoredStudents(students);
}

export function findStudentByEmail(email) {
  const students = getStoredStudents();
  return students.find((s) => normalizeEmail(s.email) === normalizeEmail(email));
}

export function logStudentUsage(student, action, sessionStartTimestamp = null) {
  if (!student) return;
  const logs = ex.getUsageLog();
  const usageMinutes = sessionStartTimestamp
    ? Math.max(0, Math.round((Date.now() - sessionStartTimestamp) / 60000))
    : 0;

  logs.push({
    email: normalizeEmail(student.email),
    firstName: student.firstName,
    lastName: student.lastName,
    grade: student.grade,
    action,
    usageMinutes,
    weekOf: ex.getWeekLabel(new Date()),
  });
  ex.saveUsageLog(logs);
}

export default { normalizeEmail, getStoredStudents, saveStoredStudents, findStudentByEmail, logStudentUsage };
