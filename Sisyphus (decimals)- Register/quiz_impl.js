// quiz_impl.js — question generator implementations
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function simplifyFraction(numerator, denominator) {
  const divisor = gcd(Math.abs(numerator), Math.abs(denominator));
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}

function formatFraction(numerator, denominator) {
  const { numerator: n, denominator: d } = simplifyFraction(numerator, denominator);
  return d === 1 ? String(n) : `${n}/${d}`;
}

function formatMixedNumber(numerator, denominator) {
  const { numerator: n, denominator: d } = simplifyFraction(numerator, denominator);
  if (Math.abs(n) <= d) return `${n}/${d}`;
  const whole = Math.trunc(n / d);
  const remainder = Math.abs(n % d);
  return remainder === 0 ? String(whole) : `${whole} ${remainder}/${d}`;
}

function parseFractionInput(input) {
  const cleaned = String(input).trim();
  if (!cleaned) return null;
  const mixedMatch = cleaned.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = Number(mixedMatch[1]);
    const numer = Number(mixedMatch[2]);
    const denom = Number(mixedMatch[3]);
    if (denom === 0) return null;
    const sign = whole < 0 ? -1 : 1;
    return simplifyFraction(sign * (Math.abs(whole) * denom + numer), denom);
  }
  const fractionMatch = cleaned.match(/^(-?\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numer = Number(fractionMatch[1]);
    const denom = Number(fractionMatch[2]);
    if (denom === 0) return null;
    return simplifyFraction(numer, denom);
  }
  const integerMatch = cleaned.match(/^(-?\d+)$/);
  if (integerMatch) {
    return { numerator: Number(integerMatch[1]), denominator: 1 };
  }
  return null;
}

function createFractionValidate(expectedNumerator, expectedDenominator) {
  return (value) => {
    const parsed = parseFractionInput(value);
    if (!parsed) return false;
    const simplifiedExpected = simplifyFraction(expectedNumerator, expectedDenominator);
    return parsed.numerator === simplifiedExpected.numerator && parsed.denominator === simplifiedExpected.denominator;
  };
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

  for (let i = 0; i < 10; i += 1) {
    const x = randomInt(5, 12);
    const b = randomInt(1, x - 1);

    const prompts = [
      `Jordan has x marbles. He gives ${b} marbles to a friend and has ${x - b} left. What was x?`,
      `A box contains x candy bars. After removing ${b}, there are ${x - b} left. What is x?`,
      `Sarah had x stickers. She used ${b} in a project and has ${x - b} remaining. What is x?`,
      `A store had x books. After selling ${b} books, ${x - b} remain on the shelf. What is x?`,
      `In a garden, x flowers were planted. ${b} flowers wilted, leaving ${x - b} healthy ones. What is x?`,
      `The class started with x pencils. After distributing ${b} pencils to students, ${x - b} remain. How many pencils were there originally?`,
      `A baker had x loaves. She sold ${b} loaves and had ${x - b} left to package. What was x?`,
      `There were x paintings in a gallery. ${b} were sold and ${x - b} remain. What number was x?`,
      `A teacher collected x permission slips. ${b} were missing, so ${x - b} were returned. What was x?`,
      `A truck delivered x boxes. ${b} boxes were unloaded and ${x - b} stayed on the truck. How many boxes were on the truck?`,
    ];

    variations.push({
      prompt: prompts[i],
      answer: x,
      validate: (value) => Number(value) === x,
      khanLink: khanLinks[i % khanLinks.length],
    });
  }

  return { ...variations[randomInt(0, variations.length - 1)], topicLabel: 'a one-step equation problem' };
}

