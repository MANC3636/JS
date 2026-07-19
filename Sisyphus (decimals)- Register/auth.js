// auth.js — authentication and storage helpers
import * as ex from './export.js';

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export async function getStoredStudents() {
  return ex.getStoredStudents();
}

export async function findStudentByEmail(email) {
  return ex.findStudentByEmailQuery(normalizeEmail(email));
}

export async function registerStudent(studentData) {
  return ex.addStudentDoc({ ...studentData, email: normalizeEmail(studentData.email) });
}

export async function logStudentUsage(student, action, sessionStartTimestamp = null) {
  if (!student) return;
  const now = new Date();
  const usageMinutes = sessionStartTimestamp
    ? Math.max(0, Math.round((Date.now() - sessionStartTimestamp) / 60000))
    : 0;
  const dayOf = now.toISOString().slice(0, 10);
  const monthOf = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  await ex.addUsageLogEntry({
    email: normalizeEmail(student.email),
    firstName: student.firstName,
    lastName: student.lastName,
    grade: student.grade,
    action,
    usageMinutes,
    timestamp: now.toISOString(),
    dayOf,
    weekOf: ex.getWeekLabel(now),
    monthOf,
  });
}

export default {
  normalizeEmail, getStoredStudents, findStudentByEmail, registerStudent, logStudentUsage,
};
