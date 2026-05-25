<script setup>
import {
  onMounted,
  onBeforeUnmount,
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

onBeforeUnmount(() => {
  stopTopicMusic()
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

    stopTopicMusic()

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

    stopTopicMusic()

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
      class="max-w-sm mx-auto"
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
          class="bg-black text-white border-4 border-black rounded-xl px-4 py-2 text-xs font-black shadow-[0_4px_0_#222]"
        >
          BACK
        </button>

        <!-- MUTE -->
        <button
          @click="
            toggleMusic
          "
          class="bg-black text-white border-4 border-black rounded-xl px-4 py-2 text-xs font-black shadow-[0_4px_0_#222]"
        >
          MUTE
        </button>
      </div>

      <!-- HEADER -->
      <div
        class="mt-4 flex items-center justify-between gap-2 px-1"
      >
        <!-- LEFT -->
        <img
          src="/mascot/mascot_marking.png"
          class="w-[75px] shrink-0"
        />

        <!-- RIGHT -->
        <div
          class="flex-1 text-right min-w-0"
        >
          <h1
            class="text-[30px] font-black text-black leading-none"
          >
            TOPIC
          </h1>

          <h2
            class="text-[30px] font-black text-[#FF2AA3] leading-none break-words"
          >
            CHALLENGE
          </h2>
        </div>
      </div>

      <!-- TOPICS -->
      <div
        class="mt-6 flex flex-col gap-4"
      >
        <div
          v-for="topic in topicChallenges"
          :key="topic.id"
          class="bg-white border-4 border-black rounded-[1.6rem] p-4"
        >
          <!-- TOP -->
          <div
            class="flex items-start justify-between gap-3"
          >
            <!-- LEFT -->
            <div>
              <p
                class="text-[11px] font-black text-black/50"
              >
                TOPIC
              </p>

              <h2
                class="mt-1 text-2xl font-black text-black leading-tight"
              >
                {{
                  topic.name
                }}
              </h2>
            </div>

            <!-- RIGHT -->
            <div
              class="text-right"
            >
              <p
                class="text-[11px] font-black text-black/50"
              >
                QUESTIONS
              </p>

              <h3
                class="mt-1 text-2xl font-black text-black"
              >
                {{
                  topic.questionCount
                }}
              </h3>
            </div>
          </div>

          <!-- BOTTOM -->
          <div
            class="mt-4 flex"
          >
            <!-- START -->
            <button
              @click="
                startTopic(
                  topic,
                )
              "
              class="w-[70%] bg-[#03B5EC] border-y-4 border-l-4 border-black rounded-l-xl py-4 text-base font-black text-black shadow-[0_4px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000] transition-all duration-100"
            >
              START TOPIC
            </button>

            <!-- REWARD -->
            <div
              class="w-[30%] bg-[#F3F400] border-4 border-black rounded-r-xl flex flex-col items-center justify-center shadow-[0_4px_0_#000]"
            >
              <p
                class="text-[9px] font-black text-black/70"
              >
                REWARD
              </p>

              <h3
                class="mt-1 text-2xl font-black text-black leading-none"
              >
                {{
                  topic.points
                }}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>

    <BottomNavbar />
  </main>
</template>