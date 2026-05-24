<script setup>
import {
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
      .order(
        'best_run_score',
        {
          ascending: false,
        },
      )
      .limit(50)

    if (
      !error &&
      data
    ) {
      leaderboard.value =
        data
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
          LEADERBOARD
        </h1>

        <p
          class="mt-4 text-black text-base font-bold leading-6"
        >
          Top BrainDrill players.
        </p>
      </div>

      <!-- LOADING -->
      <AppLoader v-if="loading" />

      <!-- EMPTY -->
      <div
        v-else-if="
          leaderboard.length === 0
        "
        class="mt-10 bg-white border-4 border-black rounded-[2rem] p-8 text-center"
      >
        <h2
          class="text-3xl font-black text-black"
        >
          NO SCORES YET
        </h2>

        <p
          class="mt-3 text-sm font-bold text-black/60"
        >
          Be the first to dominate
          BrainDrill.
        </p>
      </div>

      <!-- LEADERBOARD -->
      <div
        v-else
        class="mt-10 flex flex-col gap-4"
      >
        <!-- FIRST PLACE -->
        <div
          v-if="leaderboard[0]"
          class="bg-[#F3F400] border-4 border-black rounded-[2.5rem] p-6 shadow-[0_8px_0_#000] text-center"
        >
          <!-- BADGE -->
          <div
            class="flex justify-center"
          >
            <Vue3Lottie
              :animationData="
                winnerBadge
              "
              :height="120"
              :width="120"
            />
          </div>

          <!-- TITLE -->
          <p
            class="-mt-2 text-sm font-black text-black/70"
          >
            #1 PLAYER
          </p>

          <!-- NAME -->
          <h2
            class="mt-2 text-3xl font-black text-black break-words"
          >
            {{
              leaderboard[0]
                .username
            }}
          </h2>

          <!-- LEVEL -->
          <p
            class="mt-2 text-lg font-black text-black/70"
          >
            LEVEL
            {{
              leaderboard[0]
                .highest_level
            }}
          </p>

          <!-- SCORE -->
          <div
            class="mt-5 bg-white border-4 border-black rounded-3xl py-5"
          >
            <p
              class="text-sm font-black text-[#FF2AA3]"
            >
              BEST RUN
            </p>

            <h3
              class="mt-2 text-5xl font-black text-black"
            >
              {{
                leaderboard[0]
                  .best_run_score
              }}
            </h3>
          </div>
        </div>

        <!-- OTHER PLAYERS -->
        <div
          v-for="(
            player,
            index
          ) in leaderboard.slice(1)"
          :key="player.id"
          class="bg-white border-4 border-black rounded-3xl px-5 py-5 flex items-center justify-between"
        >
          <!-- LEFT -->
          <div
            class="flex items-center gap-4"
          >
            <!-- RANK -->
            <div
              class="w-16 h-16 rounded-2xl bg-[#F3F400] border-4 border-black flex items-center justify-center"
            >
              <span
                class="text-xl font-black text-black"
              >
                #{{
                  index + 2
                }}
              </span>
            </div>

            <!-- USER -->
            <div>
              <h2
                class="text-xl font-black text-black"
              >
                {{
                  player.username
                }}
              </h2>

              <p
                class="text-sm font-bold text-black/60"
              >
                Level
                {{
                  player.highest_level
                }}
              </p>
            </div>
          </div>

          <!-- SCORE -->
          <div
            class="bg-[#FF2AA3]/15 border-2 border-[#FF2AA3] rounded-2xl px-4 py-3 text-center"
          >
            <p
              class="text-[10px] font-black text-[#FF2AA3]"
            >
              BEST RUN
            </p>

            <h3
              class="mt-1 text-2xl font-black text-black"
            >
              {{
                player.best_run_score
              }}
            </h3>
          </div>
        </div>
      </div>
    </section>

    <!-- NAVBAR -->
    <BottomNavbar />
  </main>
</template>