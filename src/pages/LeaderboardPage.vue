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

import TimeWatch from '../components/TimeWatch.vue'

import PointLeader from '../components/PointLeader.vue'

import LeagueCalculator from '../components/LeagueCalculator.vue'

const leaderboard =
  ref([])

const loading =
  ref(true)

const currentLeague =
  ref('')

const showWinnerModal =
  ref(false)

const weeklyWinner =
  ref(null)

/* -----------------------------
   CURRENT USER
----------------------------- */

const username =
  localStorage.getItem(
    'examinity_username',
  )

/* -----------------------------
   FETCH LEADERBOARD
----------------------------- */

const fetchLeaderboard =
  async () => {
    const {
      data: currentUser,
    } = await supabase
      .from(
        'examinity_leaderboard',
      )
      .select(
        'league',
      )
      .eq(
        'username',
        username,
      )
      .single()

    if (
      currentUser
    ) {
      currentLeague.value =
        currentUser.league
    }

    const {
      data,
      error,
    } = await supabase
      .from(
        'examinity_leaderboard',
      )
      .select('*')
      .eq(
        'league',
        currentLeague.value,
      )

    if (
      !error &&
      data
    ) {
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

      updatedData.sort(
        (a, b) =>
          b.total_score -
          a.total_score,
      )

      leaderboard.value =
        updatedData
    }

    loading.value =
      false
  }

/* -----------------------------
   ANNOUNCE WINNER
----------------------------- */

const announceWinner =
  async () => {
    const {
      data,
    } = await supabase
      .from(
        'examinity_leaderboard',
      )
      .select('*')
      .eq(
        'league',
        currentLeague.value,
      )
      .order(
        'challenge_points',
        {
          ascending: false,
        },
      )
      .limit(1)
      .single()

    if (data) {
      weeklyWinner.value =
        data

      showWinnerModal.value =
        true
    }
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
    class="min-h-screen bg-[#03B5EC] pb-28"
  >
    <!-- SILENT LEAGUE CALCULATOR -->
    <LeagueCalculator />

    <!-- HEADER BOX -->
    <div
      class="bg-[#F3F400] border-b-4 border-black px-4 pt-6 pb-5 text-center w-full"
    >
      <!-- TITLE -->
      <h1
        class="text-2xl font-black text-black leading-none"
      >
        LEADERBOARD
      </h1>

      <!-- LEAGUE -->
      <div
        class="mt-4"
      >
        <p
          class="text-[10px] font-black text-black/50 uppercase"
        >
          Current League
        </p>

        <h2
          class="mt-1 text-[1rem] font-black text-black leading-tight"
        >
          {{
            currentLeague
          }}
        </h2>
      </div>

      <!-- TIMER -->
      <div
        class="mt-4"
      >
        <TimeWatch
          @time-up="
            announceWinner
          "
        />
      </div>
    </div>

    <section
      class="px-4 pt-5"
    >
      <!-- LOADING -->
      <AppLoader
        v-if="loading"
      />

      <!-- EMPTY -->
      <div
        v-else-if="
          leaderboard.length === 0
        "
        class="mt-2 bg-white border-4 border-black rounded-[2rem] p-6 text-center"
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
          QuizBere.
        </p>
      </div>

      <!-- LEADERBOARD -->
      <div
        v-else
        class="flex flex-col gap-3"
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
          :class="[
            index >= 6
              ? 'bg-[#FF2AA3] text-white'
              : 'bg-white',

            'border-4 border-black rounded-2xl pl-3 pr-5 py-3 grid grid-cols-[20%_80%] gap-2 items-center',
          ]"
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
              :class="[
                index >= 6
                  ? 'text-white'
                  : 'text-black',

                'text-base font-black truncate',
              ]"
            >
              {{
                player.username
              }}
            </h2>

            <!-- LEVEL + SCORE -->
            <div
              class="mt-1 flex items-center justify-between gap-4"
            >
              <p
                :class="[
                  index >= 6
                    ? 'text-white/80'
                    : 'text-black/60',

                  'text-[12px] font-black',
                ]"
              >
                LEVEL
                {{
                  player.highest_level
                }}
              </p>

              <p
                :class="[
                  index >= 6
                    ? 'text-white'
                    : 'text-[#FF2AA3]',

                  'text-[12px] font-black shrink-0',
                ]"
              >
                SCORE
                {{
                  player.total_score
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- WINNER MODAL -->
<PointLeader
  :show="
    showWinnerModal
  "
  :winner="
    weeklyWinner
  "
  @close="
    showWinnerModal = false
  "
/>

    <!-- NAVBAR -->
    <BottomNavbar />
  </main>
</template>