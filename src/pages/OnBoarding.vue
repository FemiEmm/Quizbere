<script setup>
import {
  useRouter,
} from 'vue-router'

import BottomNavbar from '../components/BottomNavbar.vue'

import {
  playSound,
} from '../utils/playSound'

const router = useRouter()

/* -----------------------------
   BACK
----------------------------- */

const goBack =
  () => {
    playSound('button')

    router.push(
      '/support',
    )
  }

/* -----------------------------
   CARDS
----------------------------- */

const onboardingCards = [
  {
    title:
      'QUIZBERE',

    mascot:
      '/mascot/Mascot_happy.png',

    color:
      'bg-[#F3F400]',

    text:
      'Quizbere is the main Christian quiz game. You answer 10 Bible and knowledge questions for a chance to win amazing rewards. The better your score, the higher your chances of appearing among winners.',
  },

  {
    title:
      'BRAINDRILL',

    mascot:
      '/mascot/Mascot_thinking.png',

    color:
      'bg-[#03B5EC]',

    text:
      'Braindrill is a fast-paced survival quiz mode. Every level becomes harder and faster. Your score keeps increasing as you clear levels. Your total run score is saved automatically to the leaderboard.',
  },

  {
    title:
      'CHALLENGE MODE',

    mascot:
      '/mascot/mascot_marking.png',

    color:
      'bg-[#FF2AA3]',

    text:
      'Challenge mode lets you earn challenge points by completing quiz challenges. Some challenges are topic based while others are versus battles against other players.',
  },

  {
    title:
      'VERSUS MODE',

    mascot:
      '/mascot/mascot_win.png',

    color:
      'bg-[#FD9501]',

    text:
      'Versus mode allows you to challenge another player directly. Each player answers the same questions and the highest score wins the match.',
  },

  {
    title:
      'TOPIC CHALLENGE',

    mascot:
      '/mascot/Mascot_reading.png',

    color:
      'bg-[#7C3AED]',

    text:
      'Topic Challenge focuses on a specific subject like History, Science, Football or Nigerian History. Passing these challenges earns challenge points.',
  },

  {
    title:
      'LEADERBOARD',

    mascot:
      '/mascot/Mascot_default.png',

    color:
      'bg-[#00C853]',

    text:
      'The leaderboard shows the strongest BrainDrill players ranked by total run score. Higher scores and levels move you higher on the leaderboard.',
  },

  {
    title:
      'POINTS SYSTEM',

    mascot:
      '/mascot/Mascot_wink.png',

    color:
      'bg-[#FF6D00]',

    text:
      'Challenge points are earned by completing challenge modes successfully. These points help track your progress and competitive performance inside the app.',
  },

  {
    title:
      'HOW SCORES WORK',

    mascot:
      '/mascot/mascot_lose.png',

    color:
      'bg-[#D50000]',

    text:
      'BrainDrill scores are saved automatically. Every new run adds to your existing total score on the leaderboard. Your highest unlocked level is also saved.',
  },

   {
    title:
      'UPDATES',

    mascot:
      '/mascot/Mascot_happy.png',

    color:
      'bg-[#D50000]',

    text:
      'Expect regular updates with new quiz modes, features and improvements. We are committed to making Quizbere the best  quiz app experience possible.',
  },
]
</script>

<template>
  <main
    class="min-h-screen bg-[#1A1A1A] pb-28 px-4 pt-5"
  >
    <section
      class="max-w-md mx-auto"
    >
      <!-- TOP -->
      <div
        class="flex items-center justify-between"
      >
        <!-- BACK -->
        <button
          @click="
            goBack
          "
          class="bg-[#F3F400] border-4 border-black rounded-2xl px-5 py-3 text-sm font-black text-black shadow-[0_5px_0_#000]"
        >
          BACK
        </button>

        <!-- TITLE -->
        <div
          class="text-right"
        >
          <h1
            class="text-3xl font-black text-[#F3F400]"
          >
            QUIZBERE
          </h1>

          <p
            class="text-[12px] font-black text-white/70"
          >
            APP GUIDE
          </p>
        </div>
      </div>

      <!-- INTRO -->
      <div
        class="mt-6 bg-[#2A2A2A] border-4 border-[#4A4A4A] rounded-[2rem] p-5"
      >
        <h2
          class="text-xl font-black text-white"
        >
          HOW THE APP WORKS
        </h2>

        <p
          class="mt-3 text-sm font-bold leading-6 text-white/70"
        >
          Quizbere contains multiple quiz
          game modes. Each mode has its own
          scoring system, rewards and
          progression. This page explains
          every tab and feature inside the
          app.
        </p>
      </div>

      <!-- CARDS -->
      <div
        class="mt-6 flex flex-col gap-5"
      >
        <div
          v-for="card in onboardingCards"
          :key="card.title"
          class="bg-[#2A2A2A] border-4 border-[#4A4A4A] rounded-[2rem] p-4"
        >
          <div
            class="grid grid-cols-[90px_1fr] gap-4 items-center"
          >
            <!-- LEFT -->
            <div
              class="flex justify-center"
            >
              <div
                class="w-[75px] h-[75px] rounded-2xl border-4 border-black flex items-center justify-center overflow-hidden"
                :class="
                  card.color
                "
              >
                <img
                  :src="
                    card.mascot
                  "
                  class="w-full h-full object-contain"
                />
              </div>
            </div>

            <!-- RIGHT -->
            <div>
              <h2
                class="text-lg font-black text-white"
              >
                {{
                  card.title
                }}
              </h2>

              <p
                class="mt-2 text-[12px] font-bold leading-5 text-white/70"
              >
                {{
                  card.text
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- NAVBAR -->
    <BottomNavbar />
  </main>
</template>