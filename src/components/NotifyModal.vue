<!-- src/components/NotifyModal.vue -->

<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import { supabase } from '../lib/supabase'

import { playSound } from '../utils/playSound'

/* -----------------------------
   ROUTER
----------------------------- */

const router =
  useRouter()

/* -----------------------------
   STATE
----------------------------- */

const showModal =
  ref(false)

const loading =
  ref(false)

const challenge =
  ref(null)

/* -----------------------------
   USERNAME
----------------------------- */

const username =
  (
    localStorage.getItem(
      'examinity_username',
    ) || ''
  )
    .trim()
    .toUpperCase()

/* -----------------------------
   CURRENT USER SIDE
----------------------------- */

const isPlayerOne =
  computed(() => {
    return (
      String(
        challenge.value?.player_one ||
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
        challenge.value?.player_two ||
          '',
      )
        .trim()
        .toUpperCase() ===
      username
    )
  })

/* -----------------------------
   DISPLAY TEXT
----------------------------- */

const titleText =
  computed(() => {
    if (
      isPlayerOne.value
    ) {
      return 'YOUR CHALLENGE IS ACTIVE!'
    }

    return 'YOU HAVE BEEN CHALLENGED!'
  })

const opponentLabel =
  computed(() => {
    if (
      isPlayerOne.value
    ) {
      return 'CHALLENGED PLAYER'
    }

    return 'CHALLENGED BY'
  })

const opponentName =
  computed(() => {
    if (
      isPlayerOne.value
    ) {
      return challenge.value?.player_two
    }

    return challenge.value?.player_one
  })

const messageText =
  computed(() => {
    if (
      isPlayerOne.value
    ) {
      return 'Go to the challenge page to earn points and track the match.'
    }

    return 'Go to the challenge page to earn points and see the prize to be won.'
  })

/* -----------------------------
   CHECK ACTIVE CHALLENGE
----------------------------- */

const checkChallenge =
  async () => {
    if (
      !username ||
      loading.value
    ) {
      return
    }

    loading.value =
      true

    const {
      data,
      error,
    } = await supabase
      .from(
        'versus_matches',
      )
      .select('*')
      .eq(
        'status',
        'active',
      )
      .order(
        'created_at',
        {
          ascending: false,
        },
      )

    loading.value =
      false

    if (
      error
    ) {
      console.error(
        error,
      )

      return
    }

    if (
      !data ||
      data.length ===
        0
    ) {
      return
    }

    const activeChallenge =
      data.find(
        (match) => {
          const playerOne =
            String(
              match.player_one ||
                '',
            )
              .trim()
              .toUpperCase()

          const playerTwo =
            String(
              match.player_two ||
                '',
            )
              .trim()
              .toUpperCase()

          return (
            playerOne ===
              username ||
            playerTwo ===
              username
          )
        },
      )

    if (
      !activeChallenge
    ) {
      return
    }

    challenge.value =
      activeChallenge

    showModal.value =
      true

    playSound(
      'pass',
    )
  }

/* -----------------------------
   CLOSE MODAL
----------------------------- */

const closeModal =
  () => {
    playSound(
      'button',
    )

    showModal.value =
      false
  }

/* -----------------------------
   GO TO CHALLENGE
----------------------------- */

const goToChallenge =
  () => {
    playSound(
      'button',
    )

    showModal.value =
      false

    router.push(
      '/versus',
    )
  }

/* -----------------------------
   MOUNT
----------------------------- */

onMounted(() => {
  checkChallenge()
})
</script>

<template>
  <div
    v-if="
      showModal &&
      challenge
    "
    class="fixed inset-0 z-[999] bg-black/70 flex items-center justify-center px-5"
  >
    <div
      class="relative w-full max-w-sm bg-[#03B5EC] border-4 border-black rounded-[2rem] p-6 text-center shadow-[0_10px_0_#000]"
    >
      <!-- CLOSE CENTER -->
      <button
        @click="
          closeModal
        "
        class="mx-auto w-11 h-11 bg-white border-4 border-black rounded-full flex items-center justify-center text-xl font-black text-black"
      >
        ×
      </button>

      <!-- TITLE -->
      <h1
        class="mt-4 text-2xl font-black text-white leading-tight"
      >
        {{
          titleText
        }}
      </h1>

      <!-- OPPONENT -->
      <div
        class="mt-5 bg-white border-4 border-black rounded-2xl px-4 py-4"
      >
        <p
          class="text-[10px] font-black text-black/50"
        >
          {{
            opponentLabel
          }}
        </p>

        <h2
          class="mt-1 text-3xl font-black text-black leading-tight break-words"
        >
          {{
            opponentName
          }}
        </h2>
      </div>

      <!-- MESSAGE -->
      <p
        class="mt-5 text-sm font-black text-white leading-6"
      >
        {{
          messageText
        }}
      </p>

      <!-- PRIZE + CP STAKED -->
      <div
        class="mt-4 grid grid-cols-2 gap-3"
      >
        <!-- PRIZE -->
        <div
          class="bg-black border-4 border-black rounded-2xl px-3 py-3"
        >
          <p
            class="text-[9px] font-black text-white/50"
          >
            PRIZE
          </p>

          <h3
            class="mt-1 text-xl font-black text-[#F3F400] leading-none"
          >
            {{
              challenge.reward_cp || 0
            }}
            CP
          </h3>
        </div>

        <!-- CP STAKED -->
        <div
          class="bg-white border-4 border-black rounded-2xl px-3 py-3"
        >
          <p
            class="text-[9px] font-black text-black/50"
          >
            CP STAKED
          </p>

          <h3
            class="mt-1 text-xl font-black text-black leading-none"
          >
            {{
              challenge.entry_cost || 0
            }}
            CP
          </h3>
        </div>
      </div>

      <!-- GO BUTTON -->
      <button
        @click="
          goToChallenge
        "
        class="mt-6 w-full bg-[#FF2AA3] border-4 border-black rounded-2xl py-4 text-white text-sm font-black shadow-[0_5px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000]"
      >
        GO TO CHALLENGE
      </button>
    </div>
  </div>
</template>