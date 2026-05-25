<script setup>
import {
  onMounted,
  ref,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import { supabase } from '../lib/supabase'

import BottomNavbar from '../components/BottomNavbar.vue'

import { braindrillLevels } from '../data/braindrillLevels'

import {
  trackGame,
} from '../utils/trackGame'

import {
  playSound,
} from '../utils/playSound'

const router = useRouter()

/* -----------------------------
   USERNAME
----------------------------- */

const username =
  localStorage.getItem(
    'examinity_username',
  ) || 'anonymous'

/* -----------------------------
   LEVEL
----------------------------- */

const unlockedLevel =
  Number(
    localStorage.getItem(
      'braindrill_unlocked_level',
    ),
  ) || 1

/* -----------------------------
   SCORE
----------------------------- */

const runScore =
  ref(0)

/* -----------------------------
   LOAD + SAVE SCORE
----------------------------- */

const loadRunScore =
  async () => {
    try {
      const localRunScore =
        Number(
          localStorage.getItem(
            'braindrill_run_score',
          ),
        ) || 0

      const {
        data: existingUser,
      } = await supabase
        .from(
          'examinity_leaderboard',
        )
        .select(
          'best_run_score, highest_level',
        )
        .eq(
          'username',
          username,
        )
        .maybeSingle()

      /* EXISTING USER */

      if (existingUser) {
        const updatedScore =
          (
            existingUser.best_run_score ||
            0
          ) +
          localRunScore

        const highestLevel =
          Math.max(
            existingUser.highest_level ||
              1,
            unlockedLevel,
          )

        await supabase
          .from(
            'examinity_leaderboard',
          )
          .update({
            best_run_score:
              updatedScore,

            highest_level:
              highestLevel,
          })
          .eq(
            'username',
            username,
          )

        runScore.value =
          updatedScore
      }

      /* NEW USER */

      else {
        await supabase
          .from(
            'examinity_leaderboard',
          )
          .insert([
            {
              username,

              best_run_score:
                localRunScore,

              highest_level:
                unlockedLevel,
            },
          ])

        runScore.value =
          localRunScore
      }

      /* CLEAR LOCAL */

      localStorage.removeItem(
        'braindrill_run_score',
      )
    } catch (error) {
      console.error(error)
    }
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
      unlockedLevel
    )
      return

    playSound('button')

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
  loadRunScore()
})
</script>

<template>
  <main
    class="min-h-screen bg-[#03B5EC] pb-28 px-5 pt-8"
  >
    <section
      class="max-w-md mx-auto"
    >
      <!-- HEADER -->
      <div class="text-center">
        <h1
          class="text-5xl font-black text-white"
        >
          BRAINDRILL
        </h1>

        <p
          class="mt-3 text-black text-base font-bold leading-6"
        >
          Answer as many questions as possible
          before time runs out.
        </p>

        <!-- RUN SCORE -->
        <div
          class="mt-6"
        >
          <div
            class="bg-[#F3F400] border-4 border-black rounded-2xl py-4 text-center"
          >
            <p
              class="text-[10px] font-black text-black/70"
            >
              TOTAL RUN SCORE
            </p>

            <h2
              class="mt-2 text-4xl font-black text-black leading-none"
            >
              {{ runScore }}
            </h2>
          </div>
        </div>
      </div>

      <!-- LEVELS -->
      <div
        class="mt-10 flex flex-col gap-4"
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
          class="w-full border-4 border-black rounded-3xl px-5 py-5 flex items-center justify-between transition-all duration-100"
          :class="[
            level.level >
            unlockedLevel
              ? 'bg-gray-300 opacity-60 cursor-not-allowed'
              : 'bg-white active:translate-y-[3px]',
          ]"
        >
          <!-- LEFT -->
          <div
            class="flex items-center gap-4"
          >
            <div
              class="w-14 h-14 rounded-2xl border-4 border-black flex items-center justify-center font-black text-xl"
              :class="[
                level.level >
                unlockedLevel
                  ? 'bg-gray-400'
                  : 'bg-[#FD9501]',
              ]"
            >
              {{ level.level }}
            </div>

            <div
              class="text-left"
            >
              <h2
                class="text-xl font-black text-black"
              >
                LEVEL
                {{ level.level }}
              </h2>

              <p
                class="text-sm font-bold text-black/70"
              >
                {{ level.questions }}
                Questions •

                {{ level.time }}s
              </p>
            </div>
          </div>

          <!-- REQUIREMENT -->
          <div
            class="bg-[#FF2AA3]/20 border-2 border-[#FF2AA3] rounded-xl px-3 py-2"
          >
            <p
              class="text-xs font-black text-[#FF2AA3]"
            >
              {{
                level.requiredCorrect
              }}
              CORRECT
            </p>
          </div>
        </button>
      </div>
    </section>

    <BottomNavbar />
  </main>
</template>