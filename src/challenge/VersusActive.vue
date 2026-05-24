<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import { supabase } from '../lib/supabase'

import { playSound } from '../utils/playSound'

const props =
  defineProps({
    match: Object,
  })

const emit =
  defineEmits([
    'refresh',
  ])

const router =
  useRouter()

const username =
  localStorage.getItem(
    'examinity_username',
  ) || 'anonymous'

const loading =
  ref(false)

const playerOnePoints =
  ref(0)

const playerTwoPoints =
  ref(0)

let interval = null

/* -----------------------------
   OPPONENT
----------------------------- */

const opponent =
  computed(() => {
    return props.match
      .player_one ===
      username
      ? props.match
          .player_two
      : props.match
          .player_one
  })

/* -----------------------------
   TIME LEFT
----------------------------- */

const timeLeft =
  computed(() => {
    const now =
      new Date()

    const end =
      new Date(
        props.match.ends_at,
      )

    const diff =
      end - now

    if (diff <= 0) {
      return 'MATCH OVER'
    }

    const hours =
      Math.floor(
        diff /
          (1000 *
            60 *
            60),
      )

    const minutes =
      Math.floor(
        (diff %
          (1000 *
            60 *
            60)) /
          (1000 * 60),
      )

    return `${hours}H ${minutes}M`
  })

/* -----------------------------
   FETCH SCORES
----------------------------- */

const fetchScores =
  async () => {
    const { data } =
      await supabase
        .from(
          'examinity_leaderboard',
        )
        .select(
          'username, challenge_points',
        )

    const p1 = data.find(
      (item) =>
        item.username ===
        props.match
          .player_one,
    )

    const p2 = data.find(
      (item) =>
        item.username ===
        props.match
          .player_two,
    )

    playerOnePoints.value =
      p1
        ?.challenge_points ||
      0

    playerTwoPoints.value =
      p2
        ?.challenge_points ||
      0

    checkWinner()
  }

/* -----------------------------
   CHECK WINNER
----------------------------- */

const checkWinner =
  async () => {
    const now =
      new Date()

    const end =
      new Date(
        props.match.ends_at,
      )

    if (now < end)
      return

    let winner =
      'draw'

    if (
      playerOnePoints.value >
      playerTwoPoints.value
    ) {
      winner =
        props.match
          .player_one
    }

    if (
      playerTwoPoints.value >
      playerOnePoints.value
    ) {
      winner =
        props.match
          .player_two
    }

    await supabase
      .from(
        'versus_matches',
      )
      .update({
        status:
          'completed',

        winner,
      })
      .eq(
        'id',
        props.match.id,
      )

    emit('refresh')
  }

/* -----------------------------
   EARN POINTS
----------------------------- */

const earnPoints =
  () => {
    playSound('button')

    router.push(
      '/challenge',
    )
  }

/* -----------------------------
   GIVE UP
----------------------------- */

const giveUp =
  async () => {
    playSound('fail')

    loading.value = true

    await supabase
      .from(
        'versus_matches',
      )
      .update({
        status:
          'completed',

        winner:
          opponent.value,
      })
      .eq(
        'id',
        props.match.id,
      )

    loading.value = false

    emit('refresh')
  }

/* -----------------------------
   MOUNT
----------------------------- */

onMounted(() => {
  fetchScores()

  interval =
    setInterval(() => {
      fetchScores()
    }, 10000)
})

onBeforeUnmount(() => {
  clearInterval(interval)
})
</script>

<template>
  <!-- FULL SCREEN ROOT -->
  <section
    class="fixed inset-0 overflow-y-auto bg-[#101010] text-white"
  >
    <!-- CONTENT -->
    <div
      class="w-full max-w-sm mx-auto px-4 py-5 pb-36"
    >
      <!-- HEADER -->
      <div
        class="flex items-start justify-between gap-3"
      >
        <!-- LEFT -->
        <div>
          <p
            class="text-[10px] uppercase tracking-[0.25em] text-white/40 font-bold"
          >
            Live Match
          </p>

          <h1
            class="mt-1 text-3xl font-black leading-none"
          >
            VERSUS
          </h1>
        </div>

        <!-- TIMER -->
        <div
          class="bg-[#1D1D1D] rounded-2xl px-4 py-3 border border-white/10 shrink-0"
        >
          <p
            class="text-[9px] uppercase text-white/40 font-bold text-center"
          >
            Remaining
          </p>

          <p
            class="mt-1 text-sm font-black text-center"
          >
            {{
              timeLeft
            }}
          </p>
        </div>
      </div>

      <!-- MATCH CARD -->
      <div
        class="mt-6 bg-[#181818] border border-white/10 rounded-[2rem] p-5"
      >
        <!-- PLAYER ONE -->
        <div
          class="flex items-center justify-between gap-4"
        >
          <!-- INFO -->
          <div
            class="min-w-0"
          >
            <p
              class="text-[10px] uppercase text-white/40 font-bold"
            >
              PLAYER ONE
            </p>

            <h2
              class="mt-1 text-xl font-black truncate"
            >
              {{
                props.match
                  .player_one
              }}
            </h2>
          </div>

          <!-- SCORE -->
          <div
            class="w-[88px] h-[88px] rounded-3xl bg-[#222222] flex flex-col items-center justify-center shrink-0"
          >
            <p
              class="text-[9px] uppercase text-white/40 font-bold"
            >
              Score
            </p>

            <h3
              class="mt-1 text-4xl font-black text-[#67E8F9]"
            >
              {{
                playerOnePoints
              }}
            </h3>
          </div>
        </div>

        <!-- VS -->
        <div
          class="py-5 flex justify-center"
        >
          <div
            class="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center text-lg font-black"
          >
            VS
          </div>
        </div>

        <!-- PLAYER TWO -->
        <div
          class="flex items-center justify-between gap-4"
        >
          <!-- INFO -->
          <div
            class="min-w-0"
          >
            <p
              class="text-[10px] uppercase text-white/40 font-bold"
            >
              PLAYER TWO
            </p>

            <h2
              class="mt-1 text-xl font-black truncate"
            >
              {{
                props.match
                  .player_two
              }}
            </h2>
          </div>

          <!-- SCORE -->
          <div
            class="w-[88px] h-[88px] rounded-3xl bg-[#222222] flex flex-col items-center justify-center shrink-0"
          >
            <p
              class="text-[9px] uppercase text-white/40 font-bold"
            >
              Score
            </p>

            <h3
              class="mt-1 text-4xl font-black text-[#FF82D8]"
            >
              {{
                playerTwoPoints
              }}
            </h3>
          </div>
        </div>
      </div>

      <!-- BUTTONS -->
      <div
        class="mt-5 flex flex-col gap-3"
      >
        <!-- EARN -->
        <button
          @click="earnPoints"
          class="h-[56px] rounded-2xl bg-white text-black text-base font-black active:scale-[0.98] transition-all duration-100"
        >
          Earn More Points
        </button>

        <!-- GIVE UP -->
        <button
          @click="giveUp"
          :disabled="loading"
          class="h-[56px] rounded-2xl bg-[#262626] border border-white/10 text-white text-base font-black active:scale-[0.98] transition-all duration-100"
        >
          {{
            loading
              ? 'Leaving Match...'
              : 'Give Up'
          }}
        </button>
      </div>
    </div>
  </section>
</template>