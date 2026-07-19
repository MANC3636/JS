// referrals.js — Firestore-backed eligibility tracking and crediting.
// Kept Firestore-aware but DOM/game-agnostic so game.js never needs to import it.
import {
  doc, getDoc, updateDoc, increment, arrayUnion,
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';
import {
  REFERRAL_BONUS_MINUTES,
  getReferralIdFromUrl, capturePendingReferralFromUrl, consumePendingReferral, buildReferralLink,
  extractReferralCode, isEligibleForCredit, generateSessionId,
} from './referral_utils.js';

let heartbeatTimer = null;
let heartbeatListenersAttached = false;
let onVisibilityChange = null;
let onBeforeUnload = null;

export async function recordNewSessionIfNeeded(db, studentId, sessionId) {
  if (!db || !studentId || !sessionId) return;
  await updateDoc(doc(db, 'students', studentId), {
    distinctSessionCount: increment(1),
    lastSessionId: sessionId,
  });
}

export async function tryCreditReferral(db, referredStudentId) {
  if (!db || !referredStudentId) return;
  const referredRef = doc(db, 'students', referredStudentId);
  const referredSnap = await getDoc(referredRef);
  if (!referredSnap.exists()) return;
  const referred = referredSnap.data();

  if (!isEligibleForCredit(referred)) return;

  // Step 1: flip the referred student's own credited flag (rule re-derives eligibility).
  await updateDoc(referredRef, { referralCredited: true });

  // Step 2: credit the referrer, only after step 1 has committed.
  const referrerRef = doc(db, 'students', referred.referredBy);
  await updateDoc(referrerRef, {
    pendingBonusMinutes: increment(REFERRAL_BONUS_MINUTES),
    totalReferralBonusesEarned: increment(1),
    creditedReferralIds: arrayUnion(referredStudentId),
  });
}

export async function clearPendingBonus(db, studentId) {
  if (!db || !studentId) return;
  await updateDoc(doc(db, 'students', studentId), { pendingBonusMinutes: 0 });
}

export function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  if (heartbeatListenersAttached && typeof document !== 'undefined') {
    if (onVisibilityChange) document.removeEventListener('visibilitychange', onVisibilityChange);
    if (onBeforeUnload) window.removeEventListener('beforeunload', onBeforeUnload);
    heartbeatListenersAttached = false;
    onVisibilityChange = null;
    onBeforeUnload = null;
  }
}

// Only meaningful for a student who was themselves referred and not yet credited —
// non-referred / already-credited students generate zero extra Firestore writes.
export function startHeartbeat(db, student, sessionId, { intervalMs = 60000 } = {}) {
  stopHeartbeat();
  if (!db || !student || !student.id) return;
  if (!student.referredBy || student.referralCredited) return;

  const tick = async () => {
    try {
      await updateDoc(doc(db, 'students', student.id), { cumulativeUsageMinutes: increment(1) });
      await tryCreditReferral(db, student.id);
    } catch (e) {
      /* best-effort — a missed tick just delays eligibility, never breaks it */
    }
  };

  heartbeatTimer = setInterval(tick, intervalMs);

  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    onVisibilityChange = () => { if (document.visibilityState === 'hidden') tick(); };
    onBeforeUnload = () => { tick(); };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', onBeforeUnload);
    heartbeatListenersAttached = true;
  }
}

export {
  getReferralIdFromUrl, capturePendingReferralFromUrl, consumePendingReferral, buildReferralLink,
  extractReferralCode, isEligibleForCredit, generateSessionId,
};

export default {
  getReferralIdFromUrl, capturePendingReferralFromUrl, consumePendingReferral, buildReferralLink,
  extractReferralCode, isEligibleForCredit, generateSessionId, recordNewSessionIfNeeded, tryCreditReferral,
  clearPendingBonus, startHeartbeat, stopHeartbeat,
};
