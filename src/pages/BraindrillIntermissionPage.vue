<script setup>
import { computed } from 'vue'

import { useRouter } from 'vue-router'

import BottomNavbar from '../components/BottomNavbar.vue'

import { braindrillLevels } from '../data/braindrillLevels'

const router = useRouter()

const level =
  Number(
    localStorage.getItem(
      'braindrill_current_level',
    ),
  ) || 1

const score =
  Number(
    localStorage.getItem(
      'braindrill_last_score',
    ),
  ) || 0

const runScore =
  Number(
    localStorage.getItem(
      'braindrill_run_score',
    ),
  ) || 0

const correctAnswers =
  Number(
    localStorage.getItem(
      'braindrill_correct_answers',
    ),
  ) || 0

const currentLevel =
  braindrillLevels.find(
    (lvl) => lvl.level === level,
  )

const unlocked =
  correctAnswers >=
  currentLevel.requiredCorrect

const headmasterMessage = computed(() => {
  if (unlocked) {
    return 'Headmaster says: Fine. You earned it.'
  }

  return 'Headmaster says: Not enough. Try again.'
})

const nextLevel = () => {
  localStorage.setItem(
    'braindrill_selected_level',
    JSON.stringify({
      level: level + 1,
    }),
  )

  router.push('/braindrill/play')
}

const backToDrill = () => {
  router.push('/braindrill')
}
</script>

<template>
  <main
    class="min-h-screen bg-[#F3F400] pb-24 px-4 flex items-center justify-center"
  >
    <section
      class="w-full max-w-sm mx-auto"
    >
      <div
        class="bg-white border-4 border-black rounded-[2rem] p-6 text-center"
      >
        <h1
          class="text-4xl font-black text-[#FF2AA3]"
        >
          LEVEL COMPLETE
        </h1>

        <p
          class="mt-4 text-black text-base font-black leading-6"
        >
          {{ headmasterMessage }}
        </p>

        <!-- STATS -->
        <div
          class="mt-6 flex gap-3"
        >
          <div
            class="flex-1 bg-[#FD9501] border-4 border-black rounded-2xl py-4"
          >
            <p
              class="text-[10px] font-black text-black/70"
            >
              LEVEL
            </p>

            <h2
              class="mt-2 text-4xl font-black text-black"
            >
              {{ level }}
            </h2>
          </div>

          <div
            class="flex-1 bg-[#03B5EC] border-4 border-black rounded-2xl py-4"
          >
            <p
              class="text-[10px] font-black text-black/70"
            >
              CORRECT
            </p>

            <h2
              class="mt-2 text-4xl font-black text-white"
            >
              {{ correctAnswers }}
            </h2>
          </div>
        </div>

        <!-- REQUIREMENT -->
        <div
          class="mt-4 bg-[#FF2AA3]/15 border-2 border-[#FF2AA3] rounded-2xl py-4"
        >
          <p
            class="text-sm font-black text-black"
          >
            NEED
            {{ currentLevel.requiredCorrect }}
            CORRECT ANSWERS
          </p>
        </div>

        <!-- BUTTONS -->
        <div
          class="mt-5 flex flex-col gap-3"
        >
          <button
            v-if="unlocked && level < 4"
            @click="nextLevel"
            class="w-full bg-[#03B5EC] text-black text-xl font-black py-4 rounded-2xl border-4 border-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000]"
          >
            NEXT LEVEL
          </button>

          <button
            @click="backToDrill"
            class="w-full bg-[#FD9501] text-black text-xl font-black py-4 rounded-2xl border-4 border-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000]"
          >
            BACK TO BRAINDRILL
          </button>
        </div>
      </div>
    </section>

    <BottomNavbar />
  </main>
</template>