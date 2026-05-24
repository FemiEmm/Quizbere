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

const playerOnePoints =
  ref(0)

const playerTwoPoints =
  ref(0)

const loading =
  ref(false)

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

    const days =
      Math.floor(
        diff /
          (1000 *
            60 *
            60 *
            24),
      )

    const hours =
      Math.floor(
        (diff %
          (1000 *
            60 *
            60 *
            24)) /
          (1000 *
            60 *
            60),
      )

    return `${days}D ${hours}H LEFT`
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
      (p) =>
        p.username ===
        props.match
          .player_one,
    )

    const p2 = data.find(
      (p) =>
        p.username ===
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

    if (now < end) return

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

    const winner =
      opponent.value

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
  <section
    class="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-6"
  >
    <!-- SPLIT BACKGROUND -->
    <div
      class="absolute inset-0 flex"
    >
      <!-- LEFT -->
      <div
        class="flex-1 bg-[#03B5EC]"
      />

      <!-- CENTER LINE -->
      <div
        class="w-5 bg-black"
      />

      <!-- RIGHT -->
      <div
        class="flex-1 bg-[#FF2AA3]"
      />
    </div>

    <!-- CONTENT -->
    <div
      class="relative z-10 w-full max-w-md"
    >
      <!-- TOP -->
      <div
        class="text-center flex flex-col items-center"
      >
        <!-- VERSUS -->
        <div
          class="bg-[#F3F400] border-4 border-black rounded-2xl px-8 py-4 shadow-[0_6px_0_#000]"
        >
          <h1
            class="text-5xl font-black text-black leading-none"
          >
            VERSUS
          </h1>
        </div>

        <!-- TIME -->
        <div
          class="mt-4 bg-white border-4 border-black rounded-2xl px-6 py-4 shadow-[0_6px_0_#000]"
        >
          <p
            class="text-[10px] font-black text-black/50 leading-none"
          >
            TIME LEFT
          </p>

          <p
            class="mt-2 text-2xl font-black text-black leading-none"
          >
            {{
              timeLeft
            }}
          </p>
        </div>
      </div>

      <!-- BATTLE AREA -->
      <div
        class="mt-10 flex items-center justify-between gap-4"
      >
        <!-- PLAYER ONE -->
        <div
          class="flex-1 text-center"
        >
          <!-- NAME -->
          <div
            class="bg-white border-4 border-black rounded-2xl px-3 py-3"
          >
            <h2
              class="text-lg font-black text-black break-words"
            >
              {{
                props.match
                  .player_one
              }}
            </h2>
          </div>

          <!-- SCORE -->
          <div
            class="mt-4 bg-white border-4 border-black rounded-[2rem] py-8 px-2 shadow-[0_8px_0_#000]"
          >
            <p
              class="text-[10px] font-black text-black/50"
            >
              SCORE
            </p>

            <h3
              class="mt-2 text-6xl font-black text-[#03B5EC] leading-none"
            >
              {{
                playerOnePoints
              }}
            </h3>
          </div>
        </div>

        <!-- VS -->
        <div
          class="shrink-0"
        >
          <div
            class="w-20 h-20 rounded-full bg-[#F3F400] border-4 border-black flex items-center justify-center shadow-[0_6px_0_#000]"
          >
            <span
              class="text-3xl font-black text-black"
            >
              VS
            </span>
          </div>
        </div>

        <!-- PLAYER TWO -->
        <div
          class="flex-1 text-center"
        >
          <!-- NAME -->
          <div
            class="bg-white border-4 border-black rounded-2xl px-3 py-3"
          >
            <h2
              class="text-lg font-black text-black break-words"
            >
              {{
                props.match
                  .player_two
              }}
            </h2>
          </div>

          <!-- SCORE -->
          <div
            class="mt-4 bg-white border-4 border-black rounded-[2rem] py-8 px-2 shadow-[0_8px_0_#000]"
          >
            <p
              class="text-[10px] font-black text-black/50"
            >
              SCORE
            </p>

            <h3
              class="mt-2 text-6xl font-black text-[#FF2AA3] leading-none"
            >
              {{
                playerTwoPoints
              }}
            </h3>
          </div>
        </div>
      </div>

      <!-- EARN POINTS -->
      <button
        @click="earnPoints"
        class="mt-8 w-full bg-[#F3F400] border-4 border-black rounded-2xl py-5 text-black text-xl font-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000] transition-all duration-100"
      >
        EARN POINTS
      </button>

      <!-- GIVE UP -->
      <button
        @click="giveUp"
        :disabled="loading"
        class="mt-4 w-full bg-black border-4 border-black rounded-2xl py-5 text-white text-xl font-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000] transition-all duration-100"
      >
        {{
          loading
            ? 'LEAVING...'
            : 'I GIVE UP!'
        }}
      </button>
    </div>
  </section>
</template>