<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'

import { useRouter } from 'vue-router'

import BottomNavbar from '../components/BottomNavbar.vue'

import { playSound } from '../utils/playSound'

const router = useRouter()

/* -----------------------------
   CHALLENGE
----------------------------- */

const challenge = JSON.parse(
  localStorage.getItem(
    'selected_challenge',
  ),
)

if (!challenge) {
  router.push('/challenge')
}

/* -----------------------------
   QUESTIONS
----------------------------- */

const questionModules =
  import.meta.glob(
    '../data/**/*.js',
    {
      eager: true,
    },
  )

const filteredModules =
  Object.entries(
    questionModules,
  ).filter(([path]) =>
    challenge.questionFolders.some(
      (folder) =>
        path.includes(
          `/data/${folder}/`,
        ),
    ),
  )

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

const shuffledQuestions =
  [...allQuestions]
    .sort(
      () =>
        Math.random() - 0.5,
    )
    .slice(
      0,
      challenge.questionCount,
    )

/* -----------------------------
   STATE
----------------------------- */

const currentQuestionIndex =
  ref(0)

const score = ref(0)

const correctAnswers =
  ref(0)

const answered = ref(false)

const selectedAnswer =
  ref('')

const timeLeft = ref(
  challenge.startingTime ||
    0,
)

/*
  HARD LOCKS

  isProcessingAnswer stops users from triggering
  answer logic more than once per question.

  challengeFinished stops result saving / routing
  from running more than once.
*/

const isProcessingAnswer =
  ref(false)

const challengeFinished =
  ref(false)

/* -----------------------------
   MODAL
----------------------------- */

const showResultModal =
  ref(false)

const resultType =
  ref('')

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
let answerTimeout = null
let finishTimeout = null

const clearGameTimers = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }

  if (answerTimeout) {
    clearTimeout(answerTimeout)
    answerTimeout = null
  }

  if (finishTimeout) {
    clearTimeout(finishTimeout)
    finishTimeout = null
  }
}

const startTimer = () => {
  if (!challenge.useTimer)
    return

  if (timer) {
    clearInterval(timer)
  }

  timer = setInterval(() => {
    if (
      challengeFinished.value ||
      showResultModal.value
    ) {
      clearInterval(timer)
      timer = null
      return
    }

    if (
      timeLeft.value > 0
    ) {
      timeLeft.value--
    } else {
      showTimeUpModal()
    }
  }, 1000)
}

/* -----------------------------
   TIME UP MODAL
----------------------------- */

const showTimeUpModal =
  () => {
    if (
      challengeFinished.value ||
      showResultModal.value
    ) {
      return
    }

    challengeFinished.value =
      true

    clearGameTimers()

    resultType.value =
      'timesup'

    showResultModal.value =
      true

    playSound('fail')

    finishTimeout =
      setTimeout(() => {
        finishChallenge()
      }, 1800)
  }

/* -----------------------------
   COMPLETE MODAL
----------------------------- */

const showCompleteModal =
  () => {
    if (
      challengeFinished.value ||
      showResultModal.value
    ) {
      return
    }

    challengeFinished.value =
      true

    clearGameTimers()

    resultType.value =
      'done'

    showResultModal.value =
      true

    playSound('pass')

    finishTimeout =
      setTimeout(() => {
        finishChallenge()
      }, 1800)
  }

/* -----------------------------
   FINISH CHALLENGE
----------------------------- */

const finishChallenge =
  () => {
    clearGameTimers()

    const passed =
      correctAnswers.value >=
      challenge.passMark

    localStorage.setItem(
      'challenge_result',
      JSON.stringify({
        won: passed,

        score:
          correctAnswers.value,

        reward: passed
          ? challenge.points
          : 0,

        challengeTitle:
          challenge.title,
      }),
    )

    router.push(
      '/challenge/result',
    )
  }

/* -----------------------------
   NEXT QUESTION
----------------------------- */

const nextQuestion = () => {
  if (
    challengeFinished.value ||
    showResultModal.value
  ) {
    return
  }

  const nextIndex =
    currentQuestionIndex.value + 1

  if (
    nextIndex >=
    shuffledQuestions.length
  ) {
    showCompleteModal()
    return
  }

  currentQuestionIndex.value =
    nextIndex

  answered.value = false

  selectedAnswer.value =
    ''

  isProcessingAnswer.value =
    false
}

/* -----------------------------
   ANSWER
----------------------------- */

const selectAnswer = (
  option,
) => {
  if (
    answered.value ||
    isProcessingAnswer.value ||
    challengeFinished.value ||
    showResultModal.value ||
    !currentQuestion.value
  ) {
    return
  }

  /*
    Lock immediately before any sound,
    score update, or timeout.
  */

  isProcessingAnswer.value =
    true

  answered.value = true

  selectedAnswer.value =
    option

  playSound('button')

  const isCorrect =
    option ===
    currentQuestion.value
      .answer

  /* CORRECT */

  if (isCorrect) {
    correctAnswers.value++

    score.value +=
      challenge.pointsPerCorrect ||
      1

    playSound('correct')

    /* SOCCERMANIA */

    if (
      challenge.mode ===
      'survival_timer'
    ) {
      timeLeft.value +=
        challenge.timeReward ||
        3
    }
  }

  /* WRONG */

  else {
    playSound('wrong')

    /* NO MISS */

    if (
      challenge.mode ===
      'sudden_death'
    ) {
      answerTimeout =
        setTimeout(() => {
          showTimeUpModal()
        }, 700)

      return
    }
  }

  answerTimeout =
    setTimeout(() => {
      nextQuestion()
    }, 500)
}

