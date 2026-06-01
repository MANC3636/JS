// quiz.js — question generators and helpers
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function createOneStepEquationWordProblem() {
  const variations = [];
  const khanLinks = [
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-one-step-add-sub-equations/e/one_step_equations',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-one-step-add-sub-equations/v/adding-and-subtracting-the-same-thing-from-both-sides',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-one-step-add-sub-equations/a/solving-one-step-addition-and-subtraction-equations',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-one-step-add-sub-equations/e/one_step_equations',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-equations-and-inequalities/cc-6th-one-step-add-sub-equations/v/adding-and-subtracting-the-same-thing-from-both-sides',
  ];

  for (let i = 0; i < 5; i += 1) {
    const x = randomInt(5, 12);
    const b = randomInt(1, x - 1);

    const prompts = [
      `Jordan has x marbles. He gives ${b} marbles to a friend and has ${x - b} left. What was x?`,
      `A box contains x candy bars. After removing ${b}, there are ${x - b} left. What is x?`,
      `Sarah had x stickers. She used ${b} in a project and has ${x - b} remaining. What is x?`,
      `A store had x books. After selling ${b} books, ${x - b} remain on the shelf. What is x?`,
      `In a garden, x flowers were planted. ${b} flowers wilted, leaving ${x - b} healthy ones. What is x?`,
    ];

    variations.push({
      prompt: prompts[i],
      answer: x,
      validate: (value) => Number(value) === x,
      khanLink: khanLinks[i],
    });
  }

  return { ...variations[randomInt(0, 4)], topicLabel: 'a one-step equation problem' };
}

/* Other generators (evaluate, write expression, ratio, decimals) follow same pattern */
import {
  createEvaluateExpression as _createEvaluateExpression,
  createWriteExpressionWordProblem as _createWriteExpressionWordProblem,
  createRatioProblemWordProblem as _createRatioProblemWordProblem,
  createDecimalAdditionProblem as _createDecimalAdditionProblem,
  createDecimalSubtractionProblem as _createDecimalSubtractionProblem,
  createDecimalMultiplicationProblem as _createDecimalMultiplicationProblem,
  createDecimalDivisionProblem as _createDecimalDivisionProblem,
  createFractionMultiplicationProblem as _createFractionMultiplicationProblem,
  createFractionDivisionProblem as _createFractionDivisionProblem,
} from './quiz_impl.js';

export const createEvaluateExpression = _createEvaluateExpression;
export const createWriteExpressionWordProblem = _createWriteExpressionWordProblem;
export const createRatioProblemWordProblem = _createRatioProblemWordProblem;
export const createDecimalAdditionProblem = _createDecimalAdditionProblem;
export const createDecimalSubtractionProblem = _createDecimalSubtractionProblem;
export const createDecimalMultiplicationProblem = _createDecimalMultiplicationProblem;
export const createDecimalDivisionProblem = _createDecimalDivisionProblem;
export const createFractionMultiplicationProblem = _createFractionMultiplicationProblem;
export const createFractionDivisionProblem = _createFractionDivisionProblem;

export function generateQuestions(topic) {
  let questions = [];
  if (topic === 'decimals') {
    questions = [
      createDecimalAdditionProblem(),
      createDecimalSubtractionProblem(),
      createDecimalMultiplicationProblem(),
      createDecimalDivisionProblem(),
    ];
  } else if (topic === 'fractions') {
    questions = [
      createFractionMultiplicationProblem(),
      createFractionDivisionProblem(),
      createFractionMultiplicationProblem(),
      createFractionDivisionProblem(),
    ];
  } else {
    questions = [
      createOneStepEquationWordProblem(),
      createEvaluateExpression(),
      createWriteExpressionWordProblem(),
      createRatioProblemWordProblem(),
    ];
  }
  shuffleArray(questions);
  return questions;
}

export default { randomInt, shuffleArray, generateQuestions };
