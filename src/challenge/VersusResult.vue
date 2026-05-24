```vue id="d7w1mq"
<script setup>
import { Vue3Lottie } from 'vue3-lottie'

import { supabase } from '../lib/supabase'

import { playSound } from '../utils/playSound'

import winnerCup from '../assets/lottie/winner_cup.json'

import failedCup from '../assets/lottie/failed_cup.json'

const props =
  defineProps({
    match: Object,
  })

const emit =
  defineEmits([
    'refresh',
  ])

const username =
  localStorage.getItem(
    'examinity_username',
  ) || 'anonymous'

const didWin =
  props.match.winner ===
  username

/* -----------------------------
   CLOSE MATCH
----------------------------- */

const closeMatch =
  async () => {
    playSound('button')

    /* -----------------------------
       GIVE 10 CHALLENGE POINTS
    ----------------------------- */

    if (didWin) {
      /* GET CURRENT */

      const {
        data: userData,
      } = await supabase
        .from(
          'examinity_leaderboard',
        )
        .select(
          'challenge_points',
        )
        .eq(
          'username',
          username,
        )
        .maybeSingle()

      const currentPoints =
        userData
          ?.challenge_points ||
        0

      /* UPDATE */

      await supabase
        .from(
          'examinity_leaderboard',
        )
        .update({
          challenge_points:
            currentPoints +
            10,
        })
        .eq(
          'username',
          username,
        )
    }

    /* DELETE MATCH */

    await supabase
      .from(
        'versus_matches',
      )
      .delete()
      .eq(
        'id',
        props.match.id,
      )

    emit('refresh')
  }
</script>

<template>
  <section
    class="min-h-screen flex items-center justify-center px-4 py-6"
  >
    <div
      class="w-full max-w-md text-center"
    >
      <!-- TOP -->
      <div
        class="flex flex-col items-center"
      >
        <!-- LOTTIE HOLDER -->
        <div
          class="w-[220px] h-[220px] flex items-center justify-center"
        >
          <!-- WIN -->
          <Vue3Lottie
            v-if="didWin"
            :animationData="winnerCup"
            :height="220"
            :width="220"
          />

          <!-- LOSE -->
          <Vue3Lottie
            v-else
            :animationData="failedCup"
            :height="220"
            :width="220"
          />
        </div>

        <!-- TITLE -->
        <h1
          class="text-5xl font-black"
          :class="
            didWin
              ? 'text-[#F3F400]'
              : 'text-[#FF2AA3]'
          "
        >
          {{
            didWin
              ? 'YOU WON!'
              : 'YOU LOST!'
          }}
        </h1>
      </div>

      <!-- WINNER CARD -->
      <div
        class="mt-6 bg-white border-4 border-black rounded-[2rem] p-6"
      >
        <p
          class="text-sm font-black text-black/50"
        >
          WINNER
        </p>

        <h2
          class="mt-3 text-4xl font-black text-[#03B5EC] break-words"
        >
          {{
            props.match.winner
          }}
        </h2>
      </div>

      <!-- POINTS -->
      <div
        v-if="didWin"
        class="mt-4 bg-[#F3F400] border-4 border-black rounded-[2rem] p-5"
      >
        <p
          class="text-sm font-black text-black/60"
        >
          REWARD
        </p>

        <h2
          class="mt-2 text-4xl font-black text-black"
        >
          +10 POINTS
        </h2>
      </div>

      <!-- BUTTON -->
      <button
        @click="
          closeMatch
        "
        class="mt-6 w-full bg-[#FD9501] border-4 border-black rounded-2xl py-5 text-xl font-black text-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000] transition-all duration-100"
      >
        CLOSE MATCH
      </button>
    </div>
  </section>
</template>
```
