<script setup>
import {
  computed,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

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

/* -----------------------------
   MASCOT MESSAGE
----------------------------- */

const passMessages = [
  'Not bad. Promotion granted.',

  'You survived the drill.',

  'Sharp work. Move forward.',

  'Acceptable performance.',

  'You earned the next rank.',
]

const failMessages = [
  'Low score. Try again.',

  'You need more practice.',

  'That performance was weak.',

  'Back to training.',

  'Not enough. Repeat the level.',
]

const mascotMessage =
  computed(() => {
    const messages =
      unlocked
        ? passMessages
        : failMessages

    return messages[
      Math.floor(
        Math.random() *
          messages.length,
      )
    ]
  })

/* -----------------------------
   STATUS
----------------------------- */

const resultStatus =
  computed(() => {
    if (unlocked) {
      return 'PASSED: PROMOTION'
    }

    return 'LOW SCORE: TRY AGAIN'
  })

/* -----------------------------
   NEXT LEVEL
----------------------------- */

const nextLevel = () => {
  localStorage.setItem(
    'braindrill_selected_level',
    JSON.stringify({
      level: level + 1,
    }),
  )

  router.push(
    '/braindrill/play',
  )
}

/* -----------------------------
   BACK
----------------------------- */

const backToDrill = () => {
  router.push(
    '/braindrill',
  )
}
</script>

<template>
  <main
    class="min-h-screen bg-[#F3F400] pb-20 px-3 flex items-center justify-center"
  >
    <section
      class="w-full max-w-[320px] mx-auto"
    >
      <div
        class="relative overflow-hidden bg-white border-4 border-black rounded-[1.6rem] px-4 py-4 text-center"
      >
        <!-- PAPER LINES -->
        <div
          class="absolute inset-0 pointer-events-none opacity-10"
        >
          <div
            v-for="n in 18"
            :key="n"
            class="w-full border-t border-black"
            :style="{
              top: `${n * 24}px`,
              position: 'absolute',
            }"
          />
        </div>

        <!-- TITLE -->
        <h1
          class="relative z-10 text-[1.6rem] font-black text-[#FF2AA3] leading-none"
        >
          LEVEL COMPLETE
        </h1>

        <!-- MASCOT -->
        <div
          class="relative z-10 mt-4 flex items-center justify-center gap-2"
        >
          <!-- CHARACTER -->
          <img
            src="/mascot/mascot_marking.png"
            alt="Mascot"
            class="w-16 h-24 object-contain shrink-0"
          />

          <!-- MESSAGE -->
          <div
            class="w-full max-w-[180px] min-h-[66px] bg-white border-4 border-black rounded-[1.3rem] px-3 py-2 flex items-center justify-center relative"
          >
            <!-- PAPER LINES -->
            <div
              class="absolute inset-0 overflow-hidden rounded-[1.3rem] opacity-10 pointer-events-none"
            >
              <div
                v-for="n in 5"
                :key="n"
                class="w-full border-t border-black absolute"
                :style="{
                  top: `${n * 14}px`,
                }"
              />
            </div>

            <p
              class="relative z-10 text-center text-[10px] font-black text-black leading-4"
            >
              {{
                mascotMessage
              }}
            </p>
          </div>
        </div>

        <!-- STATS -->
        <div
          class="relative z-10 mt-4 flex gap-2 items-stretch"
        >
          <!-- LEVEL -->
          <div
            class="flex-1 bg-[#FD9501] border-4 border-black rounded-xl py-2 flex flex-col items-center justify-center"
          >
            <p
              class="text-[8px] font-black text-black/70"
            >
              LEVEL
            </p>

            <h2
              class="mt-1 text-3xl font-black text-black leading-none"
            >
              {{ level }}
            </h2>
          </div>

          <!-- CORRECT -->
          <div
            class="flex-1 py-1 flex flex-col items-center justify-center"
          >
            <p
              class="text-[8px] font-black text-black/70"
            >
              CORRECT
            </p>

            <div
              class="mt-1 w-[58px] h-[58px] border-4 border-[#FF2D2D] rounded-full flex items-center justify-center rotate-[10deg]"
            >
              <h2
                class="text-[1.5rem] font-black text-[#FF2D2D]"
              >
                {{ correctAnswers }}
              </h2>
            </div>
          </div>
        </div>

        <!-- RESULT -->
        <div
          class="relative z-10 mt-3 bg-[#FF2AA3]/15 border-2 border-[#FF2AA3] rounded-xl py-2"
        >
          <p
            class="text-[11px] font-black text-black"
          >
            {{
              resultStatus
            }}
          </p>
        </div>

        <!-- BUTTONS -->
        <div
          class="relative z-10 mt-4 flex gap-2"
        >
          <button
            v-if="unlocked && level < 10"
            @click="nextLevel"
            class="flex-1 bg-[#03B5EC] text-black text-sm font-black py-2.5 rounded-xl border-4 border-black shadow-[0_5px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000]"
          >
            NEXT LEVEL
          </button>

          <button
            @click="backToDrill"
            class="flex-1 bg-[#FD9501] text-black text-sm font-black py-2.5 rounded-xl border-4 border-black shadow-[0_5px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000]"
          >
            BACK
          </button>
        </div>
      </div>
    </section>

    <BottomNavbar />
  </main>
</template>