export function createEvaluateExpression() {
  const variations = [];
  const khanLinks = [
    'https://www.khanacademy.org/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/cc-6th-order-of-operations/v/more-complicated-order-of-operations-example',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/x0267d782:more-on-order-of-operations/a/order-of-operations-review',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/x0267d782:more-on-order-of-operations/e/order_of_operations_2',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/cc-6th-order-of-operations/v/more-complicated-order-of-operations-example',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/x0267d782:cc-6th-exponents-and-order-of-operations/x0267d782:more-on-order-of-operations/a/order-of-operations-review',
  ];

  for (let i = 0; i < 10; i += 1) {
    const pointsPerGame = randomInt(2, 8);
    const bonus = randomInt(3, 10);
    const numGames = randomInt(3, 8);

    const scenarios = [
      { subject: 'Riley', activity: 'game', unit: 'points', action: 'earned a' },
      { subject: 'Marcus', activity: 'level', unit: 'coins', action: 'collected a' },
      { subject: 'Sofia', activity: 'race', unit: 'seconds', action: 'saved a' },
      { subject: 'Jordan', activity: 'task', unit: 'stars', action: 'got a' },
      { subject: 'Alex', activity: 'round', unit: 'tokens', action: 'won a' },
      { subject: 'Jamie', activity: 'match', unit: 'scores', action: 'scored' },
      { subject: 'Taylor', activity: 'session', unit: 'points', action: 'earned' },
      { subject: 'Casey', activity: 'quiz', unit: 'marks', action: 'received' },
      { subject: 'Drew', activity: 'trial', unit: 'units', action: 'gained' },
      { subject: 'Morgan', activity: 'round', unit: 'stars', action: 'collected' },
    ];

    const { subject, activity, unit, action } = scenarios[i];
    const result = pointsPerGame * numGames + bonus;

    variations.push({
      prompt: `${subject} scores ${pointsPerGame} ${unit} per ${activity} and ${action} ${bonus}-${unit} bonus this season. After ${numGames} ${activity}s, what is the total ${unit}?`,
      answer: result,
      validate: (value) => Number(value) === result,
      khanLink: khanLinks[i % khanLinks.length],
    });
  }

  return { ...variations[randomInt(0, variations.length - 1)], topicLabel: 'an evaluating expressions problem' };
}

export function createWriteExpressionWordProblem() {
  const variations = [];
  const khanLinks = [
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-alg-expression-word-problems/v/writing-basic-expressions-from-word-problems-examples',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-alg-expression-word-problems/e/writing-expressions-with-variables-word-problems',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-alg-expression-word-problems/a/writing-algebraic-expressions-in-word-problems',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-alg-expression-word-problems/v/writing-basic-expressions-from-word-problems-examples',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-expressions-and-variables/cc-6th-alg-expression-word-problems/e/writing-expressions-with-variables-word-problems',
  ];

  for (let i = 0; i < 10; i += 1) {
    const num = randomInt(2, 8);
    const value = randomInt(2, 10);

    const prompts = [
      `Write an expression: ${num} candies cost $${value} each. How much for all ${num}?`,
      `Write an expression: ${num} books cost $${value} each. Total cost?`,
      `Write an expression: Each of ${num} students gets $${value}. Total amount distributed?`,
      `Write an expression: ${num} pizzas cost $${value} each. What's the total?`,
      `Write an expression: ${num} tickets at $${value} each. Total expense?`,
      `Write an expression: ${num} chairs at $${value} each. How much will they cost together?`,
      `Write an expression: ${num} boxes with $${value} worth of supplies each. Total value?`,
      `Write an expression: ${num} bouquets at $${value} per bouquet. What is the full price?`,
      `Write an expression: ${num} markers cost $${value} apiece. What's the total cost?`,
      `Write an expression: ${num} plants cost $${value} each. How much to buy all of them?`,
    ];

    variations.push({
      prompt: prompts[i],
      answer: `${num}*${value}`,
      validate: (input) => {
        const cleaned = input.replace(/\s+/g, '');
        return cleaned === `${num}*${value}` || cleaned === `${value}*${num}`;
      },
      khanLink: khanLinks[i % khanLinks.length],
    });
  }

  return { ...variations[randomInt(0, variations.length - 1)], topicLabel: 'a writing expressions problem' };
}

