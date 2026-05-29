<script setup>
import {
  computed,
  ref,
} from 'vue'

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
  (
    localStorage.getItem(
      'examinity_username',
    ) || 'anonymous'
  )
    .trim()
    .toUpperCase()

const loading =
  ref(false)

const message =
  ref('')

/* -----------------------------
   RESULT STATE
----------------------------- */

const isDraw =
  computed(() => {
    return (
      props.match?.winner ===
      'draw'
    )
  })

const didWin =
  computed(() => {
    return (
      props.match?.winner ===
      username
    )
  })

const rewardCp =
  computed(() => {
    return Number(
      props.match?.reward_cp,
    ) || 0
  })

const playerOneScore =
  computed(() => {
    return Number(
      props.match?.player_one_score,
    ) || 0
  })

const playerTwoScore =
  computed(() => {
    return Number(
      props.match?.player_two_score,
    ) || 0
  })

const isPlayerOne =
  computed(() => {
    return (
      String(
        props.match?.player_one ||
          '',
      )
        .trim()
        .toUpperCase() ===
      username
    )
  })

const isPlayerTwo =
  computed(() => {
    return (
      String(
        props.match?.player_two ||
          '',
      )
        .trim()
        .toUpperCase() ===
      username
    )
  })

const otherPlayerAlreadyClosed =
  computed(() => {
    if (
      isPlayerOne.value
    ) {
      return Boolean(
        props.match?.player_two_closed,
      )
    }

    if (
      isPlayerTwo.value
    ) {
      return Boolean(
        props.match?.player_one_closed,
      )
    }

    return false
  })

const resultTitle =
  computed(() => {
    if (
      isDraw.value
    ) {
      return 'FULL TIME DRAW'
    }

    if (
      didWin.value
    ) {
      return 'YOU WON!'
    }

    return 'YOU LOST!'
  })

/* -----------------------------
   PAY WINNER
----------------------------- */

const payWinner =
  async () => {
    if (
      isDraw.value ||
      !props.match?.winner ||
      props.match?.reward_paid
    ) {
      return
    }

    const winnerUsername =
      props.match.winner
        .trim()
        .toUpperCase()

    const {
      data: winnerData,
      error: fetchError,
    } = await supabase
      .from(
        'examinity_leaderboard',
      )
      .select(
        'challenge_points',
      )
      .eq(
        'username',
        winnerUsername,
      )
      .maybeSingle()

    if (
      fetchError ||
      !winnerData
    ) {
      throw fetchError ||
        new Error(
          'Winner not found',
        )
    }

    const currentPoints =
      Number(
        winnerData.challenge_points,
      ) || 0

    const {
      error: updatePointsError,
    } = await supabase
      .from(
        'examinity_leaderboard',
      )
      .update({
        challenge_points:
          currentPoints +
          rewardCp.value,
      })
      .eq(
        'username',
        winnerUsername,
      )

    if (
      updatePointsError
    ) {
      throw updatePointsError
    }

    const {
      error: rewardPaidError,
    } = await supabase
      .from(
        'versus_matches',
      )
      .update({
        reward_paid:
          true,
      })
      .eq(
        'id',
        props.match.id,
      )

    if (
      rewardPaidError
    ) {
      throw rewardPaidError
    }
  }

/* -----------------------------
   MARK CURRENT USER CLOSED
----------------------------- */

const markCurrentUserClosed =
  async () => {
    const updatePayload =
      {}

    if (
      isPlayerOne.value
    ) {
      updatePayload.player_one_closed =
        true
    }

    if (
      isPlayerTwo.value
    ) {
      updatePayload.player_two_closed =
        true
    }

    const {
      error,
    } = await supabase
      .from(
        'versus_matches',
      )
      .update(
        updatePayload,
      )
      .eq(
        'id',
        props.match.id,
      )

    if (
      error
    ) {
      throw error
    }
  }

/* -----------------------------
   DELETE MATCH
----------------------------- */

const deleteMatch =
  async () => {
    const {
      error,
    } = await supabase
      .from(
        'versus_matches',
      )
      .delete()
      .eq(
        'id',
        props.match.id,
      )

    if (
      error
    ) {
      throw error
    }
  }

/* -----------------------------
   CLOSE MATCH
----------------------------- */

const closeMatch =
  async () => {
    if (
      loading.value
    ) {
      return
    }

    playSound(
      'button',
    )

    loading.value =
      true

    message.value =
      ''

    try {
      await payWinner()

      await markCurrentUserClosed()

      if (
        otherPlayerAlreadyClosed.value
      ) {
        await deleteMatch()
      }

      emit(
        'refresh',
      )
    }

    catch (error) {
      console.error(
        error,
      )

      message.value =
        'Could not close match. Try again.'

      playSound(
        'fail',
      )
    }

    finally {
      loading.value =
        false
    }
  }
</script>

