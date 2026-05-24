<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'

import { useRouter } from 'vue-router'

import { playSound } from '../utils/playSound'

const router = useRouter()

/* -----------------------------
   AUTO IMPORT QUESTION FILES
----------------------------- */

const questionModules =
  import.meta.glob(
    '../data/quizbere/*.js',
    {
      eager: true,
    },
  )

/* -----------------------------
   COMBINE ALL QUESTIONS
----------------------------- */

const allQuestions =
  Object.values(
    questionModules,
  ).flatMap((module) => {
    return (
      module.default ||
      module.questions ||
      []
    )
  })

/* -----------------------------
   RANDOMIZE QUESTIONS
----------------------------- */

const shuffledQuestions =
  allQuestions
    .sort(
      () =>
        Math.random() - 0.5,
    )
    .slice(0, 10)

/* -----------------------------
   QUIZ STATE
----------------------------- */

const currentQuestionIndex =
  ref(0)

const score = ref(0)

const selectedAnswer =
  ref('')

const answered = ref(false)

/* -----------------------------
   TIMER
----------------------------- */

const timeLeft = ref(10)

let timer = null

const startTimer = () => {
  clearInterval(timer)

  timeLeft.value = 10

  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      clearInterval(timer)

      answered.value = true

      playSound('wrong')

      setTimeout(() => {
        nextQuestion()
      }, 1000)
    }
  }, 1000)
}

/* -----------------------------
   COMPUTED
----------------------------- */

const currentQuestion =
  computed(() => {
    return shuffledQuestions[
      currentQuestionIndex.value
    ]
  })

const progressPercentage =
  computed(() => {
    return (
      ((currentQuestionIndex.value +
        1) /
        shuffledQuestions.length) *
      100
    )
  })

/* -----------------------------
   ANSWER SELECTION
----------------------------- */

const selectAnswer = (
  option,
) => {
  if (answered.value)
    return

  clearInterval(timer)

  playSound('button')

  selectedAnswer.value =
    option

  answered.value = true

  if (
    option ===
    currentQuestion.value
      .answer
  ) {
    score.value++

    playSound('correct')
  } else {
    playSound('wrong')
  }
}

/* -----------------------------
   NEXT QUESTION
----------------------------- */

const nextQuestion = () => {
  playSound('button')

  if (
    currentQuestionIndex.value <
    shuffledQuestions.length - 1
  ) {
    currentQuestionIndex.value++

    selectedAnswer.value =
      ''

    answered.value = false

    startTimer()
  } else {
    clearInterval(timer)

    localStorage.setItem(
      'quizbere_score',
      score.value,
    )

    /* PASS / FAIL SOUND */

    if (score.value >= 7) {
      playSound('pass')
    } else {
      playSound('fail')
    }

    setTimeout(() => {
      router.push('/score')
    }, 1200)
  }
}

/* -----------------------------
   BACK BUTTON
----------------------------- */

const goBack = () => {
  clearInterval(timer)

  playSound('button')

  router.push('/name')
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
    class="min-h-screen bg-[#FF2AA3] px-4 py-5 flex items-center justify-center"
  >
    <section
      class="w-full max-w-sm"
    >
      <!-- TOP BAR -->
      <div
        class="flex items-center justify-between mb-4"
      >
        <!-- BACK BUTTON -->
        <button
          @click="goBack"
          class="bg-white border-4 border-black rounded-xl px-3 py-2 shadow-[0_4px_0_#000] font-black text-sm text-black active:translate-y-[2px] active:shadow-[0_2px_0_#000] transition-all duration-100"
        >
          BACK
        </button>

        <!-- TIMER -->
        <div
          class="bg-[#F3F400] border-4 border-black rounded-xl px-3 py-2 shadow-[0_4px_0_#000] font-black text-sm text-black"
        >
          {{ timeLeft }}s
        </div>

        <!-- QUESTION COUNTER -->
        <div
          class="bg-white border-4 border-black rounded-xl px-3 py-2 shadow-[0_4px_0_#000] font-black text-sm text-black"
        >
          {{
            currentQuestionIndex +
            1
          }}/{{ shuffledQuestions.length }}
        </div>
      </div>

      <!-- PROGRESS -->
      <div
        class="w-full h-4 bg-white border-4 border-black rounded-full overflow-hidden shadow-[0_4px_0_#000]"
      >
        <div
          class="h-full bg-[#F3F400] transition-all duration-300"
          :style="{
            width: `${progressPercentage}%`,
          }"
        />
      </div>

      <!-- QUESTION CARD -->
      <div
        class="mt-5 bg-white border-4 border-black rounded-[1.7rem] p-5 shadow-[0_6px_0_#000]"
      >
        <!-- QUESTION -->
        <h1
          class="text-2xl font-black text-black leading-tight text-center"
        >
          {{
            currentQuestion.question
          }}
        </h1>

        <!-- OPTIONS -->
        <div
          class="mt-5 flex flex-col gap-3"
        >
          <button
            v-for="option in currentQuestion.options"
            :key="option"
            @click="
              selectAnswer(
                option,
              )
            "
            class="w-full border-4 border-black rounded-2xl px-4 py-4 text-base font-black shadow-[0_5px_0_#000] transition-all duration-100"
            :class="[
              answered &&
              option ===
                currentQuestion.answer
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

        <!-- NEXT -->
        <button
          @click="nextQuestion"
          :disabled="!answered"
          class="mt-5 w-full text-black text-xl font-black py-4 rounded-2xl border-4 border-black shadow-[0_6px_0_#000] transition-all duration-100"
          :class="[
            answered
              ? 'bg-[#FD9501] active:translate-y-[3px] active:shadow-[0_3px_0_#000]'
              : 'bg-gray-400 opacity-60 cursor-not-allowed',
          ]"
        >
          {{
            currentQuestionIndex ===
            shuffledQuestions.length -
              1
              ? 'FINISH'
              : 'NEXT'
          }}
        </button>
      </div>
    </section>
  </main>
</template>