export function createRatioProblemWordProblem() {
  const variations = [];
  const khanLinks = [
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-equivalent-ratios/e/ratio_word_problems',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-ratio-word-problems/v/ratio-word-problem-exercise-example-1',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-ratio-word-problems/e/part-part-whole-ratios',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-ratio-word-problems/v/ratio-word-problem-exercise-example-1',
    'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-equivalent-ratios/e/ratio_word_problems',
  ];

  for (let i = 0; i < 10; i += 1) {
    const a = randomInt(2, 5);
    const b = randomInt(2, 7);
    const scale = randomInt(2, 5);

    const prompts = [
      `The ratio of apples to oranges is ${a}:${b}. If there are ${b * scale} oranges, how many apples are there?`,
      `A recipe calls for ${a} cups of flour to ${b} cups of sugar. If you use ${b * scale} cups of sugar, how much flour?`,
      `In a class, the ratio of boys to girls is ${a}:${b}. If there are ${b * scale} girls, how many boys?`,
      `A map has a scale of ${a}:${b}. If a real distance is ${b * scale} miles, what is the map distance?`,
      `The ratio of cats to dogs in a shelter is ${a}:${b}. With ${b * scale} dogs, how many cats are there?`,
      `The juice recipe uses ${a} parts water to ${b} parts concentrate. If you have ${b * scale} parts concentrate, how much water is needed?`,
      `A model uses ${a}:${b} ratio for paint colors. If you mix ${b * scale} parts of the second color, how many parts of the first?`,
      `A team has players in ratio ${a}:${b}. If the second group has ${b * scale} players, how many are in the first group?`,
      `A classroom ratio of pens to pencils is ${a}:${b}. With ${b * scale} pencils, how many pens should there be?`,
      `A box contains items in ${a}:${b} ratio. If there are ${b * scale} of the second type, how many of the first type exist?`,
    ];

    variations.push({
      prompt: prompts[i],
      answer: a * scale,
      validate: (value) => Number(value) === a * scale,
      khanLink: khanLinks[i % khanLinks.length],
    });
  }

  return { ...variations[randomInt(0, variations.length - 1)], topicLabel: 'a ratio word problem' };
}

// Decimal generators
export function createDecimalAdditionProblem() {
  const variations = [];
  const khanLinks = [
    'https://www.khanacademy.org/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/imp-adding-decimals/v/introduction-to-adding-decimals-tenths',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/imp-adding-decimals/v/adding-decimals-with-ones-and-tenths-parts',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/imp-adding-decimals/e/adding-decimals-without-the-standard-algorithm-3',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/imp-adding-decimals/v/introduction-to-adding-decimals-tenths',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/imp-addition-and-subtraction-3/imp-adding-decimals/e/adding-decimals-without-the-standard-algorithm-3',
  ];

  for (let i = 0; i < 10; i += 1) {
    const a = randomInt(11, 89) / 10;
    const b = randomInt(11, 89) / 10;
    const answer = parseFloat((a + b).toFixed(1));

    const prompts = [
      `Maya jogged ${a} miles in the morning and ${b} miles after school. How many miles did she jog in all?`,
      `A bag weighs ${a} kg and another weighs ${b} kg. What is their combined weight?`,
      `One piece of wood is ${a} meters long and another is ${b} meters. What is the total length?`,
      `Carlos spent $${a} on lunch and $${b} on a snack. How much did he spend altogether?`,
      `A fish tank holds ${a} liters and a pitcher holds ${b} liters. How many liters of water is that in total?`,
      `A toy ship is ${a} meters long and a model car is ${b} meters. What is their combined length?`,
      `A plant grew ${a} cm in spring and ${b} cm in summer. How much did it grow total?`,
      `Two pipes have flows of ${a} and ${b} liters per minute. What's the combined flow?`,
      `A jogger ran ${a} km then another ${b} km later. How far in total?`,
      `A container holds ${a} L of oil and another ${b} L. What's the total volume?`,
    ];

    variations.push({
      prompt: prompts[i],
      answer,
      validate: (value) => Math.abs(Number(value) - answer) < 0.001,
      khanLink: khanLinks[i % khanLinks.length],
    });
  }

  return { ...variations[randomInt(0, variations.length - 1)], topicLabel: 'a decimal addition problem' };
}

