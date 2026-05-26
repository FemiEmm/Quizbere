<!-- src/pages/BraindrillPlayPage.vue -->

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import BottomNavbar from '../components/BottomNavbar.vue'

import BrainQuiz from '../braindrill/BrainQuiz.vue'

import BrainMatch from '../braindrill/BrainMatch.vue'

import BrainTrueFalse from '../braindrill/BrainTrueFalse.vue'

import {
  braindrillLevels,
} from '../data/braindrillLevels'

import {
  playSound,
} from '../utils/playSound'

const router = useRouter()

/* -----------------------------
   LEVEL DATA
----------------------------- */

const levelData = JSON.parse(
  localStorage.getItem(
    'braindrill_selected_level',
  ),
)

if (!levelData) {
  router.push(
    '/braindrill',
  )
}

const currentLevel =
  braindrillLevels.find(
    (level) =>
      level.level ===
      levelData.level,
  )

if (!currentLevel) {
  router.push(
    '/braindrill',
  )
}

/* -----------------------------
   GAME TYPE
----------------------------- */

const gameType =
  currentLevel.gameType

/* -----------------------------
   DIFFICULTY MAP
----------------------------- */

const difficultyMap = {
  1: ['easy'],

  2: ['easy', 'mid'],

  3: ['easy', 'mid'],

  4: ['easy', 'mid'],

  5: ['easy'],

  6: ['easy'],

  7: ['easy'],

  8: ['easy','mid'],

  9: ['easy','mid'],

  10: ['extreme'],
}

const difficulties =
  difficultyMap[
    currentLevel.level
  ] || ['easy']

/* -----------------------------
   IMPORT MODULES
----------------------------- */

const allModules =
  import.meta.glob(
    '../data/**/*.js',
    {
      eager: true,
    },
  )

/* -----------------------------
   FILTER MODULES
----------------------------- */

let filteredModules = []

/* QUIZ */

if (
  gameType ===
  'quiz'
) {
  filteredModules =
    Object.entries(
      allModules,
    ).filter(
      ([path]) =>
        difficulties.some(
          (
            difficulty,
          ) =>
            path.includes(
              `/data/${difficulty}/`,
            ),
        ),
    )
}

/* MATCH */

if (
  gameType ===
  'match'
) {
  filteredModules =
    Object.entries(
      allModules,
    ).filter(
      ([path]) =>
        difficulties.some(
          (
            difficulty,
          ) =>
            path.includes(
              `/data/match/${difficulty}/`,
            ),
        ),
    )
}

/* TRUE FALSE */

if (
  gameType ===
  'truefalse'
) {
  filteredModules =
    Object.entries(
      allModules,
    ).filter(
      ([path]) =>
        difficulties.some(
          (
            difficulty,
          ) =>
            path.includes(
              `/data/othergames/trueorfalse/${difficulty}/`,
            ),
        ),
    )
}

/* -----------------------------
   QUESTIONS
----------------------------- */

const allQuestions =
  filteredModules.flatMap(
    ([, module]) => {
      if (
        module.default
      ) {
        return module.default
      }

      return Object.values(
        module,
      ).flat()
    },
  )

const shuffledQuestions =
  [...allQuestions]
    .sort(
      () =>
        Math.random() -
        0.5,
    )
    .slice(
      0,
      Math.min(
        currentLevel.questions,
        allQuestions.length,
      ),
    )

if (
  shuffledQuestions.length ===
  0
) {
  router.push(
    '/braindrill',
  )
}

/* -----------------------------
   STATE
----------------------------- */

const currentQuestionIndex =
  ref(0)

const currentQuestion =
  computed(() => {
    return (
      shuffledQuestions[
        currentQuestionIndex
          .value
      ] || null
    )
  })

/* -----------------------------
   PERFORMANCE
----------------------------- */

const correctAnswers =
  ref(0)

const timeLeft = ref(
  currentLevel.time,
)

/* -----------------------------
   REWARD SCORE
----------------------------- */

const runScore = ref(
  Number(
    localStorage.getItem(
      'braindrill_run_score',
    ),
  ) || 0,
)

/* -----------------------------
   TIMER
----------------------------- */

let timer = null

const startTimer =
  () => {
    timer =
      setInterval(() => {
        if (
          timeLeft.value >
          0
        ) {
          timeLeft.value--
        } else {
          endGame()
        }
      }, 1000)
  }

/* -----------------------------
   EVENTS
----------------------------- */

const handleSuccess =
  () => {
    correctAnswers.value++

    playSound(
      'correct',
    )
  }

const handleFail =
  () => {
    playSound(
      'wrong',
    )
  }

const handleComplete =
  () => {
    setTimeout(() => {
      nextQuestion()
    }, 600)
  }

/* -----------------------------
   NEXT QUESTION
----------------------------- */

const nextQuestion =
  () => {
    if (
      currentQuestionIndex.value <
      shuffledQuestions.length -
        1
    ) {
      currentQuestionIndex.value++
    } else {
      endGame()
    }
  }

