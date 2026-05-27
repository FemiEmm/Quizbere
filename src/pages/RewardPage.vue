<script setup>
import {
  computed,
  ref,
} from 'vue'

import { useRouter } from 'vue-router'

import { supabase } from '../lib/supabase'

import SpinWheel from '../components/SpinWheel.vue'

import { rewards } from '../data/rewards'

import { playSound } from '../utils/playSound'

const router = useRouter()

/* -----------------------------
   USERNAME
----------------------------- */

const username =
  (
    localStorage.getItem(
      'examinity_username',
    ) || 'anonymous'
  )
    .trim()
    .toUpperCase()

/* -----------------------------
   STATE
----------------------------- */

const spinning = ref(false)

const selectedReward =
  ref('')

const wheelRef = ref(null)

/* -----------------------------
   SPIN TOKEN
----------------------------- */

const consumeSpinToken =
  async () => {
    try {
      /* FETCH USER */

      const {
        data: user,
        error,
      } = await supabase
        .from(
          'examinity_users',
        )
        .select(
          'spin_token',
        )
        .eq(
          'username',
          username,
        )
        .maybeSingle()

      if (
        error ||
        !user
      ) {
        return false
      }

      /* CURRENT TOKENS */

      const currentTokens =
        Number(
          user.spin_token,
        ) || 0

      /* NO TOKENS */

      if (
        currentTokens <= 0
      ) {
        return false
      }

      /* UPDATE */

      const {
        error:
          updateError,
      } = await supabase
        .from(
          'examinity_users',
        )
        .update({
          spin_token:
            currentTokens -
            1,
        })
        .eq(
          'username',
          username,
        )

      if (updateError) {
        return false
      }

      return true
    } catch (err) {
      console.error(err)

      return false
    }
  }

/* -----------------------------
   HANDLE SPIN COMPLETE
----------------------------- */

const handleSpinComplete =
  async (reward) => {
    selectedReward.value =
      reward.name

    spinning.value = false

    localStorage.setItem(
      'examinity_reward',
      reward.name,
    )

    /* WIN / FAIL SOUND */

    if (
      reward.name ===
      'TRY AGAIN'
    ) {
      playSound('fail')
    } else {
      playSound('pass')
    }
  }

/* -----------------------------
   START SPIN
----------------------------- */

const startSpin =
  async () => {
    if (spinning.value)
      return

    /* CONSUME TOKEN */

    const allowed =
      await consumeSpinToken()

    if (!allowed) {
      playSound('fail')

      return
    }

    playSound('button')

    spinning.value = true

    wheelRef.value.spin()
  }

/* -----------------------------
   CONTINUE
----------------------------- */

const continueToWinner =
  () => {
    playSound('button')

    router.push('/winner')
  }

/* -----------------------------
   BUTTON TEXT
----------------------------- */

const buttonText =
  computed(() => {
    if (spinning.value)
      return 'SPINNING...'

    if (
      selectedReward.value
    ) {
      return 'CONTINUE'
    }

    return 'SPIN NOW'
  })

/* -----------------------------
   BUTTON ACTION
----------------------------- */

const handleButton =
  () => {
    if (
      selectedReward.value &&
      !spinning.value
    ) {
      continueToWinner()
    } else {
      startSpin()
    }
  }
</script>

<template>
  <main
    class="min-h-screen bg-[#03B5EC] flex items-center justify-center px-4 py-6 overflow-hidden"
  >
    <section
      class="w-full max-w-sm text-center"
    >
      <!-- TITLE -->
      <h1
        class="text-4xl font-black text-white"
      >
        REWARD SPIN
      </h1>

      <!-- SUBTITLE -->
      <p
        class="mt-3 text-black text-base font-bold"
      >
        Spin the wheel and unlock
        your reward.
      </p>

      <!-- CUSTOM WHEEL -->
      <div
        class="mt-8 flex justify-center"
      >
        <SpinWheel
          ref="wheelRef"
          :rewards="rewards"
          :spinning="spinning"
          @spin-complete="
            handleSpinComplete
          "
        />
      </div>

      <!-- RESULT -->
      <div
        v-if="
          selectedReward &&
          !spinning
        "
        class="mt-6 bg-white border-4 border-black rounded-[1.7rem] p-5 shadow-[0_6px_0_#000]"
      >
        <p
          class="text-base font-black text-black"
        >
          YOU WON
        </p>

        <h2
          class="mt-2 text-4xl font-black text-[#FF2AA3]"
        >
          {{
            selectedReward
          }}
        </h2>
      </div>

      <!-- BUTTON -->
      <button
        @click="handleButton"
        :disabled="spinning"
        class="mt-6 w-full bg-[#FD9501] text-black text-xl font-black py-4 rounded-3xl border-4 border-black shadow-[0_8px_0_#000] transition-all duration-100"
        :class="[
          spinning
            ? 'opacity-70 cursor-not-allowed'
            : 'active:translate-y-[4px] active:shadow-[0_4px_0_#000]',
        ]"
      >
        {{ buttonText }}
      </button>
    </section>
  </main>
</template>