export function createDecimalSubtractionProblem() {
  const variations = [];
  const khanLinks = [
    'https://www.khanacademy.org/math/cc-fifth-grade-math/subtract-decimals/imp-subtracting-decimals/v/strategies-for-subtracting-basic-decimals',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/subtract-decimals/imp-subtracting-decimals/v/strategies-for-subtracting-more-complex-decimals-with-tenths',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/subtract-decimals/imp-subtracting-decimals/e/subtracting-decimals-without-the-standard-algorithm-2',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/subtract-decimals/imp-subtracting-decimals/v/strategies-for-subtracting-basic-decimals',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/subtract-decimals/imp-subtracting-decimals/e/subtracting-decimals-without-the-standard-algorithm-2',
  ];

  for (let i = 0; i < 10; i += 1) {
    const b = randomInt(11, 59) / 10;
    const a = parseFloat((b + randomInt(11, 39) / 10).toFixed(1));
    const answer = parseFloat((a - b).toFixed(1));

    const prompts = [
      `Mia had $${a} and spent $${b}. How much money does she have left?`,
      `A rope was ${a} meters long. After cutting off ${b} meters, how much rope remains?`,
      `The temperature dropped from ${a}°F to ${b}°F. By how many degrees did it fall?`,
      `A bottle had ${a} liters of juice. After pouring out ${b} liters, how much is left?`,
      `A bag of rice weighed ${a} kg. After using ${b} kg in a recipe, what is the remaining weight?`,
      `A bookshelf was ${a} meters long. After removing ${b} meters of shelf, what's the remaining length?`,
      `An athlete had ${a} points and lost ${b} points. How many remain?`,
      `A parking lot had ${a} cars. After ${b} cars left, how many cars are left?`,
      `A jug contained ${a} liters of milk. After pouring ${b} liters, how much milk is left?`,
      `A project budget was $${a}. After spending $${b}, what's the remaining budget?`,
    ];

    variations.push({
      prompt: prompts[i],
      answer,
      validate: (value) => Math.abs(Number(value) - answer) < 0.001,
      khanLink: khanLinks[i % khanLinks.length],
    });
  }

  return { ...variations[randomInt(0, variations.length - 1)], topicLabel: 'a decimal subtraction problem' };
}

export function createDecimalMultiplicationProblem() {
  const variations = [];
  const khanLinks = [
    'https://www.khanacademy.org/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-and-whole-numbers/v/strategies-for-multiplying-decimals-and-whole-numbers',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-and-whole-numbers/e/multiply-whole-numbers-and-decimals',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-and-whole-numbers/v/multiplying-decimals-and-whole-numbers-with-visuals',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-and-whole-numbers/e/multiply-whole-numbers-and-decimals',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/imp-multiplication-and-division-3/multiplying-decimals-and-whole-numbers/v/strategies-for-multiplying-decimals-and-whole-numbers',
  ];

  for (let i = 0; i < 10; i += 1) {
    const factor = randomInt(12, 45) / 10;
    const multiplier = randomInt(2, 8);
    const answer = parseFloat((factor * multiplier).toFixed(1));

    const prompts = [
      `Each book costs $${factor}. What is the total cost of ${multiplier} books?`,
      `A car travels ${factor} miles per hour. How far does it travel in ${multiplier} hours?`,
      `Jordan earns $${factor} per hour. How much does he earn working ${multiplier} hours?`,
      `Each bag of apples weighs ${factor} pounds. What is the total weight of ${multiplier} bags?`,
      `A single tile is ${factor} meters wide. How wide are ${multiplier} tiles placed side by side?`,
      `A rope costs $${factor} per meter. What is the cost for ${multiplier} meters?`,
      `A printer prints ${factor} pages per minute. How many pages in ${multiplier} minutes?`,
      `A machine produces ${factor} units each hour. How many in ${multiplier} hours?`,
      `A slice weighs ${factor} kg. What's the weight of ${multiplier} slices together?`,
      `A bottle contains ${factor} liters. How many liters are in ${multiplier} bottles?`,
    ];

    variations.push({
      prompt: prompts[i],
      answer,
      validate: (value) => Math.abs(Number(value) - answer) < 0.01,
      khanLink: khanLinks[i % khanLinks.length],
    });
  }

  return { ...variations[randomInt(0, variations.length - 1)], topicLabel: 'a decimal multiplication problem' };
}

