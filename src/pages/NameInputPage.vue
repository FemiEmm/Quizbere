<script setup>
import {
  ref,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

const router = useRouter()

const playerName =
  ref('')

/* -----------------------------
   BACK
----------------------------- */

const goBack =
  () => {
    router.push(
      '/home',
    )
  }

/* -----------------------------
   START QUIZ
----------------------------- */

const startQuiz =
  () => {
    if (
      !playerName.value
        .trim()
    )
      return

    /* TEMP ROUND NAME */

    localStorage.setItem(
      'quiz_temp_name',
      playerName.value
        .trim()
        .toUpperCase(),
    )

    router.push(
      '/quiz',
    )
  }
</script>

<template>
  <main
    class="min-h-screen bg-[#03B5EC] flex items-center justify-center px-5 py-6 relative overflow-hidden"
  >
    <!-- BACK BUTTON -->
    <button
      @click="
        goBack
      "
      class="absolute top-4 left-4 bg-white border-4 border-black rounded-xl px-4 py-2 shadow-[0_5px_0_#000] text-black font-black text-base active:translate-y-[3px] active:shadow-[0_2px_0_#000] transition-all duration-100"
    >
      BACK
    </button>

    <section
      class="w-full max-w-md text-center"
    >
      <!-- TITLE -->
      <h1
        class="text-3xl sm:text-5xl font-black text-white leading-none"
      >
        ROUND NAME
      </h1>

      <!-- SUBTITLE -->
      <p
        class="mt-3 text-black text-base font-bold"
      >
        Create a temporary name for this round.
      </p>

      <!-- INPUT CARD -->
      <div
        class="mt-7 bg-white border-4 border-black rounded-[2rem] p-5 shadow-[0_7px_0_#000]"
      >
        <!-- INPUT -->
        <input
          v-model="playerName"
          @input="
            playerName =
              playerName.toUpperCase()
          "
          type="text"
          maxlength="15"
          placeholder="ROUND NAME..."
          class="w-full bg-[#E8E8E8] border-4 border-black rounded-2xl px-4 py-3 text-lg font-black text-center outline-none placeholder:text-black/40"
        />

        <!-- INFO -->
        <p
          class="mt-4 text-xs font-bold text-black/60 leading-5"
        >
          This name is only used for this
          game session and screenshots.
        </p>

        <!-- CONTINUE -->
        <button
          @click="
            startQuiz
          "
          class="mt-5 w-full bg-[#FD9501] text-black text-xl font-black py-4 rounded-3xl border-4 border-black shadow-[0_7px_0_#000] active:translate-y-[4px] active:shadow-[0_3px_0_#000] transition-all duration-100"
        >
          START ROUND
        </button>
      </div>

      <!-- BOTTOM TEXT -->
      <p
        class="mt-5 text-xs font-bold text-black"
      >
        Temporary Name • One Session Only
      </p>
    </section>
  </main>
</template>