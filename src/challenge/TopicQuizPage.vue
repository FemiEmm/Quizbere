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

import {
  supabase,
} from '../lib/supabase'

import {
  playSound,
} from '../utils/playSound'

import {
  playTopicMusic,
  stopTopicMusic,
  resumeTopicMusic,
  isTopicMuted,
} from '../utils/topicMusic'

import {
  questions as historyQuestions,
} from '../data/easy/history'

import {
  questions as scienceQuestions,
} from '../data/easy/science'

import {
  questions as footballQuestions,
} from '../data/hard/football'

import {
  questions as animalQuestions,
} from '../data/easy/animal'

import {
  questions as nigeriaQuestions,
} from '../data/easy/nigeria.js'

import {
  questions as healthQuestions,
} from '../data/topicmulti/health.js'

const router = useRouter()

const selectedTopic =
  JSON.parse(
    localStorage.getItem(
      'selected_topic',
    ),
  )

const username =
  localStorage.getItem(
    'examinity_username',
  ) || 'anonymous'

if (!selectedTopic) {
  router.push('/topic')
}

/* -----------------------------
   MUSIC
----------------------------- */

onMounted(() => {
  playTopicMusic()
})

const toggleMusic =
  () => {
    playSound('button')

    if (
      isTopicMuted()
    ) {
      resumeTopicMusic()

      return
    }

    stopTopicMusic()
  }

/* -----------------------------
   QUESTIONS
----------------------------- */

const topicMap = {
  history:
    historyQuestions,

  science:
    scienceQuestions,

  football:
    footballQuestions,

  animal:
    animalQuestions,

  nigeria:
    nigeriaQuestions,

  health:
    healthQuestions,
}

const questions =
  [...topicMap[
    selectedTopic.topic
  ]]
    .sort(
      () =>
        Math.random() -
        0.5,
    )
    .slice(
      0,
      selectedTopic.questionCount,
    )

const currentIndex =
  ref(0)

const score =
  ref(0)

const selectedAnswer =
  ref(null)

const selectedAnswers =
  ref([])

const showCorrect =
  ref(false)

/*
  HARD BLOCKS

  isProcessingAnswer stops users from submitting
  the same question more than once.

  quizFinished stops finishQuiz from running
  more than once.
*/

const isProcessingAnswer =
  ref(false)

const quizFinished =
  ref(false)

let nextQuestionTimeout =
  null

/* -----------------------------
   CURRENT QUESTION
----------------------------- */

const currentQuestion =
  computed(() => {
    return questions[
      currentIndex.value
    ] || null
  })

/* -----------------------------
   QUESTION TYPE
----------------------------- */

const isMultipleChoice =
  computed(() => {
    return Array.isArray(
      currentQuestion.value
        ?.answers,
    )
  })

/* -----------------------------
   CLEANUP
----------------------------- */

const clearQuizTimeouts =
  () => {
    if (nextQuestionTimeout) {
      clearTimeout(
        nextQuestionTimeout,
      )

      nextQuestionTimeout =
        null
    }
  }

/* -----------------------------
   SAVE RESULT
----------------------------- */

const finishQuiz =
  async (
    forcedScore =
      null,
  ) => {
    if (
      quizFinished.value
    ) {
      return
    }

    quizFinished.value =
      true

    isProcessingAnswer.value =
      true

    clearQuizTimeouts()

    const finalScore =
      forcedScore !== null
        ? forcedScore
        : score.value

    const passed =
      finalScore >=
      selectedTopic.passMark

    /* ADD POINTS */

    if (passed) {
      const { data } =
        await supabase
          .from(
            'examinity_leaderboard',
          )
          .select(
            'challenge_points',
          )
          .eq(
            'username',
            username,
          )
          .maybeSingle()

      const currentPoints =
        data
          ?.challenge_points ||
        0

      await supabase
        .from(
          'examinity_leaderboard',
        )
        .update({
          challenge_points:
            currentPoints +
            selectedTopic.points,
        })
        .eq(
          'username',
          username,
        )
    }

    localStorage.setItem(
      'topic_result',
      JSON.stringify({
        username,

        score:
          finalScore,

        total:
          questions.length,

        passed,

        topic:
          selectedTopic.name,
      }),
    )

    router.push(
      '/topic-result',
    )
  }

/* -----------------------------
   NEXT QUESTION
----------------------------- */

