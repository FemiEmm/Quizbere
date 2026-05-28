<!-- src/pages/WinnerPage.vue -->

<script setup>
import {
  computed,
  ref,
} from 'vue'

import {
  useRouter,
  onBeforeRouteLeave,
} from 'vue-router'

import html2canvas from 'html2canvas'

import { supabase } from '../lib/supabase'

import BottomNavbar from '../components/BottomNavbar.vue'

import { playSound } from '../utils/playSound'

const router = useRouter()

/* -----------------------------
   USER DATA
----------------------------- */

const username =
  (
    localStorage.getItem(
      'examinity_username',
    ) || 'PLAYER'
  ).trim()

const reward =
  localStorage.getItem(
    'examinity_reward',
  ) || 'TRY AGAIN'

/* -----------------------------
   CLAIM DATA
----------------------------- */

const savedClaimCode =
  localStorage.getItem(
    'examinity_claim_code',
  )

const alreadyClaimed =
  localStorage.getItem(
    'examinity_claimed',
  ) === 'true'

/* -----------------------------
   STATE
----------------------------- */

const loading = ref(false)

const creditedMessage =
  ref('')

const claimActivated =
  ref(
    reward === 'TRY AGAIN'
      ? true
      : alreadyClaimed
  )

/* -----------------------------
   CLAIM CODE
----------------------------- */

const generatedClaimCode =
  ref(
    reward === 'TRY AGAIN'
      ? 'NO CODE'
      : savedClaimCode ||
          'NO CODE'
  )

const claimCode =
  computed(() => {
    return (
      generatedClaimCode.value
    )
  })

/* -----------------------------
   LEAVE MODAL
----------------------------- */

const showLeaveModal =
  ref(false)

const pendingRoute =
  ref(null)

const allowNavigation =
  ref(false)

/* -----------------------------
   WIN CHECK
----------------------------- */

const isWinningReward =
  computed(() => {
    return (
      reward !==
      'TRY AGAIN'
    )
  })

/* -----------------------------
   POINTS CHECK
----------------------------- */

const isPointsReward =
  computed(() => {
    return (
      reward.toUpperCase() ===
        '100 POINTS' ||
      reward.toUpperCase() ===
        '500 POINTS' ||
      reward.toUpperCase() ===
        '1000 POINTS'
    )
  })

/* -----------------------------
   POINT VALUE
----------------------------- */

const rewardPoints =
  computed(() => {
    if (
      reward.toUpperCase() ===
      '100 POINTS'
    ) {
      return 100
    }

    if (
      reward.toUpperCase() ===
      '500 POINTS'
    ) {
      return 500
    }

    if (
      reward.toUpperCase() ===
      '1000 POINTS'
    ) {
      return 1000
    }

    return 0
  })

/* -----------------------------
   CREDIT CHALLENGE POINTS
----------------------------- */

