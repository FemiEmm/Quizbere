<script setup>
import {
  computed,
  onMounted,
} from 'vue'

import { useRouter } from 'vue-router'

import { playSound } from '../utils/playSound'

const router = useRouter()

const score =
  Number(
    localStorage.getItem(
      'quizbere_score',
    ),
  ) || 0

const passed = computed(() => {
  return score >= 8
})

/* -----------------------------
   PLAY PASS / FAIL SOUND
----------------------------- */

/* -----------------------------
   CONTINUE
----------------------------- */

const continueGame = () => {
  playSound('button')

  if (passed.value) {
    router.push('/reward')
  } else {
    router.push('/quiz')
  }
}
</script>

<template>
  <main
    class="min-h-screen bg-[#F3F400] flex items-center justify-center px-6"
  >
    <section
      class="w-full max-w-md text-center"
    >
      <!-- Score Card -->
      <div
        class="bg-white border-4 border-black rounded-[2rem] p-8 shadow-[0_10px_0_#000]"
      >
        <!-- Title -->
        <h1
          class="text-5xl font-black text-[#FF2AA3]"
        >
          {{
            passed
              ? 'YOU PASSED!'
              : 'TRY AGAIN!'
          }}
        </h1>

        <!-- Score -->
        <div
          class="mt-8 bg-[#03B5EC] border-4 border-black rounded-3xl py-8 shadow-[0_6px_0_#000]"
        >
          <p
            class="text-black text-lg font-black"
          >
            YOUR SCORE
          </p>

          <h2
            class="text-7xl font-black text-white leading-none mt-3"
          >
            {{ score }}/10
          </h2>
        </div>

        <!-- Message -->
        <p
          class="mt-8 text-black text-lg font-bold leading-7"
        >
          {{
            passed
              ? 'You unlocked the reward spin.'
              : 'You need at least 8 correct answers to unlock rewards.'
          }}
        </p>

        <!-- Continue Button -->
        <button
          @click="
            continueGame
          "
          class="mt-10 w-full bg-[#FD9501] text-black text-2xl font-black py-5 rounded-3xl border-4 border-black shadow-[0_8px_0_#000] active:translate-y-[4px] active:shadow-[0_4px_0_#000] transition-all duration-100"
        >
          {{
            passed
              ? 'SPIN REWARD'
              : 'TRY AGAIN'
          }}
        </button>
      </div>
    </section>
  </main>
</template>