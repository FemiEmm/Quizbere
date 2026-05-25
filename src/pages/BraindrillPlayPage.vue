<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'

import { useRouter } from 'vue-router'

import BottomNavbar from '../components/BottomNavbar.vue'

import { braindrillLevels } from '../data/braindrillLevels'

import { playSound } from '../utils/playSound'

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
  router.push('/braindrill')
}

const currentLevel =
  braindrillLevels.find(
    (level) =>
      level.level ===
      levelData.level,
  )

/* -----------------------------
   DIFFICULTY MAP
----------------------------- */

const difficultyMap = {
  1: ['easy'],

  2: ['easy', 'mid'],

  3: ['mid', 'hard'],

  4: ['hard', 'extreme'],

  5: ['extreme'],
}

const difficulties =
  difficultyMap[
    currentLevel.level
  ] || ['easy']

/* -----------------------------
   AUTO IMPORT QUESTIONS
----------------------------- */

const questionModules =
  import.meta.glob(
    '../data/**/*.js',
    {
      eager: true,
    },
  )

/* -----------------------------
   FILTER QUESTIONS
----------------------------- */

const filteredModules =
  Object.entries(
    questionModules,
  ).filter(([path]) =>
    difficulties.some(
      (difficulty) =>
        path.includes(
          `/data/${difficulty}/`,
        ),
    ),
  )

/* -----------------------------
   COMBINE QUESTIONS
----------------------------- */

const allQuestions =
  filteredModules.flatMap(
    ([, module]) => {
      if (module.default) {
        return module.default
      }

      return Object.values(
        module,
      ).flat()
    },
  )

/* -----------------------------
   RANDOMIZE QUESTIONS
----------------------------- */

const shuffledQuestions =
  [...allQuestions]
    .sort(
      () =>
        Math.random() - 0.5,
    )
    .slice(
      0,
      Math.min(
        currentLevel.questions,
        allQuestions.length,
      ),
    )

/* -----------------------------
   SAFETY
----------------------------- */

if (
  shuffledQuestions.length === 0
) {
  router.push('/braindrill')
}

/* -----------------------------
   STATE
----------------------------- */

const currentQuestionIndex =
  ref(0)

const score = ref(0)

const correctAnswers =
  ref(0)

const timeLeft = ref(
  currentLevel.time,
)

const selectedAnswer =
  ref('')

const answered = ref(false)

const runScore = ref(
  Number(
    localStorage.getItem(
      'braindrill_run_score',
    ),
  ) || 0,
)

/* -----------------------------
   CURRENT QUESTION
----------------------------- */

const currentQuestion =
  computed(() => {
    return (
      shuffledQuestions[
        currentQuestionIndex.value
      ] || null
    )
  })

/* -----------------------------
   TIMER
----------------------------- */

let timer = null

const startTimer = () => {
  timer = setInterval(() => {
    if (
      timeLeft.value > 0
    ) {
      timeLeft.value--
    } else {
      endGame()
    }
  }, 1000)
}

/* -----------------------------
   ANSWER
----------------------------- */

const selectAnswer = (
  option,
) => {
  if (
    answered.value ||
    !currentQuestion.value
  ) {
    return
  }

  answered.value = true

  selectedAnswer.value =
    option

  playSound('button')

  if (
    option ===
    currentQuestion.value
      .answer
  ) {
    score.value +=
      currentLevel.points

    correctAnswers.value++

    playSound('correct')
  } else {
    score.value -= 3

    if (
      score.value < 0
    ) {
      score.value = 0
    }

    playSound('wrong')
  }

  setTimeout(() => {
    nextQuestion()
  }, 500)
}

/* -----------------------------
   NEXT QUESTION
----------------------------- */

const nextQuestion = () => {
  answered.value = false

  selectedAnswer.value =
    ''

  if (
    currentQuestionIndex.value <
    shuffledQuestions.length - 1
  ) {
    currentQuestionIndex.value++
  } else {
    endGame()
  }
}

/* -----------------------------
   END GAME
----------------------------- */

const endGame = () => {
  clearInterval(timer)

  runScore.value +=
    score.value

  localStorage.setItem(
    'braindrill_run_score',
    runScore.value,
  )

  localStorage.setItem(
    'braindrill_last_score',
    score.value,
  )

  localStorage.setItem(
    'braindrill_correct_answers',
    correctAnswers.value,
  )

  localStorage.setItem(
    'braindrill_current_level',
    currentLevel.level,
  )

  /* PASS / FAIL SOUND */

  if (
    correctAnswers.value >=
    currentLevel.requiredCorrect
  ) {
    playSound('pass')
  } else {
    playSound('fail')
  }

  /* STRICT UNLOCK */

  if (
    correctAnswers.value >=
    currentLevel.requiredCorrect
  ) {
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

  setTimeout(() => {
    router.push(
      '/braindrill/intermission',
    )
  }, 1200)
}

/* -----------------------------
   LEAVE
----------------------------- */

const leaveGame = () => {
  clearInterval(timer)

  playSound('button')

  router.push('/braindrill')
}

/* -----------------------------
   LIFECYCLE
----------------------------- */

onMounted(() => {
  startTimer()
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<template>
  <main
    class="min-h-screen bg-[#FF2AA3] pb-24 px-4 pt-4"
  >
    <section
      class="max-w-md mx-auto"
    >
      <!-- TOP BAR -->
      <div
        class="flex items-center gap-2"
      >
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
            {{ currentLevel.level }}
          </h2>
        </div>

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
            {{ timeLeft }}s
          </h2>
        </div>

        <div
          class="flex-1 bg-[#03B5EC] border-4 border-black rounded-2xl py-3 text-center"
        >
          <p
            class="text-[10px] font-black text-black/60"
          >
            SCORE
          </p>

          <h2
            class="text-xl font-black text-black mt-1"
          >
            {{ score }}
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
          CORRECT ANSWERS
        </p>

        <h2
          class="text-2xl font-black text-[#FF2AA3]"
        >
          {{ correctAnswers }}
          /
          {{ currentLevel.requiredCorrect }}
        </h2>
      </div>

      <!-- QUESTION -->
      <div
        class="mt-4 bg-white border-4 border-black rounded-[2rem] p-5"
      >
        <p
          class="text-[11px] font-black text-black/50"
        >
          Q{{
            currentQuestionIndex +
            1
          }}/{{ shuffledQuestions.length }}
        </p>

        <h1
          class="mt-3 text-2xl font-black text-black leading-tight"
        >
          {{
            currentQuestion?.question
          }}
        </h1>

        <div
          class="mt-5 flex flex-col gap-3"
        >
          <button
            v-for="option in currentQuestion?.options || []"
            :key="option"
            @click="
              selectAnswer(
                option,
              )
            "
            class="w-full border-4 border-black rounded-2xl px-4 py-4 text-base font-black transition-all duration-100"
            :class="[
              answered &&
              option ===
                currentQuestion?.answer
                ? 'bg-green-400'
                : answered &&
                  selectedAnswer ===
                    option
                ? 'bg-red-400'
                : 'bg-[#03B5EC]',
            ]"
          >
            {{ option }}
          </button>
        </div>
      </div>

      <!-- LEAVE -->
      <button
        @click="leaveGame"
        class="mt-4 w-full bg-white border-4 border-black rounded-2xl py-4 text-black text-lg font-black"
      >
        LEAVE DRILL
      </button>
    </section>

    <BottomNavbar />
  </main>
</template>