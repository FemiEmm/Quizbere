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

const startTimer = () => {
  if (!challenge.useTimer)
    return

  timer = setInterval(() => {
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
    clearInterval(timer)

    resultType.value =
      'timesup'

    showResultModal.value =
      true

    playSound('fail')

    setTimeout(() => {
      finishChallenge()
    }, 1800)
  }

/* -----------------------------
   COMPLETE MODAL
----------------------------- */

const showCompleteModal =
  () => {
    clearInterval(timer)

    resultType.value =
      'done'

    showResultModal.value =
      true

    playSound('pass')

    setTimeout(() => {
      finishChallenge()
    }, 1800)
  }

/* -----------------------------
   FINISH CHALLENGE
----------------------------- */

const finishChallenge =
  () => {
    clearInterval(timer)

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
  answered.value = false

  selectedAnswer.value =
    ''

  currentQuestionIndex.value++

  /* END */

  if (
    currentQuestionIndex.value >=
    shuffledQuestions.length
  ) {
    showCompleteModal()

    return
  }
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
      setTimeout(() => {
        showTimeUpModal()
      }, 700)

      return
    }
  }

  setTimeout(() => {
    nextQuestion()
  }, 500)
}

/* -----------------------------
   LEAVE
----------------------------- */

const leaveChallenge =
  () => {
    clearInterval(timer)

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
  clearInterval(timer)
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
                : 'bg-[#F3F400]',
            ]"
          >
            {{ option }}
          </button>
        </div>
      </div>

      <!-- LEAVE -->
      <button
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