<script setup>
import {
  onMounted,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import {
  Vue3Lottie,
} from 'vue3-lottie'

import BottomNavbar from '../components/BottomNavbar.vue'

import NotifyModal from '../components/NotifyModal.vue'

import landingAnimation from '../assets/lottie/landing_mation.json'

import TopNav from '../components/TopNav.vue'

import {
  playSound,
} from '../utils/playSound'

import {
  trackGame,
} from '../utils/trackGame'

const router =
  useRouter()

/* -----------------------------
   MOUNT
----------------------------- */

onMounted(() => {
  playSound(
    'Quizbere',
  )
})

/* -----------------------------
   START QUIZ
----------------------------- */

const goToNamePage =
  async () => {
    playSound(
      'button',
    )

    await trackGame(
      'quizbere',
    )

    router.push(
      '/braindrill',
    )
  }
</script>

<template>
  <TopNav />

  <main
    class="min-h-screen bg-[#F3F400] overflow-hidden px-5 pt-6 pb-28 flex items-center justify-center"
  >
    <section
      class="w-full max-w-md mx-auto flex flex-col items-center text-center"
    >
      <!-- LOGO -->
      <div
        class="w-20 h-20 overflow-hidden"
      >
        <img
          src="/quizbere_logo.png"
          alt="Quizbere Logo"
          class="w-full h-full object-contain"
        />
      </div>

      <!-- TITLE -->
      <h1
        class="mt-4 text-4xl md:text-5xl font-black text-[#FF2AA3] leading-none"
      >
        Quizbere
      </h1>

      <!-- SUBTITLE -->
      <p
        class="mt-3 text-black text-sm font-bold leading-6 max-w-[280px]"
      >
        Answer 10 questions correctly and
        unlock surprise rewards.
      </p>

      <!-- LOTTIE -->
      <div
        class="-mt-1"
      >
        <Vue3Lottie
          :animationData="
            landingAnimation
          "
          :height="
            125
          "
          :width="
            125
          "
        />
      </div>

      <!-- PRIZES -->
      <div
        class="w-full -mt-1 flex items-center justify-center gap-2"
      >
        <div
          class="flex-1 bg-white border-4 border-black rounded-2xl px-2 py-3"
        >
          <span
            class="font-black text-sm"
          >
            BIBLE
          </span>
        </div>

        <div
          class="flex-1 bg-white border-4 border-black rounded-2xl px-2 py-3"
        >
          <span
            class="font-black text-sm"
          >
            SPORTS
          </span>
        </div>

        <div
          class="flex-1 bg-white border-4 border-black rounded-2xl px-2 py-3"
        >
          <span
            class="font-black text-sm"
          >
            HISTORY
          </span>
        </div>
      </div>

      <!-- CTA -->
      <button
        @click="
          goToNamePage
        "
        class="mt-5 w-full bg-[#FD9501] text-black text-lg font-black py-4 rounded-2xl border-4 border-black shadow-[0_7px_0_#000] active:translate-y-[4px] active:shadow-[0_3px_0_#000] transition-all duration-100"
      >
        START BRAINDRILL
      </button>

      <!-- BOTTOM TEXT -->
      <p
        class="mt-3 text-[11px] font-bold text-black/70"
      >
        Answer. Spin. Win.
      </p>
    </section>

    <!-- CHALLENGE NOTIFICATION -->
    <NotifyModal />

    <BottomNavbar />
  </main>
</template>