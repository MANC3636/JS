// referral_utils.js — pure helpers with zero imports (no Firestore, no DOM
// required beyond optional window/localStorage feature checks). Kept separate
// from referrals.js so smoke_test.mjs (plain Node, no bundler) can import
// these without pulling in referrals.js's Firestore CDN imports, which Node
// can't resolve without special flags.
const PENDING_REFERRAL_KEY = 'sisyphusPendingReferral';
export const REFERRAL_BONUS_MINUTES = 5;
export const ELIGIBLE_MINUTES = 30;
export const ELIGIBLE_SESSIONS = 2;

export function getReferralIdFromUrl(search = (typeof window !== 'undefined' ? window.location.search : '')) {
  const params = new URLSearchParams(search || '');
  const ref = params.get('ref');
  return ref ? ref.trim() : null;
}

// Returns the captured ref (or null) so callers can react to a successful
// capture — e.g. showing a "you were referred by a friend!" banner.
export function capturePendingReferralFromUrl() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
  const ref = getReferralIdFromUrl(window.location.search);
  if (ref) localStorage.setItem(PENDING_REFERRAL_KEY, ref);
  return ref;
}

export function consumePendingReferral() {
  if (typeof localStorage === 'undefined') return null;
  const ref = localStorage.getItem(PENDING_REFERRAL_KEY);
  localStorage.removeItem(PENDING_REFERRAL_KEY);
  return ref || null;
}

export function buildReferralLink(studentId) {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(studentId)}`;
}

// Fallback path for when the ?ref= link didn't carry over (different device,
// code shared verbally, etc.) — a student can paste either the full referral
// link or just the bare code/id into a manual text field.
export function extractReferralCode(input) {
  if (!input) return null;
  const trimmed = String(input).trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const fromUrl = url.searchParams.get('ref');
    if (fromUrl) return fromUrl.trim();
  } catch (e) {
    // not a parseable full URL — fall through to bare query / bare code handling
  }

  const refIndex = trimmed.indexOf('ref=');
  if (refIndex !== -1) {
    const afterRef = trimmed.slice(refIndex + 4);
    const ampIndex = afterRef.indexOf('&');
    const value = ampIndex === -1 ? afterRef : afterRef.slice(0, ampIndex);
    if (value) return decodeURIComponent(value).trim();
  }

  return trimmed;
}

export function isEligibleForCredit({
  referredBy, referralCredited, cumulativeUsageMinutes, distinctSessionCount,
} = {}) {
  return Boolean(referredBy)
    && !referralCredited
    && Number(cumulativeUsageMinutes) >= ELIGIBLE_MINUTES
    && Number(distinctSessionCount) >= ELIGIBLE_SESSIONS;
}

export function generateSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default {
  REFERRAL_BONUS_MINUTES,
  ELIGIBLE_MINUTES,
  ELIGIBLE_SESSIONS,
  getReferralIdFromUrl,
  capturePendingReferralFromUrl,
  consumePendingReferral,
  buildReferralLink,
  extractReferralCode,
  isEligibleForCredit,
  generateSessionId,
};
