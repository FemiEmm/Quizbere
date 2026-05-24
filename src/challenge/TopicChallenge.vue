<script setup>
import {
  onMounted,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import BottomNavbar from '../components/BottomNavbar.vue'

import {
  topicChallenges,
} from './topicTopics'

import {
  playSound,
} from '../utils/playSound'

import {
  playTopicMusic,
  stopTopicMusic,
  resumeTopicMusic,
  isTopicMuted,
} from '../utils/topicMusic'

const router = useRouter()

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
   START TOPIC
----------------------------- */

const startTopic =
  (topic) => {
    playSound('button')

    localStorage.setItem(
      'selected_topic',
      JSON.stringify(topic),
    )

    router.push(
      '/topic-quiz',
    )
  }

/* -----------------------------
   BACK
----------------------------- */

const goBack =
  () => {
    playSound('button')

    router.push(
      '/challenge',
    )
  }
</script>

<template>
  <main
    class="min-h-screen bg-[#F3F400] px-4 pt-5 pb-28 overflow-x-hidden"
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
            goBack
          "
          class="bg-black text-white border-4 border-black rounded-2xl px-5 py-3 text-sm font-black shadow-[0_5px_0_#222]"
        >
          BACK
        </button>

        <!-- MUTE -->
        <button
          @click="
            toggleMusic
          "
          class="bg-black text-white border-4 border-black rounded-2xl px-5 py-3 text-sm font-black shadow-[0_5px_0_#222]"
        >
          MUTE
        </button>
      </div>

      <!-- HEADER -->
      <div
        class="mt-4 flex items-center justify-between gap-2 px-2"
      >
        <!-- LEFT -->
        <img
          src="/mascot/mascot_marking.png"
          class="w-[90px] shrink-0"
        />

        <!-- RIGHT -->
        <div
          class="flex-1 text-right min-w-0"
        >
          <h1
            class="text-[42px] font-black text-black leading-none"
          >
            TOPIC
          </h1>

          <h2
            class="text-[42px] font-black text-[#FF2AA3] leading-none break-words"
          >
            CHALLENGE
          </h2>
        </div>
      </div>

      <!-- TOPICS -->
      <div
        class="mt-8 flex flex-col gap-5"
      >
        <div
          v-for="topic in topicChallenges"
          :key="topic.id"
          class="bg-white border-4 border-black rounded-[2rem] p-5"
        >
          <!-- TOP -->
          <div
            class="flex justify-between items-start gap-4"
          >
            <!-- LEFT -->
            <div>
              <h2
                class="text-3xl font-black text-black"
              >
                {{
                  topic.name
                }}
              </h2>

              <p
                class="mt-2 text-sm font-bold text-black/60"
              >
                {{
                  topic.questionCount
                }}
                Questions
              </p>
            </div>

            <!-- POINTS -->
            <div
              class="bg-[#F3F400] border-4 border-black rounded-2xl px-4 py-3 text-center min-w-[90px]"
            >
              <p
                class="text-[10px] font-black"
              >
                REWARD
              </p>

              <h3
                class="text-3xl font-black"
              >
                {{
                  topic.points
                }}
              </h3>
            </div>
          </div>

          <!-- BUTTON -->
          <button
            @click="
              startTopic(
                topic,
              )
            "
            class="mt-5 w-full bg-[#03B5EC] border-4 border-black rounded-2xl py-5 text-xl font-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000]"
          >
            START TOPIC
          </button>
        </div>
      </div>
    </section>

    <BottomNavbar />
  </main>
</template>