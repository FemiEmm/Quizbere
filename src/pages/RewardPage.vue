<script setup>
import {
  computed,
  ref,
} from 'vue'

import { useRouter } from 'vue-router'

import { supabase } from '../lib/supabase'

import SpinWheel from '../components/SpinWheel.vue'

import BottomNavbar from '../components/BottomNavbar.vue'

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
  ).trim()

/* -----------------------------
   STATE
----------------------------- */

const spinning = ref(false)

const selectedReward =
  ref('')

const wheelRef = ref(null)

const showLevelModal =
  ref(false)

const levelMessage =
  ref(
    'You need to at least be in level 10 to spin this wheel, play BRAINDRILL to level up.',
  )

/* -----------------------------
   CLAIM CODE GENERATOR
----------------------------- */

const generateClaimCode =
  () => {
    const cleanUsername =
      username.replace(
        /\s+/g,
        '',
      )

    const firstLetters =
      cleanUsername.slice(
        0,
        2,
      )

    const lastLetters =
      cleanUsername.slice(-2)

    const randomNumber =
      Math.floor(
        1000 +
          Math.random() *
            9000,
      )

    return `${firstLetters}${lastLetters}EXA${randomNumber}`
  }

/* -----------------------------
   LEVEL CHECK
----------------------------- */

const checkSpinLevel =
  async () => {
    try {
      const {
        data: user,
        error,
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

      if (
        error ||
        !user
      ) {
        return false
      }

      const userLevel =
        Number(
          user.braindrill_level,
        ) || 0

      return userLevel >= 10
    } catch (err) {
      console.error(err)

      return false
    }
  }

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
    const finalReward =
      reward.name

    selectedReward.value =
      finalReward

    spinning.value = false

    /* SAVE REWARD */

    localStorage.setItem(
      'examinity_reward',
      finalReward,
    )

    /* GENERATE CLAIM CODE ONCE */

    if (
      finalReward !==
      'TRY AGAIN'
    ) {
      const claimCode =
        generateClaimCode()

      localStorage.setItem(
        'examinity_claim_code',
        claimCode,
      )

      localStorage.setItem(
        'examinity_claimed',
        'false',
      )
    }

    /* WIN / FAIL SOUND */

    if (
      finalReward ===
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

    /* CHECK LEVEL FIRST */

    const levelAllowed =
      await checkSpinLevel()

    if (
      !levelAllowed
    ) {
      playSound('fail')

      showLevelModal.value =
        true

      return
    }

    /* RESET OLD CLAIM DATA */

    localStorage.removeItem(
      'examinity_claim_code',
    )

    localStorage.removeItem(
      'examinity_claimed',
    )

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
   CLOSE LEVEL MODAL
----------------------------- */

const closeLevelModal =
  () => {
    playSound('button')

    showLevelModal.value =
      false
  }

/* -----------------------------
   GO TO BRAINDRILL
----------------------------- */

const goToBrainDrill =
  () => {
    playSound('button')

    showLevelModal.value =
      false

    router.push(
      '/braindrill',
    )
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
    class="min-h-screen bg-[#03B5EC] flex items-center justify-center px-4 py-6 pb-28 overflow-hidden"
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

    <!-- LEVEL LOCK MODAL -->
    <div
      v-if="
        showLevelModal
      "
      class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-5"
    >
      <section
        class="w-full max-w-sm bg-white border-4 border-black rounded-[2rem] p-5 text-center shadow-[0_8px_0_#000]"
      >
        <h2
          class="text-2xl font-black text-[#FF2AA3]"
        >
          LEVEL LOCKED
        </h2>

        <p
          class="mt-4 text-sm font-black text-black leading-6"
        >
          {{
            levelMessage
          }}
        </p>

        <button
          @click="
            goToBrainDrill
          "
          class="mt-5 w-full bg-[#F3F400] text-black text-lg font-black py-4 rounded-2xl border-4 border-black shadow-[0_5px_0_#000] active:translate-y-[3px] active:shadow-[0_2px_0_#000]"
        >
          PLAY BRAINDRILL
        </button>

        <button
          @click="
            closeLevelModal
          "
          class="mt-3 w-full bg-black text-white text-base font-black py-4 rounded-2xl border-4 border-black shadow-[0_5px_0_#000] active:translate-y-[3px] active:shadow-[0_2px_0_#000]"
        >
          CLOSE
        </button>
      </section>
    </div>

    <BottomNavbar />
  </main>
</template>