const creditChallengePoints =
  async () => {
    const {
      data: user,
      error,
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

    if (
      error ||
      !user
    ) {
      return false
    }

    const currentPoints =
      Number(
        user.challenge_points,
      ) || 0

    const {
      error:
        updateError,
    } = await supabase
      .from(
        'examinity_leaderboard',
      )
      .update({
        challenge_points:
          currentPoints +
          rewardPoints.value,
      })
      .eq(
        'username',
        username,
      )

    if (updateError) {
      return false
    }

    return true
  }

/* -----------------------------
   ACTIVATE CLAIM
----------------------------- */

const handleClaimCode =
  async () => {
    if (
      !isWinningReward.value
    )
      return

    if (
      claimActivated.value
    ) {
      return
    }

    playSound('button')

    loading.value = true

    /* -----------------------------
       CREDIT POINTS
    ----------------------------- */

    if (
      isPointsReward.value
    ) {
      const success =
        await creditChallengePoints()

      if (success) {
        creditedMessage.value = `You have been credited with ${rewardPoints.value} challenge points.`
      }
    }

    /* -----------------------------
       SAVE WINNER
    ----------------------------- */

    const { error } =
      await supabase
        .from(
          'examinity_winners',
        )
        .insert([
          {
            username,
            reward,

            claim_code:
              generatedClaimCode.value,

            screenshot_claimed:
              false,

            claim_status:
              'pending',
          },
        ])

    if (error) {
      console.error(error)

      loading.value = false

      return
    }

    /* -----------------------------
       SAVE CLAIM STATUS
    ----------------------------- */

    localStorage.setItem(
      'examinity_claimed',
      'true',
    )

    claimActivated.value =
      true

    loading.value = false
  }

/* -----------------------------
   PLAY AGAIN
----------------------------- */

const playAgain = () => {
  playSound('button')

  router.push('/quiz')
}

/* -----------------------------
   GIVE UP
----------------------------- */

const giveUp = () => {
  playSound('button')

  router.push('/home')
}

/* -----------------------------
   SAVE SCREENSHOT
----------------------------- */

const saveScreenshot =
  async () => {
    if (
      isWinningReward.value &&
      !claimActivated.value
    ) {
      return
    }

    playSound('screenshot')

    const card =
      document.getElementById(
        'reward-card',
      )

    if (!card) return

    const canvas =
      await html2canvas(
        card,
        {
          backgroundColor:
            null,

          scale: 2,
        },
      )

    const image =
      canvas.toDataURL(
        'image/png',
      )

    const link =
      document.createElement(
        'a',
      )

    link.href = image

    link.download =
      'examinity-reward.png'

    link.click()

    if (
      reward !==
      'TRY AGAIN'
    ) {
      await supabase
        .from(
          'examinity_winners',
        )
        .update({
          screenshot_claimed:
            true,
        })
        .eq(
          'claim_code',
          generatedClaimCode.value,
        )
    }
  }

/* -----------------------------
   ROUTE WARNING
----------------------------- */

onBeforeRouteLeave(
  (to) => {
    if (
      allowNavigation.value
    ) {
      return true
    }

    if (
      reward !==
        'TRY AGAIN' &&
      !claimActivated.value
    ) {
      showLeaveModal.value =
        true

      pendingRoute.value = to

      return false
    }

    return true
  },
)

/* -----------------------------
   LEAVE PAGE
----------------------------- */

const leavePage = () => {
  playSound('button')

  showLeaveModal.value =
    false

  allowNavigation.value =
    true

  if (
    pendingRoute.value
  ) {
    router.push(
      pendingRoute.value.fullPath,
    )
  }
}

/* -----------------------------
   STAY PAGE
----------------------------- */

const stayPage = () => {
  playSound('button')

  showLeaveModal.value =
    false

  pendingRoute.value =
    null
}
</script>

<template>
  <main
    class="min-h-screen bg-[#F3F400] flex items-center justify-center px-6 py-10 pb-40 overflow-hidden relative"
  >
    <!-- LEAVE MODAL -->
    <div
      v-if="showLeaveModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center px-6"
    >
      <div
        class="w-full max-w-md bg-white border-4 border-black rounded-[2.5rem] p-8 text-center shadow-[0_10px_0_#000]"
      >
        <h2
          class="text-4xl font-black text-[#FF2AA3]"
        >
          WAIT!
        </h2>

        <p
          class="mt-6 text-black text-lg font-bold leading-8"
        >
          You are about to leave this page.

          <br /><br />

          Codes not screenshotted and claimed
          cannot be used to claim prizes.
        </p>

        <div
          class="mt-8 flex gap-4"
        >
          <button
            @click="stayPage"
            class="flex-1 bg-[#03B5EC] text-black text-xl font-black py-4 rounded-3xl border-4 border-black shadow-[0_6px_0_#000]"
          >
            STAY
          </button>

          <button
            @click="leavePage"
            class="flex-1 bg-[#FF2AA3] text-black text-xl font-black py-4 rounded-3xl border-4 border-black shadow-[0_6px_0_#000]"
          >
            LEAVE
          </button>
        </div>
      </div>
    </div>

    <section
      class="w-full max-w-md text-center"
    >
      <!-- TITLE -->
      <h1
        class="text-5xl font-black text-[#FF2AA3]"
      >
        {{
          reward ===
          'TRY AGAIN'
            ? 'YOU GOT THIS!'
            : 'CONGRATS!'
        }}
      </h1>

      <!-- REWARD CARD -->
      <div
        id="reward-card"
        class="mt-8 bg-white border-4 border-black rounded-[2.5rem] p-8 shadow-[0_10px_0_#000]"
      >
        <!-- USERNAME -->
        <p
          class="text-black text-lg font-black"
        >
          {{ username }}
        </p>

        <!-- REWARD -->
        <h2
          class="mt-5 text-[2rem] font-black text-[#03B5EC] leading-none whitespace-nowrap overflow-hidden text-ellipsis"
        >
          {{ reward }}
        </h2>

        <!-- CREDITED MESSAGE -->
        <div
          v-if="
            creditedMessage
          "
          class="mt-6 bg-[#03B5EC] border-4 border-black rounded-3xl p-5"
        >
          <p
            class="text-black text-base font-black leading-7"
          >
            {{
              creditedMessage
            }}
          </p>
        </div>

        <!-- CLAIM CODE -->
        <button
          v-if="
            reward !==
            'TRY AGAIN'
          "
          @click="
            handleClaimCode
          "
          :disabled="
            loading ||
            claimActivated
          "
          class="mt-8 w-full min-h-[120px] border-4 border-black rounded-3xl px-6 py-5 shadow-[0_6px_0_#000] flex flex-col items-center justify-center transition-all duration-100"
          :class="[
            claimActivated
              ? 'bg-[#03B5EC]'
              : 'bg-[#FD9501]',
          ]"
        >
          <p
            class="text-black text-sm font-black"
          >
            {{
              claimActivated
                ? 'CODE CLAIMED'
                : 'CLAIM CODE'
            }}
          </p>

          <h3
            class="mt-3 text-[1.5rem] font-black text-black whitespace-nowrap leading-none text-center"
          >
            {{
              loading
                ? 'LOADING...'
                : claimCode
            }}
          </h3>
        </button>

        <!-- INSTRUCTIONS -->
        <p
          class="mt-8 text-black text-base font-bold leading-7"
        >
          <template
            v-if="
              reward ===
              'TRY AGAIN'
            "
          >
            One next time?
          </template>

          <template
            v-else-if="
              claimActivated
            "
          >
            CODE CLAIMED.

            <br /><br />

            Tap the SAVE SCREENSHOT button next.
          </template>

          <template
            v-else
          >
            Press the claim code box to activate
            your reward claim.
          </template>
        </p>
      </div>

      <!-- GIVE UP -->
      <button
        v-if="
          reward ===
          'TRY AGAIN'
        "
        @click="giveUp"
        class="mt-8 w-full bg-[#FF2AA3] text-black text-2xl font-black py-5 rounded-3xl border-4 border-black shadow-[0_8px_0_#000]"
      >
        GIVE UP?
      </button>

      <!-- SCREENSHOT -->
      <button
        @click="saveScreenshot"
        :disabled="
          isWinningReward &&
          !claimActivated
        "
        class="mt-8 w-full bg-[#03B5EC] text-black text-2xl font-black py-5 rounded-3xl border-4 border-black shadow-[0_8px_0_#000]"
        :class="[
          isWinningReward &&
          !claimActivated
            ? 'opacity-50 cursor-not-allowed'
            : '',
        ]"
      >
        SAVE SCREENSHOT
      </button>

      <!-- PLAY AGAIN -->
      <button
        @click="playAgain"
        class="mt-5 w-full bg-[#FD9501] text-black text-2xl font-black py-5 rounded-3xl border-4 border-black shadow-[0_8px_0_#000]"
      >
        PLAY AGAIN
      </button>
    </section>

    <BottomNavbar />
  </main>
</template>