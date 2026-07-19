// export.js — Firestore storage helpers (no DOM operations)
import {
  collection, getDocs, addDoc, query, where, limit, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';
import { db } from './firebase.js';
import {
  getWeekLabel, buildCsvRow, getFlashMode,
  createStudentsCsvBlob, createUsageCsvBlob, createUsageReportCsvBlob, getWeeklyReportSchedulerDesign,
} from './csv_utils.js';

// Students and usage log now live in Firestore (not localStorage) so referral
// crediting can see activity that happened on a different student's device.
// These are per-document reads/writes, not read-all-mutate-write-all, to avoid
// clobbering concurrent writes from other students' browsers.
export async function getStoredStudents() {
  const snap = await getDocs(collection(db, 'students'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function findStudentByEmailQuery(email) {
  const q = query(collection(db, 'students'), where('email', '==', email), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const found = snap.docs[0];
  return { id: found.id, ...found.data() };
}

export async function addStudentDoc(studentData) {
  const docRef = await addDoc(collection(db, 'students'), {
    firstName: studentData.firstName,
    lastName: studentData.lastName,
    grade: studentData.grade,
    email: studentData.email,
    hasEpilepsy: Boolean(studentData.hasEpilepsy),
    referredBy: studentData.referredBy || null,
    referralCredited: false,
    cumulativeUsageMinutes: 0,
    distinctSessionCount: 0,
    lastSessionId: null,
    pendingBonusMinutes: 0,
    totalReferralBonusesEarned: 0,
    creditedReferralIds: [],
    createdAt: serverTimestamp(),
  });
  return {
    id: docRef.id,
    firstName: studentData.firstName,
    lastName: studentData.lastName,
    grade: studentData.grade,
    email: studentData.email,
    hasEpilepsy: Boolean(studentData.hasEpilepsy),
    referredBy: studentData.referredBy || null,
    referralCredited: false,
    cumulativeUsageMinutes: 0,
    distinctSessionCount: 0,
    lastSessionId: null,
    pendingBonusMinutes: 0,
    totalReferralBonusesEarned: 0,
    creditedReferralIds: [],
  };
}

export async function getUsageLog() {
  const snap = await getDocs(collection(db, 'usageLog'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addUsageLogEntry(entry) {
  await addDoc(collection(db, 'usageLog'), entry);
}

export {
  getWeekLabel, buildCsvRow, getFlashMode,
  createStudentsCsvBlob, createUsageCsvBlob, createUsageReportCsvBlob, getWeeklyReportSchedulerDesign,
};

export default {
  getStoredStudents, findStudentByEmailQuery, addStudentDoc, getUsageLog, addUsageLogEntry,
  getWeekLabel, buildCsvRow, getFlashMode,
  createStudentsCsvBlob, createUsageCsvBlob, createUsageReportCsvBlob, getWeeklyReportSchedulerDesign,
};
