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
  ref(1)

/* -----------------------------
   SCORE
----------------------------- */

const runScore =
  ref(0)

/* -----------------------------
   LOAD USER LEVEL
----------------------------- */

const loadUserLevel =
  async () => {
    try {
      const localLevel =
        Number(
          localStorage.getItem(
            'braindrill_unlocked_level',
          ),
        ) || 1

      unlockedLevel.value =
        localLevel

      const {
        data: user,
      } = await supabase
        .from(
          'examinity_users',
        )
        .select(
          'braindrill_level',
        )
        .eq(
          'username',
          username,
        )
        .maybeSingle()

      const dbLevel =
        user?.braindrill_level ||
        1

      const highestLevel =
        Math.max(
          localLevel,
          dbLevel,
        )

      unlockedLevel.value =
        highestLevel

      localStorage.setItem(
        'braindrill_unlocked_level',
        highestLevel,
      )

      if (
        highestLevel >
        dbLevel
      ) {
        await supabase
          .from(
            'examinity_users',
          )
          .update({
            braindrill_level:
              highestLevel,
          })
          .eq(
            'username',
            username,
          )
      }
    } catch (error) {
      console.error(error)
    }
  }

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

      const localLevel =
        Number(
          localStorage.getItem(
            'braindrill_unlocked_level',
          ),
        ) || 1

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
            localLevel,
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

        await supabase
          .from(
            'examinity_users',
          )
          .update({
            braindrill_level:
              highestLevel,
          })
          .eq(
            'username',
            username,
          )

        runScore.value =
          updatedScore

        unlockedLevel.value =
          highestLevel
      } else {
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
                localLevel,
            },
          ])

        await supabase
          .from(
            'examinity_users',
          )
          .update({
            braindrill_level:
              localLevel,
          })
          .eq(
            'username',
            username,
          )

        runScore.value =
          localRunScore

        unlockedLevel.value =
          localLevel
      }

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

onMounted(async () => {
  await loadUserLevel()

  await loadRunScore()
})
</script>

<template>
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
            class="mt-1 text-3xl font-black text-black leading-none"
          >
            {{ runScore }}
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