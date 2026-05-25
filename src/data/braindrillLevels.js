export const braindrillLevels = [
  {
    level: 1,
    gameType: 'quiz',

    questions: 10,
    time: 60,

    requiredCorrect: 5,

    points: 2,
  },

  {
    level: 2,
    gameType: 'quiz',

    questions: 20,
    time: 90,

    requiredCorrect: 12,

    points: 5,
  },

  {
    level: 3,
    gameType: 'match',

    questions: 5,
    time: 120,

    /* 5 boards × 5 pairs = 25 possible */

    requiredCorrect: 15,

    points: 1,
  },

  {
    level: 4,
    gameType: 'quiz',

    questions: 45,
    time: 180,

    requiredCorrect: 30,

    points: 15,
  },

  {
    level: 5,
    gameType: 'quiz',

    questions: 60,
    time: 220,

    requiredCorrect: 50,

    points: 30,
  },
]