export function createDecimalDivisionProblem() {
  const variations = [];
  const khanLinks = [
    'https://www.khanacademy.org/math/cc-fifth-grade-math/divide-decimals/divide-whole-numbers-to-get-a-decimal-quotient/v/divide-whole-numbers-with-decimal-quotients',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/divide-decimals/imp-dividing-decimals/v/visually-dividing-decimal-by-whole-number',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/divide-decimals/imp-dividing-decimals/e/dividing-decimals-without-the-standard-algorithm-3',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/divide-decimals/divide-whole-numbers-to-get-a-decimal-quotient/v/divide-whole-numbers-with-decimal-quotients',
    'https://www.khanacademy.org/math/cc-fifth-grade-math/divide-decimals/imp-dividing-decimals/v/visually-dividing-decimal-by-whole-number',
  ];

  for (let i = 0; i < 10; i += 1) {
    const answer = randomInt(11, 39) / 10;
    const divisor = randomInt(2, 6);
    const dividend = parseFloat((answer * divisor).toFixed(1));

    const prompts = [
      `${divisor} friends share $${dividend} equally. How much does each person get?`,
      `A ribbon ${dividend} meters long is cut into ${divisor} equal pieces. How long is each piece?`,
      `A car used ${dividend} liters of gas over ${divisor} days. What was the average daily usage in liters?`,
      `${dividend} pounds of trail mix is divided equally into ${divisor} bags. How many pounds per bag?`,
      `A pipe ${dividend} meters long is cut into ${divisor} equal sections. How long is each section?`,
      `${dividend} cookies are shared among ${divisor} children. How many cookies per child?`,
      `A board ${dividend} m long is split into ${divisor} equal parts. What's the length of each part?`,
      `A runner covered ${dividend} km in ${divisor} days. What was the average per day?`,
      `A paint can holds ${dividend} L and is used over ${divisor} projects. How much paint per project?`,
      `A loaf weighs ${dividend} kg and is cut into ${divisor} equal slices. How heavy is each slice?`,
    ];

    variations.push({
      prompt: prompts[i],
      answer,
      validate: (value) => Math.abs(Number(value) - answer) < 0.01,
      khanLink: khanLinks[i % khanLinks.length],
    });
  }

  return { ...variations[randomInt(0, variations.length - 1)], topicLabel: 'a decimal division problem' };
}

export function createFractionMultiplicationProblem() {
  const variations = [];
  const khanLinks = [
    'https://www.khanacademy.org/math/arithmetic/fraction-arithmetic',
    'https://www.khanacademy.org/math/arithmetic/fraction-arithmetic/multiply-fractions/v/multiplying-fractions',
    'https://www.khanacademy.org/math/arithmetic/fraction-arithmetic/multiply-fractions/v/multiplying-fractions-two',
    'https://www.khanacademy.org/math/arithmetic/fraction-arithmetic/multiply-fractions/v/multiply-fractions-word-problems',
    'https://www.khanacademy.org/math/arithmetic/fraction-arithmetic/multiply-fractions/e/fraction-word-problems',
  ];

  for (let i = 0; i < 10; i += 1) {
    const denominatorA = randomInt(2, 12);
    const denominatorB = randomInt(2, 12);
    const numeratorA = randomInt(1, denominatorA - 1);
    const numeratorB = randomInt(1, denominatorB - 1);
    const answerNumerator = numeratorA * numeratorB;
    const answerDenominator = denominatorA * denominatorB;
    const answer = formatFraction(answerNumerator, answerDenominator);

    const prompts = [
      `A recipe uses ${numeratorA}/${denominatorA} cup of oil for one batch and Erin makes ${numeratorB}/${denominatorB} of a batch. How many cups of oil does she use?`,
      `A gardener plants ${numeratorA}/${denominatorA} of the flower bed in roses and then plants ${numeratorB}/${denominatorB} of that area in lilies. What fraction of the whole bed is planted in roses and lilies?`,
      `A fabric piece is ${numeratorA}/${denominatorA} yards wide. If the seamstress cuts ${numeratorB}/${denominatorB} of that width, how many yards does she cut?`,
      `Sofia reads ${numeratorA}/${denominatorA} of a book each day and reads for ${numeratorB}/${denominatorB} of a week. What fraction of the book does she read?`,
      `A ribbon is ${numeratorA}/${denominatorA} meter long. You use ${numeratorB}/${denominatorB} of that ribbon. What fraction of a meter did you use?`,
      `A baker uses ${numeratorA}/${denominatorA} of a bag of flour per batch and makes ${numeratorB}/${denominatorB} of a batch. How much flour is used?`,
      `A picture frame uses ${numeratorA}/${denominatorA} of a yard of trim. If you use ${numeratorB}/${denominatorB} of that trim, how many yards is that?`,
      `An athlete completed ${numeratorA}/${denominatorA} of a lap each interval and did ${numeratorB}/${denominatorB} of the training plan. What fraction of the lap did they complete?`,
      `A sheet is ${numeratorA}/${denominatorA} meters long. Cutting ${numeratorB}/${denominatorB} of it yields how many meters?`,
      `A student studies ${numeratorA}/${denominatorA} of the notes each day and studies ${numeratorB}/${denominatorB} of the week. What fraction of the notes are studied?`,
    ];

    variations.push({
      prompt: prompts[i],
      answer,
      validate: createFractionValidate(answerNumerator, answerDenominator),
      khanLink: khanLinks[i % khanLinks.length],
    });
  }

  return { ...variations[randomInt(0, variations.length - 1)], topicLabel: 'a fraction multiplication problem' };
}

