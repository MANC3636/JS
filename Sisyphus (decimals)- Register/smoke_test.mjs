import {
  createFractionMultiplicationProblem,
  createFractionDivisionProblem,
  createDecimalAdditionProblem,
  createDecimalSubtractionProblem,
  createDecimalMultiplicationProblem,
  createDecimalDivisionProblem,
  createOneStepEquationWordProblem,
} from './quiz_impl.js';
import { getFlashMode } from './export.js';

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
})();
