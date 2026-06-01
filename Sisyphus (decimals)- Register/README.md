# Sisyphus: Math with a Slice of Pong

A browser-based math practice app for 5th and 6th grade students. Students register or sign in, choose a math topic, answer four questions to earn a two-minute pong break, and can play either **Normal Pong** or **Ghost Pong** (ball vanishes past midcourt).

---

## Features

- **Student registration & sign-in** — email + last name authentication, remember-me option, session timer
- **Two topic modes** — Algebra (one-step equations, evaluating expressions, writing expressions, ratio word problems) or Decimals (add, subtract, multiply, divide)
- **Adaptive quiz** — four randomized word problems per session; wrong answers show the correct answer, the problem type, and a specific Khan Academy link
- **Pong break** — earn two minutes of Pong by scoring ≥ 75 % on the quiz
- **Ghost Pong** — the ball randomly disappears when it crosses the midcourt line (x < 300)
- **Timer warnings** — yellow flashing at 30 s, red flashing at 15 s
- **Synthesized sound effects** — Web Audio API, no external files (quiz chimes, pong beeps, game-over tone)
- **Admin exports** — download student registry and weekly usage history as CSV (restricted to authorized account)

---

## Running the App

Open `index.html` in any modern browser. No build step or server required.

---

## Project Structure

```
index.html   — markup and layout
styles.css   — all visual styles and animations
script.js    — all application logic (see TODO #3 below)
```

---

## TODO

### 1 · Color theme for girls
The app now includes an alternate "feminine" color theme (soft purples, pinks, and warm golds) that students can opt into.

- **How to enable:** A `Purple Theme` toggle appears in the session banner after sign-in. The toggle switches between the default and the alternate theme.
- **Persistence:** The choice is saved to `localStorage` under the key `sisyphusTheme` (values: `feminine` or `default`).
- **Implementation notes:** The alternate theme applies the CSS class `theme-feminine` to the document root and overrides color variables. Primary colors used in `styles.css` include:
	- `--bg-grad-start: #8b5cf6` (soft purple)
	- `--bg-grad-mid: #5b2f8a` (deep lavender)
	- `--bg-grad-end: #22102a` (dark plum)
	- `--accent: #f7c873` (warm gold)
	- `--accent-2: #e79acb` (soft pink)

- **Accessibility / contrast:** Colors were chosen to preserve legibility against the UI panels. Please verify using a contrast checker (e.g., WebAIM Contrast Checker) for any additional customizations. Aim for WCAG AA contrast ratios for normal text; increase contrast or provide alternate accents if needed.

If you'd like, I can add an explicit setting in the user UI to select a theme at account-level or add automated contrast test notes in the repo.

### 2 · Multiplication and division of fractions module
Add two new question generators — `createFractionMultiplicationProblem()` and `createFractionDivisionProblem()` — following the same pattern as the existing decimal generators (five word-problem variations each, `khanLink`, `topicLabel`, validation). Expose them as a third topic option ("Fractions") in the topic picker alongside Algebra and Decimals. Grade-appropriate range: proper fractions with denominators 2–12, mixed-number results optional for 6th grade.

### 3 · Refactor `script.js` into ES modules
`script.js` is ~1 000 lines and growing. Break it into focused submodules using native ES modules (`type="module"` in `index.html`):

| Proposed file | Responsibility |
|---|---|
| `auth.js` | Registration, sign-in, session management, auto sign-in |
| `quiz.js` | Question generators, `generateQuestions`, `renderQuestions`, submit handler |
| `game.js` | Pong canvas, `drawGame`, `startGame`, `endGame`, paddle/ball physics |
| `sound.js` | Web Audio engine, all `snd*` functions |
| `export.js` | CSV export, usage log, scheduler design |
| `main.js` | DOM refs, event listeners, app bootstrap |

Each module should export only what other modules need, keeping internal helpers private.
