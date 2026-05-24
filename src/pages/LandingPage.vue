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

import landingAnimation from '../assets/lottie/landing_mation.json'

import {
  playSound,
} from '../utils/playSound'

import {
  trackGame,
} from '../utils/trackGame'

const router = useRouter()

/* -----------------------------
   MOUNT
----------------------------- */

onMounted(() => {
  playSound('Quizbere')
})

/* -----------------------------
   START QUIZ
----------------------------- */

const goToNamePage =
  async () => {
    playSound('button')

    await trackGame(
      'quizbere',
    )

    router.push(
      '/name',
    )
  }
</script>

<template>
  <main
    class="min-h-screen bg-[#F3F400] overflow-hidden px-5 pt-6 pb-28"
  >
    <section
      class="w-full max-w-md mx-auto flex flex-col items-center text-center"
    >
      <!-- LOGO -->
      <div
        class="w-24 h-24 overflow-hidden"
      >
        <img
          src="/quizbere_logo.png"
          alt="Quizbere Logo"
          class="w-full h-full object-contain"
        />
      </div>

      <!-- TITLE -->
      <h1
        class="mt-5 text-4xl md:text-5xl font-black text-[#FF2AA3] leading-none"
      >
        Quizbere
      </h1>

      <!-- SUBTITLE -->
      <p
        class="mt-3 text-black text-base font-bold leading-6 max-w-sm"
      >
        Answer 10 questions correctly and
        unlock surprise rewards.
      </p>

      <!-- LOTTIE -->
      <div
        class="-mt-2"
      >
        <Vue3Lottie
          :animationData="landingAnimation"
          :height="140"
          :width="140"
        />
      </div>

      <!-- PRIZE CARDS -->
      <div
        class="w-full -mt-2 flex flex-col gap-3"
      >
        <div
          class="bg-white border-4 border-black rounded-2xl px-5 py-4"
        >
          <span
            class="font-black text-lg"
          >
            ₦100,000
          </span>
        </div>

        <div
          class="bg-white border-4 border-black rounded-2xl px-5 py-4"
        >
          <span
            class="font-black text-lg"
          >
            ₦10,000
          </span>
        </div>

        <div
          class="bg-white border-4 border-black rounded-2xl px-5 py-4"
        >
          <span
            class="font-black text-lg"
          >
            ₦2,000
          </span>
        </div>
      </div>

      <!-- CTA -->
      <button
        @click="goToNamePage"
        class="mt-6 w-full bg-[#FD9501] text-black text-xl font-black py-4 rounded-2xl border-4 border-black shadow-[0_7px_0_#000] active:translate-y-[4px] active:shadow-[0_3px_0_#000] transition-all duration-100"
      >
        START QUIZ
      </button>

      <!-- BOTTOM TEXT -->
      <p
        class="mt-4 text-xs font-bold text-black/70"
      >
        Answer. Spin. Win.
      </p>
    </section>

    <BottomNavbar />
  </main>
</template>