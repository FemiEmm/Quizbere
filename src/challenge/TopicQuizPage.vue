<script setup>
import {
  computed,
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

const score = ref(0)

const selectedAnswer =
  ref(null)

const showCorrect =
  ref(false)

/* -----------------------------
   CURRENT QUESTION
----------------------------- */

const currentQuestion =
  computed(() => {
    return questions[
      currentIndex.value
    ]
  })

/* -----------------------------
   SAVE RESULT
----------------------------- */

const finishQuiz =
  async (
    forcedScore =
      null,
  ) => {
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
   ANSWER
----------------------------- */

const selectAnswer =
  async (answer) => {
    if (
      selectedAnswer.value
    )
      return

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

    setTimeout(
      async () => {
        if (
          currentIndex.value <
          questions.length -
            1
        ) {
          currentIndex.value++

          selectedAnswer.value =
            null

          showCorrect.value =
            false

          return
        }

        finishQuiz()
      },
      1000,
    )
  }

/* -----------------------------
   SKIP
----------------------------- */

const skipQuestion =
  () => {
    playSound('wrong')

    finishQuiz(0)
  }

/* -----------------------------
   GIVE UP
----------------------------- */

const giveUp =
  () => {
    playSound('fail')

    finishQuiz(0)
  }

/* -----------------------------
   BUTTON COLORS
----------------------------- */

const getButtonClass =
  (answer) => {
    if (
      !showCorrect.value
    ) {
      return 'bg-[#F3F400]'
    }

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
          @click="
            router.back()
          "
          class="bg-black text-white border-4 border-black rounded-2xl px-4 py-3 text-xs font-black shadow-[0_5px_0_#222] active:translate-y-[2px] active:shadow-[0_2px_0_#222]"
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

        <!-- ANSWERS -->
        <div
          class="mt-5 flex flex-col gap-3"
        >
          <button
            v-for="answer in currentQuestion.options"
            :key="answer"
            @click="
              selectAnswer(
                answer,
              )
            "
            :disabled="
              selectedAnswer
            "
            class="border-4 border-black rounded-2xl py-4 px-4 text-base font-black shadow-[0_5px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000] transition-all duration-100"
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
          <!-- SKIP -->
          <button
            @click="
              skipQuestion
            "
            class="flex-1 bg-[#FD9501] border-4 border-black rounded-2xl py-4 text-sm font-black shadow-[0_5px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000]"
          >
            SKIP
          </button>

          <!-- GIVE UP -->
          <button
            @click="
              giveUp
            "
            class="flex-1 bg-[#EF4444] text-white border-4 border-black rounded-2xl py-4 text-sm font-black shadow-[0_5px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000]"
          >
            GIVE UP
          </button>
        </div>
      </div>
    </section>
  </main>
</template>