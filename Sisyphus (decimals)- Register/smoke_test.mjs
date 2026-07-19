import {
  createFractionMultiplicationProblem,
  createFractionDivisionProblem,
  createDecimalAdditionProblem,
  createDecimalSubtractionProblem,
  createDecimalMultiplicationProblem,
  createDecimalDivisionProblem,
  createOneStepEquationWordProblem,
} from './quiz_impl.js';
import { getFlashMode } from './csv_utils.js';
import {
  getReferralIdFromUrl, capturePendingReferralFromUrl, consumePendingReferral,
  buildReferralLink, extractReferralCode, isEligibleForCredit,
} from './referral_utils.js';
import { computeSessionDuration } from './game.js';

// Minimal in-memory localStorage mock so referral_utils' localStorage-backed
// helpers are testable in plain Node (no DOM). Follows the same
// typeof-x-!== 'undefined' defensive style already used in csv_utils.js.
function installLocalStorageMock() {
  if (typeof globalThis.localStorage !== 'undefined') return;
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  };
}

function runTest(name, gen, iterations = 50) {
  const errors = [];
  for (let i = 0; i < iterations; i += 1) {
    const q = gen();
    if (!q) {
      errors.push(`no object returned at iteration ${i}`);
      continue;
    }
    if (!q.prompt || String(q.prompt).toLowerCase().includes('undefined')) {
      errors.push(`prompt undefined/bad at iteration ${i}: ${String(q.prompt)}`);
    }
    if (typeof q.answer === 'undefined' || q.answer === null) {
      errors.push(`answer undefined at iteration ${i}: ${String(q.answer)}`);
    }
  }
  console.log(`Test ${name}: ${errors.length} errors`);
  if (errors.length) console.log(errors.slice(0, 10).join('\n'));
}