const nextQuestion =
  () => {
    if (
      quizFinished.value
    ) {
      return
    }

    const delay =
      isMultipleChoice.value
        ? 2000
        : 1000

    clearQuizTimeouts()

    nextQuestionTimeout =
      setTimeout(
        async () => {
          if (
            quizFinished.value
          ) {
            return
          }

          if (
            currentIndex.value <
            questions.length -
              1
          ) {
            currentIndex.value++

            selectedAnswer.value =
              null

            selectedAnswers.value =
              []

            showCorrect.value =
              false

            isProcessingAnswer.value =
              false

            return
          }

          finishQuiz()
        },
        delay,
      )
  }

/* -----------------------------
   SINGLE ANSWER
----------------------------- */

const selectAnswer =
  async (answer) => {
    if (
      quizFinished.value ||
      isProcessingAnswer.value ||
      !currentQuestion.value
    ) {
      return
    }

    if (
      isMultipleChoice.value
    ) {
      toggleMultipleAnswer(
        answer,
      )

      return
    }

    if (
      selectedAnswer.value
    ) {
      return
    }

    isProcessingAnswer.value =
      true

    selectedAnswer.value =
      answer

    const isCorrect =
      answer ===
      currentQuestion.value.answer

    showCorrect.value =
      true

    if (isCorrect) {
      score.value++

      playSound(
        'correct',
      )
    } else {
      playSound(
        'wrong',
      )
    }

    nextQuestion()
  }

/* -----------------------------
   MULTIPLE ANSWERS
----------------------------- */

const toggleMultipleAnswer =
  (answer) => {
    if (
      quizFinished.value ||
      isProcessingAnswer.value ||
      showCorrect.value
    ) {
      return
    }

    const exists =
      selectedAnswers.value.includes(
        answer,
      )

    if (exists) {
      selectedAnswers.value =
        selectedAnswers.value.filter(
          (item) =>
            item !== answer,
        )

      return
    }

    selectedAnswers.value.push(
      answer,
    )
  }

/* -----------------------------
   SUBMIT MULTIPLE
----------------------------- */

const submitMultipleAnswers =
  () => {
    if (
      quizFinished.value ||
      isProcessingAnswer.value ||
      showCorrect.value ||
      selectedAnswers.value
        .length === 0 ||
      !currentQuestion.value
    ) {
      return
    }

    isProcessingAnswer.value =
      true

    showCorrect.value =
      true

    const correctAnswers =
      currentQuestion.value
        .answers

    const isCorrect =
      selectedAnswers.value
        .length ===
        correctAnswers.length &&
      selectedAnswers.value.every(
        (answer) =>
          correctAnswers.includes(
            answer,
          ),
      )

    if (isCorrect) {
      score.value++

      playSound(
        'correct',
      )
    } else {
      playSound(
        'wrong',
      )
    }

    nextQuestion()
  }

/* -----------------------------
   SKIP
----------------------------- */

const skipQuestion =
  () => {
    if (
      quizFinished.value ||
      isProcessingAnswer.value
    ) {
      return
    }

    isProcessingAnswer.value =
      true

    playSound('wrong')

    finishQuiz(0)
  }

/* -----------------------------
   GIVE UP
----------------------------- */

const giveUp =
  () => {
    if (
      quizFinished.value ||
      isProcessingAnswer.value
    ) {
      return
    }

    isProcessingAnswer.value =
      true

    playSound('fail')

    finishQuiz(0)
  }

/* -----------------------------
   BUTTON COLORS
----------------------------- */

const getButtonClass =
  (answer) => {
    /* BEFORE SUBMIT */

    if (
      !showCorrect.value
    ) {
      if (
        isMultipleChoice.value &&
        selectedAnswers.value.includes(
          answer,
        )
      ) {
        return 'bg-[#FF2AA3] text-white'
      }

      return 'bg-[#F3F400]'
    }

    /* MULTIPLE */

    if (
      isMultipleChoice.value
    ) {
      const correctAnswers =
        currentQuestion.value
          .answers

      if (
        correctAnswers.includes(
          answer,
        )
      ) {
        return 'bg-[#22C55E] text-white'
      }

      if (
        selectedAnswers.value.includes(
          answer,
        )
      ) {
        return 'bg-[#EF4444] text-white'
      }

      return 'bg-[#F3F400]'
    }

    /* SINGLE */

    if (
      answer ===
      currentQuestion.value.answer
    ) {
      return 'bg-[#22C55E] text-white'
    }

    if (
      answer ===
      selectedAnswer.value
    ) {
      return 'bg-[#EF4444] text-white'
    }

    return 'bg-[#F3F400]'
  }

/* -----------------------------
   UNMOUNT
----------------------------- */

onBeforeUnmount(() => {
  clearQuizTimeouts()
})
</script>

