<script setup>
import {
  onMounted,
  ref,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import BottomNavbar from '../components/BottomNavbar.vue'

import { braindrillLevels } from '../data/braindrillLevels'

import TopNav from '../components/TopNav.vue'

import {
  trackGame,
} from '../utils/trackGame'

import {
  playSound,
} from '../utils/playSound'

const router = useRouter()

/* -----------------------------
   LEVEL
----------------------------- */

const unlockedLevel =
  ref(1)

/* -----------------------------
   SCORE
----------------------------- */

const displayScore =
  ref(0)

const loadingScore =
  ref(true)

/* -----------------------------
   ANIMATE SCORE
----------------------------- */

const animateScore =
  (targetScore) => {
    displayScore.value = 0

    const duration = 1200

    const frameRate = 16

    const totalFrames =
      duration / frameRate

    const increment =
      targetScore /
      totalFrames

    let currentScore = 0

    const counter =
      setInterval(() => {
        currentScore +=
          increment

        if (
          currentScore >=
          targetScore
        ) {
          displayScore.value =
            targetScore

          clearInterval(
            counter,
          )

          return
        }

        displayScore.value =
          Math.floor(
            currentScore,
          )
      }, frameRate)
  }

/* -----------------------------
   LOAD USER LEVEL
----------------------------- */

const loadUserLevel =
  () => {
    const localLevel =
      Number(
        localStorage.getItem(
          'braindrill_unlocked_level',
        ),
      ) || 1

    unlockedLevel.value =
      localLevel
  }

/* -----------------------------
   LOAD SCORE
----------------------------- */

const loadScore =
  () => {
    const totalScore =
      Number(
        localStorage.getItem(
          'braindrill_total_points',
        ),
      ) || 0

    animateScore(
      totalScore,
    )

    loadingScore.value =
      false
  }

/* -----------------------------
   START LEVEL
----------------------------- */

const startLevel =
  async (
    levelData,
  ) => {
    if (
      levelData.level >
      unlockedLevel.value
    ) {
      return
    }

    playSound(
      'button',
    )

    await trackGame(
      'braindrill',
    )

    localStorage.setItem(
      'braindrill_selected_level',
      JSON.stringify(levelData),
    )

    router.push(
      '/braindrill/play',
    )
  }

/* -----------------------------
   MOUNT
----------------------------- */

onMounted(() => {
  loadUserLevel()

  loadScore()
})
</script>

<template>
  <TopNav />

  <main
    class="min-h-screen bg-[#03B5EC] pb-24 px-4 pt-4"
  >
    <section
      class="max-w-md mx-auto"
    >
      <!-- HEADER -->
      <div
        class="flex items-center gap-2"
      >
        <!-- MASCOT -->
        <img
          src="/mascot/mascot_win.png"
          alt="Mascot"
          class="w-20 shrink-0 object-contain"
        />

        <!-- TEXT -->
        <div
          class="text-left"
        >
          <h1
            class="text-[2.1rem] font-black text-white leading-none"
          >
            BRAINDRILL
          </h1>

          <p
            class="mt-1 text-black text-xs font-bold leading-4"
          >
            Answer as many questions as possible
            before time runs out.
          </p>
        </div>
      </div>

      <!-- RUN SCORE -->
      <div
        class="mt-4"
      >
        <div
          class="bg-[#F3F400] border-4 border-black rounded-2xl py-3 text-center"
        >
          <p
            class="text-[9px] font-black text-black/70"
          >
            TOTAL RUN SCORE
          </p>

          <h2
            class="mt-1 text-3xl font-black text-black leading-none min-h-[36px]"
          >
            <span
              v-if="
                !loadingScore
              "
            >
              {{
                displayScore
              }}
            </span>
          </h2>
        </div>
      </div>

      <!-- LEVELS -->
      <div
        class="mt-6 flex flex-col gap-3"
      >
        <button
          v-for="level in braindrillLevels"
          :key="level.level"
          @click="
            startLevel(level)
          "
          :disabled="
            level.level >
            unlockedLevel
          "
          class="w-full border-4 border-black rounded-[2rem] px-4 py-4 flex items-center justify-between transition-all duration-100"
          :class="[
            level.level >
            unlockedLevel
              ? 'bg-gray-300 opacity-60 cursor-not-allowed'
              : level.color || 'bg-white',
          ]"
        >
          <!-- LEFT -->
          <div
            class="flex items-center gap-3"
          >
            <!-- LEVEL NUMBER -->
            <div
              class="w-11 h-11 rounded-[1rem] border-4 border-black flex items-center justify-center font-black text-lg bg-[#FD9501] shrink-0"
            >
              {{ level.level }}
            </div>

            <!-- INFO -->
            <div
              class="text-left"
            >
              <h2
                class="text-lg font-black text-black leading-none"
              >
                LEVEL
                {{ level.level }}
              </h2>

              <p
                class="mt-1 text-xs font-bold text-black/70 leading-4"
              >
                {{ level.questions }}
                Questions •

                {{ level.time }}s
              </p>
            </div>
          </div>

          <!-- RIGHT -->
          <div
            class="flex items-center gap-1.5 shrink-0"
          >
            <!-- PASS -->
            <div
              class="bg-[#FF2AA3]/20 border-2 border-[#FF2AA3] rounded-lg px-2 py-1.5 text-center min-w-[58px]"
            >
              <p
                class="text-[8px] font-black text-[#FF2AA3]/70 leading-none"
              >
                PASS
              </p>

              <p
                class="mt-1 text-sm font-black text-[#FF2AA3] leading-none"
              >
                {{
                  level.requiredCorrect
                }}
              </p>
            </div>

            <!-- REWARD -->
            <div
              class="bg-[#FF2AA3]/20 border-2 border-[#FF2AA3] rounded-lg px-2 py-1.5 text-center min-w-[58px]"
            >
              <p
                class="text-[8px] font-black text-[#FF2AA3]/70 leading-none"
              >
                REWARD
              </p>

              <p
                class="mt-1 text-sm font-black text-[#FF2AA3] leading-none"
              >
                +{{
                  level.points
                }}
              </p>
            </div>
          </div>
        </button>
      </div>
    </section>

    <BottomNavbar />
  </main>
</template>