export function createFractionDivisionProblem() {
  const variations = [];
  const khanLinks = [
    'https://www.khanacademy.org/math/arithmetic/fraction-arithmetic/dividing-fractions/v/dividing-fractions-1',
    'https://www.khanacademy.org/math/arithmetic/fraction-arithmetic/dividing-fractions/v/fraction-division-word-problems',
    'https://www.khanacademy.org/math/arithmetic/fraction-arithmetic/dividing-fractions/e/dividing-fractions-to-get-a-whole-number',
    'https://www.khanacademy.org/math/arithmetic/fraction-arithmetic/dividing-fractions/v/dividing-fractions-examples',
    'https://www.khanacademy.org/math/arithmetic/fraction-arithmetic/dividing-fractions/e/dividing-fractions-word-problems',
  ];

  for (let i = 0; i < 10; i += 1) {
    const denominatorA = randomInt(2, 12);
    const denominatorB = randomInt(2, 12);
    const numeratorA = randomInt(1, denominatorA - 1);
    const numeratorB = randomInt(1, denominatorB - 1);
    const answerNumerator = numeratorA * denominatorB;
    const answerDenominator = denominatorA * numeratorB;
    const answerValue = simplifyFraction(answerNumerator, answerDenominator);
    const answer = answerValue.denominator === 1 ? String(answerValue.numerator) : formatMixedNumber(answerNumerator, answerDenominator);

    const prompts = [
      `A chef has ${numeratorA}/${denominatorA} of a liter of sauce and uses ${numeratorB}/${denominatorB} of it for one dish. How many dishes can they make?`,
      `A ribbon measures ${numeratorA}/${denominatorA} meter and is cut into pieces ${numeratorB}/${denominatorB} meter long. How many pieces are there?`,
      `A student has ${numeratorA}/${denominatorA} of a pie. If each friend receives ${numeratorB}/${denominatorB} of a pie, how many friends can get a full piece?`,
      `A container holds ${numeratorA}/${denominatorA} gallon of paint. Each project uses ${numeratorB}/${denominatorB} gallon. How many projects can be painted?`,
      `A trail is ${numeratorA}/${denominatorA} mile long. Hikers walk ${numeratorB}/${denominatorB} mile each day. How many days until the trail is finished?`,
      `A jar contains ${numeratorA}/${denominatorA} kg of nuts. Each snack uses ${numeratorB}/${denominatorB} kg. How many snacks can be served?`,
      `A ribbon of ${numeratorA}/${denominatorA} m is cut into pieces of ${numeratorB}/${denominatorB} m. How many pieces result?`,
      `You have ${numeratorA}/${denominatorA} of a loaf and cut slices of ${numeratorB}/${denominatorB} each. How many slices do you get?`,
      `A recipe uses ${numeratorB}/${denominatorB} of a cup, and you have ${numeratorA}/${denominatorA} cups. How many servings can you make?`,
      `A classroom has ${numeratorA}/${denominatorA} of a sheet of paper. Each worksheet uses ${numeratorB}/${denominatorB} of a sheet. How many worksheets can be produced?`,
    ];

    variations.push({
      prompt: prompts[i],
      answer,
      validate: createFractionValidate(answerNumerator, answerDenominator),
      khanLink: khanLinks[i % khanLinks.length],
    });
  }

  return { ...variations[randomInt(0, variations.length - 1)], topicLabel: 'a fraction division problem' };
}