<template>
  <section
    class="min-h-screen flex items-center justify-center px-4 py-6 bg-[#101010]"
  >
    <div
      class="w-full max-w-md text-center"
    >
      <!-- TOP RESULT ICON -->
      <div
        class="flex flex-col items-center"
      >
        <div
          class="w-[160px] h-[160px] flex items-center justify-center"
        >
          <Vue3Lottie
            v-if="
              didWin
            "
            :animationData="
              winnerCup
            "
            :height="
              160
            "
            :width="
              160
            "
          />

          <Vue3Lottie
            v-else
            :animationData="
              failedCup
            "
            :height="
              160
            "
            :width="
              160
            "
          />
        </div>

        <p
          class="mt-2 text-[11px] font-black text-white/40 tracking-[0.3em]"
        >
          VERSUS RESULT
        </p>

        <h1
          class="mt-2 text-4xl font-black leading-none"
          :class="
            didWin
              ? 'text-[#F3F400]'
              : isDraw
                ? 'text-white'
                : 'text-[#FF2AA3]'
          "
        >
          {{
            resultTitle
          }}
        </h1>
      </div>

      <!-- FOOTBALL SCOREBOARD -->
      <div
        class="mt-6 bg-[#181818] border-4 border-white/10 rounded-[2rem] p-5 shadow-[0_10px_0_#000]"
      >
        <p
          class="text-[10px] font-black text-white/40 tracking-[0.25em]"
        >
          FULL TIME
        </p>

        <!-- PLAYER NAMES -->
        <div
          class="mt-5 grid grid-cols-2 gap-3"
        >
          <!-- PLAYER ONE -->
          <div
            class="min-w-0 bg-[#222222] border border-white/10 rounded-2xl px-3 py-3"
          >
            <p
              class="text-[9px] font-black text-white/40"
            >
              PLAYER ONE
            </p>

            <h2
              class="mt-1 text-sm font-black text-white truncate"
            >
              {{
                props.match.player_one
              }}
            </h2>
          </div>

          <!-- PLAYER TWO -->
          <div
            class="min-w-0 bg-[#222222] border border-white/10 rounded-2xl px-3 py-3"
          >
            <p
              class="text-[9px] font-black text-white/40"
            >
              PLAYER TWO
            </p>

            <h2
              class="mt-1 text-sm font-black text-white truncate"
            >
              {{
                props.match.player_two
              }}
            </h2>
          </div>
        </div>

        <!-- SCORE -->
        <div
          class="mt-4 bg-black border-4 border-white rounded-[1.5rem] px-3 py-5"
        >
          <div
            class="grid grid-cols-[1fr_auto_1fr] items-center gap-3"
          >
            <!-- PLAYER ONE SCORE -->
            <div
              class="min-w-0 flex justify-center"
            >
              <span
                class="max-w-full overflow-hidden text-ellipsis text-4xl font-black text-[#03B5EC] leading-none"
              >
                {{
                  playerOneScore
                }}
              </span>
            </div>

            <!-- DASH -->
            <span
              class="text-3xl font-black text-white/40 leading-none"
            >
              -
            </span>

            <!-- PLAYER TWO SCORE -->
            <div
              class="min-w-0 flex justify-center"
            >
              <span
                class="max-w-full overflow-hidden text-ellipsis text-4xl font-black text-[#FF2AA3] leading-none"
              >
                {{
                  playerTwoScore
                }}
              </span>
            </div>
          </div>
        </div>

        <!-- WINNER -->
        <div
          class="mt-5 bg-white border-4 border-black rounded-2xl px-4 py-4"
        >
          <p
            class="text-[10px] font-black text-black/50"
          >
            {{
              isDraw
                ? 'RESULT'
                : 'WINNER'
            }}
          </p>

          <h3
            class="mt-1 text-2xl font-black text-[#03B5EC] break-words"
          >
            {{
              isDraw
                ? 'NO WINNER'
                : props.match.winner
            }}
          </h3>
        </div>
      </div>

      <!-- REWARD -->
      <div
        v-if="
          didWin
        "
        class="mt-5 bg-[#F3F400] border-4 border-black rounded-[2rem] p-5"
      >
        <p
          class="text-sm font-black text-black/60"
        >
          REWARD
        </p>

        <h2
          class="mt-2 text-4xl font-black text-black"
        >
          +{{
            rewardCp
          }}
          CP
        </h2>

        <p
          v-if="
            props.match.reward_paid
          "
          class="mt-2 text-xs font-black text-black/50"
        >
          Reward already paid.
        </p>
      </div>

      <!-- DRAW MESSAGE -->
      <div
        v-if="
          isDraw
        "
        class="mt-5 bg-white border-4 border-black rounded-[2rem] p-5"
      >
        <p
          class="text-sm font-black text-black/60 leading-6"
        >
          This match ended in a draw.
          No reward CP will be paid.
        </p>
      </div>

      <!-- ERROR MESSAGE -->
      <div
        v-if="
          message
        "
        class="mt-5 bg-red-100 border-4 border-black rounded-2xl px-4 py-3"
      >
        <p
          class="text-center text-red-500 text-sm font-black"
        >
          {{
            message
          }}
        </p>
      </div>

      <!-- CLOSE BUTTON -->
      <button
        @click="
          closeMatch
        "
        :disabled="
          loading
        "
        class="mt-6 w-full bg-[#FD9501] border-4 border-black rounded-2xl py-5 text-xl font-black text-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000] transition-all duration-100 disabled:opacity-50"
      >
        {{
          loading
            ? 'CLOSING...'
            : 'CLOSE MATCH'
        }}
      </button>
    </div>
  </section>
</template>