/* -----------------------------
   LEAVE
----------------------------- */

const leaveChallenge =
  () => {
    clearGameTimers()

    playSound('button')

    router.push('/challenge')
  }

/* -----------------------------
   MOUNT
----------------------------- */

onMounted(() => {
  startTimer()

  window.scrollTo(0, 0)
})

onBeforeUnmount(() => {
  clearGameTimers()
})
</script>

<template>
  <main
    class="min-h-screen bg-[#03B5EC] pb-28 px-4 pt-4"
  >
    <!-- RESULT MODAL -->
    <div
      v-if="
        showResultModal
      "
      class="fixed inset-0 z-50 bg-[#F3F400] flex items-center justify-center px-5"
    >
      <div
        class="w-full max-w-sm text-center"
      >
        <!-- DONE -->
        <template
          v-if="
            resultType ===
            'done'
          "
        >
          <h2
            class="text-6xl font-black text-[#03B5EC]"
          >
            DONE!
          </h2>

          <p
            class="mt-5 text-black text-2xl font-black"
          >
            ALL QUESTIONS
            COMPLETED
          </p>
        </template>

        <!-- TIME UP -->
        <template
          v-if="
            resultType ===
            'timesup'
          "
        >
          <h2
            class="text-6xl font-black text-[#FF2AA3]"
          >
            TIME UP!
          </h2>

          <p
            class="mt-5 text-black text-2xl font-black"
          >
            CHALLENGE ENDED
          </p>
        </template>
      </div>
    </div>

    <section
      class="max-w-md mx-auto"
    >
      <!-- TOP -->
      <div
        class="flex items-center gap-2"
      >
        <!-- TIMER -->
        <div
          v-if="challenge.useTimer"
          class="flex-1 bg-white border-4 border-black rounded-2xl py-3 text-center"
        >
          <p
            class="text-[10px] font-black text-black/60"
          >
            TIME
          </p>

          <h2
            class="text-2xl font-black text-black"
          >
            {{ timeLeft }}
          </h2>
        </div>

        <!-- SCORE -->
        <div
          class="flex-1 bg-[#F3F400] border-4 border-black rounded-2xl py-3 text-center"
        >
          <p
            class="text-[10px] font-black text-black/60"
          >
            CORRECT
          </p>

          <h2
            class="text-2xl font-black text-black"
          >
            {{ correctAnswers }}
          </h2>
        </div>

        <!-- TARGET -->
        <div
          class="flex-1 bg-[#FD9501] border-4 border-black rounded-2xl py-3 text-center"
        >
          <p
            class="text-[10px] font-black text-black/60"
          >
            PASS
          </p>

          <h2
            class="text-2xl font-black text-black"
          >
            {{ challenge.passMark }}
          </h2>
        </div>
      </div>

      <!-- TITLE -->
      <div
        class="mt-4 bg-white border-4 border-black rounded-[2rem] p-5 text-center"
      >
        <h1
          class="text-3xl font-black text-[#FF2AA3]"
        >
          {{ challenge.title }}
        </h1>

        <p
          class="mt-3 text-sm font-bold text-black/70"
        >
          {{ challenge.description }}
        </p>
      </div>

      <!-- QUESTION -->
      <div
        class="mt-4 bg-white border-4 border-black rounded-[2rem] p-5"
      >
        <p
          class="text-[11px] font-black text-black/50"
        >
          QUESTION
          {{
            currentQuestionIndex +
            1
          }}
          /
          {{
            shuffledQuestions.length
          }}
        </p>

        <h2
          class="mt-3 text-2xl font-black text-black leading-tight"
        >
          {{
            currentQuestion?.question
          }}
        </h2>

        <div
          class="mt-5 flex flex-col gap-3"
        >
          <button
            v-for="option in currentQuestion?.options || []"
            :key="option"
            type="button"
            :disabled="
              answered ||
              isProcessingAnswer ||
              challengeFinished ||
              showResultModal
            "
            @click="
              selectAnswer(
                option,
              )
            "
            class="w-full border-4 border-black rounded-2xl px-4 py-4 text-base font-black transition-all duration-100 disabled:pointer-events-none"
            :class="[
              answered &&
              option ===
                currentQuestion?.answer
                ? 'bg-green-400'
                : answered &&
                  selectedAnswer ===
                    option
                ? 'bg-red-400'
                : 'bg-[#F3F400]',
            ]"
          >
            {{ option }}
          </button>
        </div>
      </div>

      <!-- LEAVE -->
      <button
        type="button"
        @click="
          leaveChallenge
        "
        class="mt-4 w-full bg-white border-4 border-black rounded-2xl py-4 text-black text-lg font-black"
      >
        LEAVE CHALLENGE
      </button>
    </section>

    <BottomNavbar />
  </main>
</template>