<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'

import { Vue3Lottie } from 'vue3-lottie'

import { supabase } from '../lib/supabase'

import BottomNavbar from '../components/BottomNavbar.vue'

import winnerBadge from '../assets/lottie/winner_badge.json'

import { playSound } from '../utils/playSound'

import AppLoader from '../components/AppLoader.vue'

const leaderboard = ref([])

const loading = ref(true)

/* -----------------------------
   FETCH LEADERBOARD
----------------------------- */

const fetchLeaderboard =
  async () => {
    const {
      data,
      error,
    } = await supabase
      .from(
        'examinity_leaderboard',
      )
      .select('*')

    if (
      !error &&
      data
    ) {
      /* COMBINE SCORES */

      const updatedData =
        data.map(
          (player) => ({
            ...player,

            total_score:
              (player.best_run_score ||
                0) +
              (player.challenge_points ||
                0),
          }),
        )

      /* SORT */

      updatedData.sort(
        (a, b) =>
          b.total_score -
          a.total_score,
      )

      leaderboard.value =
        updatedData.slice(
          0,
          50,
        )
    }

    loading.value = false
  }

/* -----------------------------
   MOUNT
----------------------------- */

onMounted(() => {
  playSound('pass')

  fetchLeaderboard()
})
</script>

<template>
  <main
    class="min-h-screen bg-[#03B5EC] pb-28 px-4 pt-5"
  >
    <section
      class="max-w-md mx-auto"
    >
      <!-- HEADER -->
      <div
        class="text-center"
      >
        <h1
          class="text-3xl font-black text-white"
        >
          LEADERBOARD
        </h1>
      </div>

      <!-- LOADING -->
      <AppLoader
        v-if="loading"
      />

      <!-- EMPTY -->
      <div
        v-else-if="
          leaderboard.length === 0
        "
        class="mt-6 bg-white border-4 border-black rounded-[2rem] p-6 text-center"
      >
        <h2
          class="text-2xl font-black text-black"
        >
          NO SCORES YET
        </h2>

        <p
          class="mt-2 text-xs font-bold text-black/60"
        >
          Be the first to dominate
          Quizbere.
        </p>
      </div>

      <!-- LEADERBOARD -->
      <div
        v-else
        class="mt-6 flex flex-col gap-3"
      >
        <!-- #1 PLAYER -->
        <div
          v-if="leaderboard[0]"
          class="bg-[#F3F400] border-4 border-black rounded-[2rem] px-4 py-4 shadow-[0_6px_0_#000]"
        >
          <div
            class="flex items-center gap-3"
          >
            <!-- LEFT -->
            <div
              class="w-[80px] flex justify-center shrink-0"
            >
              <Vue3Lottie
                :animationData="
                  winnerBadge
                "
                :height="70"
                :width="70"
              />
            </div>

            <!-- RIGHT -->
            <div
              class="flex-1 min-w-0 pr-2"
            >
              <!-- TOP -->
              <div
                class="flex items-center justify-between gap-2"
              >
                <p
                  class="text-xs font-black text-black/60"
                >
                  #1 PLAYER
                </p>

                <p
                  class="text-xs font-black text-black/60 shrink-0"
                >
                  LVL
                  {{
                    leaderboard[0]
                      .highest_level
                  }}
                </p>
              </div>

              <!-- NAME -->
              <h2
                class="mt-1 text-2xl font-black text-black truncate"
              >
                {{
                  leaderboard[0]
                    .username
                }}
              </h2>

              <!-- SCORE -->
              <div
                class="mt-3 bg-white border-4 border-black rounded-2xl py-3 text-center"
              >
                <p
                  class="text-[9px] font-black text-[#FF2AA3]"
                >
                  TOTAL SCORE
                </p>

                <h3
                  class="mt-1 text-3xl font-black text-black leading-none"
                >
                  {{
                    leaderboard[0]
                      .total_score
                  }}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <!-- OTHER PLAYERS -->
        <div
          v-for="(
            player,
            index
          ) in leaderboard.slice(1)"
          :key="player.id"
          class="bg-white border-4 border-black rounded-2xl pl-3 pr-5 py-3 grid grid-cols-[20%_80%] gap-2 items-center"
        >
          <!-- POSITION -->
          <div
            class="flex justify-center"
          >
            <div
              class="w-12 h-12 rounded-xl bg-[#F3F400] border-4 border-black flex items-center justify-center"
            >
              <span
                class="text-sm font-black text-black"
              >
                #{{
                  index + 2
                }}
              </span>
            </div>
          </div>

          <!-- RIGHT -->
          <div
            class="min-w-0 pr-2"
          >
            <!-- NAME -->
            <h2
              class="text-base font-black text-black truncate"
            >
              {{
                player.username
              }}
            </h2>

            <!-- SCORE + LEVEL -->
            <div
              class="mt-1 flex items-center justify-between gap-4"
            >
              <p
                class="text-[12px] font-black text-[#FF2AA3]"
              >
                SCORE
                {{
                  player.total_score
                }}
              </p>

              <p
                class="text-[12px] font-black text-black/60 shrink-0"
              >
                LEVEL
                {{
                  player.highest_level
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