(async () => {
  runTest('fraction multiply', createFractionMultiplicationProblem);
  runTest('fraction divide', createFractionDivisionProblem);
  runTest('decimal add', createDecimalAdditionProblem);
  runTest('decimal sub', createDecimalSubtractionProblem);
  runTest('decimal mul', createDecimalMultiplicationProblem);
  runTest('decimal div', createDecimalDivisionProblem);
  runTest('one-step eq', createOneStepEquationWordProblem);

  const epilepsyStudent = { hasEpilepsy: true };
  const normalStudent = { hasEpilepsy: false };
  const flashModeDisabled = getFlashMode(epilepsyStudent, 'flash');
  const flashModeEnabled = getFlashMode(normalStudent, 'flash');
  const solidMode = getFlashMode(normalStudent, 'solid');
  const failures = [];
  if (flashModeDisabled !== 'solid') failures.push(`epilepsy student should use solid mode, got ${flashModeDisabled}`);
  if (flashModeEnabled !== 'flash') failures.push(`non-epilepsy student should allow flash mode, got ${flashModeEnabled}`);
  if (solidMode !== 'solid') failures.push(`solid preference should stay solid, got ${solidMode}`);
  console.log(`Flash mode tests: ${failures.length} failures`);
  if (failures.length) console.log(failures.join('\n'));

  // --- Referral eligibility boundary matrix ---
  const eligibilityFailures = [];
  const eligibilityCases = [
    { input: { referredBy: 'ref1', referralCredited: false, cumulativeUsageMinutes: 30, distinctSessionCount: 2 }, expected: true, label: 'exactly 30 min / 2 sessions' },
    { input: { referredBy: 'ref1', referralCredited: false, cumulativeUsageMinutes: 29, distinctSessionCount: 2 }, expected: false, label: '29 min / 2 sessions' },
    { input: { referredBy: 'ref1', referralCredited: false, cumulativeUsageMinutes: 31, distinctSessionCount: 1 }, expected: false, label: '31 min / 1 session' },
    { input: { referredBy: 'ref1', referralCredited: true, cumulativeUsageMinutes: 40, distinctSessionCount: 3 }, expected: false, label: 'already credited' },
    { input: { referredBy: null, referralCredited: false, cumulativeUsageMinutes: 40, distinctSessionCount: 3 }, expected: false, label: 'no referredBy' },
    { input: {}, expected: false, label: 'empty input' },
  ];
  eligibilityCases.forEach(({ input, expected, label }) => {
    const result = isEligibleForCredit(input);
    if (result !== expected) eligibilityFailures.push(`${label}: expected ${expected}, got ${result}`);
  });
  console.log(`Referral eligibility tests: ${eligibilityFailures.length} failures`);
  if (eligibilityFailures.length) console.log(eligibilityFailures.join('\n'));

  // --- Referral link build/parse round trip ---
  const linkFailures = [];
  const parsedRef = getReferralIdFromUrl('?ref=abc123');
  if (parsedRef !== 'abc123') linkFailures.push(`getReferralIdFromUrl with ?ref=abc123 returned ${String(parsedRef)}`);
  const parsedNoRef = getReferralIdFromUrl('');
  if (parsedNoRef !== null) linkFailures.push(`getReferralIdFromUrl with no query returned ${String(parsedNoRef)}, expected null`);
  const parsedOtherParams = getReferralIdFromUrl('?foo=bar&ref=xyz789&baz=1');
  if (parsedOtherParams !== 'xyz789') linkFailures.push(`getReferralIdFromUrl with mixed params returned ${String(parsedOtherParams)}`);
  console.log(`Referral link parsing tests: ${linkFailures.length} failures`);
  if (linkFailures.length) console.log(linkFailures.join('\n'));

  // --- Pending-referral capture/consume round trip (in-memory localStorage mock) ---
  installLocalStorageMock();
  const pendingFailures = [];
  globalThis.window = { location: { search: '?ref=friend42', origin: 'https://example.test', pathname: '/' } };
  const capturedRef = capturePendingReferralFromUrl();
  if (capturedRef !== 'friend42') pendingFailures.push(`capturePendingReferralFromUrl returned ${String(capturedRef)}, expected friend42`);
  const consumed = consumePendingReferral();
  if (consumed !== 'friend42') pendingFailures.push(`consumePendingReferral returned ${String(consumed)}, expected friend42`);
  const consumedAgain = consumePendingReferral();
  if (consumedAgain !== null) pendingFailures.push(`consumePendingReferral should return null once already consumed, got ${String(consumedAgain)}`);
  const link = buildReferralLink('student123');
  if (link !== 'https://example.test/?ref=student123') pendingFailures.push(`buildReferralLink returned unexpected format: ${link}`);
  console.log(`Pending referral capture/consume tests: ${pendingFailures.length} failures`);
  if (pendingFailures.length) console.log(pendingFailures.join('\n'));

  // --- Fallback manual referral code extraction (paste a full link, a bare
  // query string, or just the bare code) ---
  const extractFailures = [];
  const extractCases = [
    { input: 'https://sisyphus-midjuly.web.app/?ref=AbC123XyZ', expected: 'AbC123XyZ', label: 'full pasted link' },
    { input: 'https://sisyphus-midjuly.web.app/?foo=bar&ref=AbC123XyZ&baz=1', expected: 'AbC123XyZ', label: 'full link with extra params' },
    { input: '?ref=AbC123XyZ', expected: 'AbC123XyZ', label: 'bare query string' },
    { input: 'ref=AbC123XyZ', expected: 'AbC123XyZ', label: 'bare key=value, no leading ?' },
    { input: 'AbC123XyZ', expected: 'AbC123XyZ', label: 'bare code, no ref= at all' },
    { input: '  AbC123XyZ  ', expected: 'AbC123XyZ', label: 'bare code with surrounding whitespace' },
    { input: '', expected: null, label: 'empty string' },
    { input: null, expected: null, label: 'null input' },
  ];
  extractCases.forEach(({ input, expected, label }) => {
    const result = extractReferralCode(input);
    if (result !== expected) extractFailures.push(`${label}: expected ${String(expected)}, got ${String(result)}`);
  });
  console.log(`Referral code extraction tests: ${extractFailures.length} failures`);
  if (extractFailures.length) console.log(extractFailures.join('\n'));

  // --- Bonus session duration math ---
  const durationFailures = [];
  if (computeSessionDuration(120, 0) !== 120) durationFailures.push('120 base + 0 bonus should stay 120');
  if (computeSessionDuration(120, 5) !== 420) durationFailures.push(`120 base + 5 bonus minutes should be 420, got ${computeSessionDuration(120, 5)}`);
  if (computeSessionDuration(120, undefined) !== 120) durationFailures.push('undefined bonus should be treated as 0');
  console.log(`Bonus session duration tests: ${durationFailures.length} failures`);
  if (durationFailures.length) console.log(durationFailures.join('\n'));
})();