/* -----------------------------
   END GAME
----------------------------- */

const endGame =
  () => {
    clearInterval(
      timer,
    )

    const passed =
      correctAnswers.value >=
      currentLevel.requiredCorrect

    /* REWARD PLAYER */

    if (passed) {
      runScore.value +=
        currentLevel.points
    }

    /* SAVE */

    localStorage.setItem(
      'braindrill_run_score',
      runScore.value,
    )

    localStorage.setItem(
      'braindrill_correct_answers',
      correctAnswers.value,
    )

    localStorage.setItem(
      'braindrill_current_level',
      currentLevel.level,
    )

    /* PASS SOUND */

    if (passed) {
      playSound(
        'pass',
      )
    }

    /* FAIL SOUND */

    else {
      playSound(
        'fail',
      )
    }

    /* UNLOCK NEXT LEVEL */

    if (passed) {
      const unlockedLevel =
        Number(
          localStorage.getItem(
            'braindrill_unlocked_level',
          ),
        ) || 1

      if (
        currentLevel.level >=
        unlockedLevel
      ) {
        localStorage.setItem(
          'braindrill_unlocked_level',
          currentLevel.level +
            1,
        )
      }
    }

    /* GO RESULT */

    setTimeout(() => {
      router.push(
        '/braindrill/intermission',
      )
    }, 1200)
  }

/* -----------------------------
   LEAVE
----------------------------- */

const leaveGame =
  () => {
    clearInterval(
      timer,
    )

    playSound(
      'button',
    )

    router.push(
      '/braindrill',
    )
  }

/* -----------------------------
   CURRENT COMPONENT
----------------------------- */

const currentComponent =
  computed(() => {
    if (
      gameType ===
      'quiz'
    ) {
      return BrainQuiz
    }

    if (
      gameType ===
      'match'
    ) {
      return BrainMatch
    }

    if (
      gameType ===
      'truefalse'
    ) {
      return BrainTrueFalse
    }

    return BrainQuiz
  })

/* -----------------------------
   MOUNT
----------------------------- */

onMounted(() => {
  startTimer()
})

onBeforeUnmount(() => {
  clearInterval(
    timer,
  )
})
</script>

<template>
  <main
    class="min-h-screen bg-[#FF2AA3] pb-24 px-4 pt-4"
  >
    <section
      class="max-w-md mx-auto"
    >
      <!-- TOP -->
      <div
        class="flex items-center gap-2"
      >
        <!-- LEVEL -->
        <div
          class="flex-1 bg-white border-4 border-black rounded-2xl py-3 text-center"
        >
          <p
            class="text-[10px] font-black text-black/60"
          >
            LEVEL
          </p>

          <h2
            class="text-xl font-black text-black mt-1"
          >
            {{
              currentLevel.level
            }}
          </h2>
        </div>

        <!-- TIME -->
        <div
          class="flex-1 bg-[#F3F400] border-4 border-black rounded-2xl py-3 text-center"
        >
          <p
            class="text-[10px] font-black text-black/60"
          >
            TIME
          </p>

          <h2
            class="text-xl font-black text-black mt-1"
          >
            {{
              timeLeft
            }}s
          </h2>
        </div>

        <!-- REWARD -->
        <div
          class="flex-1 bg-[#03B5EC] border-4 border-black rounded-2xl py-3 text-center"
        >
          <p
            class="text-[10px] font-black text-black/60"
          >
            REWARD
          </p>

          <h2
            class="text-xl font-black text-black mt-1"
          >
            +{{
              currentLevel.points
            }}
          </h2>
        </div>
      </div>

      <!-- CORRECT -->
      <div
        class="mt-3 bg-white border-4 border-black rounded-2xl px-4 py-3 flex items-center justify-between"
      >
        <p
          class="text-sm font-black text-black"
        >
          CORRECT
        </p>

        <h2
          class="text-2xl font-black text-[#FF2AA3]"
        >
          {{
            correctAnswers
          }}
          /
          {{
            currentLevel.requiredCorrect
          }}
        </h2>
      </div>

      <!-- GAME -->
      <div
        class="mt-4 bg-white border-4 border-black rounded-[2rem] p-5"
      >
        <component
          :is="
            currentComponent
          "
          :question="
            currentQuestion
          "
          :question-index="
            currentQuestionIndex
          "
          :total-questions="
            shuffledQuestions.length
          "
          @success="
            handleSuccess
          "
          @fail="
            handleFail
          "
          @complete="
            handleComplete
          "
        />
      </div>

      <!-- LEAVE -->
      <button
        @click="
          leaveGame
        "
        class="mt-4 w-full bg-white border-4 border-black rounded-2xl py-4 text-black text-lg font-black"
      >
        LEAVE DRILL
      </button>
    </section>

    <BottomNavbar />
  </main>
</template>