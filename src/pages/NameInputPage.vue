```vue id="c2m8vx"
<script setup>
import { ref, onMounted } from 'vue'

import { useRouter } from 'vue-router'

const router = useRouter()

const playerName = ref('')

/* -----------------------------
   LOAD SAVED USERNAME
----------------------------- */

onMounted(() => {
  const savedUsername =
    localStorage.getItem(
      'examinity_username',
    )

  if (savedUsername) {
    playerName.value = savedUsername
  }
})

/* -----------------------------
   BACK
----------------------------- */

const goBack = () => {
  router.push('/home')
}

/* -----------------------------
   START QUIZ
----------------------------- */

const startQuiz = () => {
  if (!playerName.value.trim()) return

  localStorage.setItem(
    'examinity_username',
    playerName.value,
  )

  router.push('/quiz')
}
</script>

<template>
  <main
    class="min-h-screen bg-[#03B5EC] flex items-center justify-center px-6 relative overflow-hidden"
  >
    <!-- Back Button -->
    <button
      @click="goBack"
      class="absolute top-6 left-6 bg-white border-4 border-black rounded-2xl px-5 py-3 shadow-[0_6px_0_#000] text-black font-black text-lg active:translate-y-[3px] active:shadow-[0_3px_0_#000] transition-all duration-100"
    >
      BACK
    </button>

    <section
      class="w-full max-w-md text-center"
    >
      <!-- Title -->
      <h1
        class="text-5xl font-black text-white leading-none"
      >
        WHO ARE YOU?
      </h1>

      <!-- Subtitle -->
      <p
        class="mt-4 text-black text-lg font-bold"
      >
        Enter your name to begin the challenge.
      </p>

      <!-- Input Card -->
      <div
        class="mt-10 bg-white border-4 border-black rounded-[2rem] p-6 shadow-[0_8px_0_#000]"
      >
        <!-- INPUT -->
        <input
          v-model="playerName"
          type="text"
          maxlength="15"
          placeholder="Your name..."
          class="w-full bg-[#E8E8E8] border-4 border-black rounded-2xl px-5 py-4 text-xl font-black outline-none placeholder:text-black/40"
        />

        <!-- INFO -->
        <p
          class="mt-4 text-sm font-bold text-black/60 leading-6"
        >
          For winnings, your name should
          match your social media username.
        </p>

        <!-- Continue Button -->
        <button
          @click="startQuiz"
          class="mt-6 w-full bg-[#FD9501] text-black text-2xl font-black py-5 rounded-3xl border-4 border-black shadow-[0_8px_0_#000] active:translate-y-[4px] active:shadow-[0_4px_0_#000] transition-all duration-100"
        >
          CONTINUE
        </button>
      </div>

      <!-- Bottom Text -->
      <p
        class="mt-6 text-sm font-bold text-black"
      >
        10 Questions • Big Rewards
      </p>
    </section>
  </main>
</template>
```