<template>
  <main
    class="min-h-screen bg-[#03B5EC] px-4 pt-5 pb-5"
  >
    <section
      class="max-w-md mx-auto"
    >
      <!-- TOP -->
      <div
        class="flex justify-between items-center"
      >
        <!-- BACK -->
        <button
          type="button"
          :disabled="
            quizFinished ||
            isProcessingAnswer
          "
          @click="
            router.back()
          "
          class="bg-black text-white border-4 border-black rounded-2xl px-4 py-3 text-xs font-black shadow-[0_5px_0_#222] active:translate-y-[2px] active:shadow-[0_2px_0_#222] disabled:pointer-events-none disabled:opacity-60"
        >
          BACK
        </button>

        <!-- TOPIC -->
        <h1
          class="text-2xl font-black text-white text-center"
        >
          {{
            selectedTopic.name
          }}
        </h1>

        <!-- MUTE -->
        <button
          type="button"
          @click="
            toggleMusic
          "
          class="bg-black text-white border-4 border-black rounded-2xl px-4 py-3 text-xs font-black shadow-[0_5px_0_#222] active:translate-y-[2px] active:shadow-[0_2px_0_#222]"
        >
          MUTE
        </button>
      </div>

      <!-- SCORE -->
      <div
        class="mt-4 flex justify-center"
      >
        <div
          class="bg-[#F3F400] border-4 border-black rounded-2xl px-5 py-3 text-center shadow-[0_5px_0_#000]"
        >
          <p
            class="text-[10px] font-black leading-none"
          >
            SCORE
          </p>

          <h2
            class="mt-1 text-3xl font-black leading-none"
          >
            {{ score }}
          </h2>
        </div>
      </div>

      <!-- QUESTION CARD -->
      <div
        v-if="
          currentQuestion
        "
        class="mt-4 bg-white border-4 border-black rounded-[2rem] p-5"
      >
        <!-- QUESTION COUNT -->
        <p
          class="text-sm font-black text-black/50 text-center"
        >
          QUESTION
          {{
            currentIndex + 1
          }}
          /
          {{
            questions.length
          }}
        </p>

        <!-- QUESTION -->
        <h2
          class="mt-4 text-2xl font-black leading-tight text-center"
        >
          {{
            currentQuestion.question
          }}
        </h2>

        <!-- MULTIPLE NOTICE -->
        <p
          v-if="
            isMultipleChoice
          "
          class="mt-2 text-center text-sm font-black text-[#FF2AA3]"
        >
          Select all correct answers
        </p>

        <!-- ANSWERS -->
        <div
          class="mt-5 flex flex-col gap-3"
        >
          <button
            v-for="answer in currentQuestion.options"
            :key="answer"
            type="button"
            @click="
              selectAnswer(
                answer,
              )
            "
            :disabled="
              quizFinished ||
              isProcessingAnswer ||
              showCorrect ||
              (
                !isMultipleChoice &&
                selectedAnswer
              )
            "
            class="border-4 border-black rounded-2xl py-4 px-4 text-base font-black shadow-[0_5px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000] transition-all duration-100 disabled:pointer-events-none"
            :class="
              getButtonClass(
                answer,
              )
            "
          >
            {{ answer }}
          </button>
        </div>

        <!-- ACTIONS -->
        <div
          class="mt-5 flex gap-3"
        >
          <!-- SINGLE -->
          <template
            v-if="
              !isMultipleChoice
            "
          >
            <!-- SKIP -->
            <button
              type="button"
              :disabled="
                quizFinished ||
                isProcessingAnswer
              "
              @click="
                skipQuestion
              "
              class="flex-1 bg-[#FD9501] border-4 border-black rounded-2xl py-4 text-sm font-black shadow-[0_5px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000] disabled:pointer-events-none disabled:opacity-60"
            >
              SKIP
            </button>

            <!-- GIVE UP -->
            <button
              type="button"
              :disabled="
                quizFinished ||
                isProcessingAnswer
              "
              @click="
                giveUp
              "
              class="flex-1 bg-[#EF4444] text-white border-4 border-black rounded-2xl py-4 text-sm font-black shadow-[0_5px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000] disabled:pointer-events-none disabled:opacity-60"
            >
              GIVE UP
            </button>
          </template>

          <!-- MULTIPLE -->
          <template
            v-else
          >
            <!-- SUBMIT -->
            <button
              type="button"
              :disabled="
                quizFinished ||
                isProcessingAnswer ||
                showCorrect ||
                selectedAnswers.length === 0
              "
              @click="
                submitMultipleAnswers
              "
              class="w-full bg-[#FF2AA3] text-white border-4 border-black rounded-2xl py-4 text-sm font-black shadow-[0_5px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000] disabled:pointer-events-none disabled:opacity-60"
            >
              SUBMIT ANSWER
            </button>
          </template>
        </div>
      </div>
    </section>
  </main>
</template>