<script setup>
import {
  computed,
  onMounted,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import {
  syncUserData,
} from '../utils/syncUserData'

const router = useRouter()

const result =
  JSON.parse(
    localStorage.getItem(
      'topic_result',
    ),
  )

/* -----------------------------
   REMARKS
----------------------------- */

const passRemarks = [
  'Good work. You actually used your brain today.',

  'Impressive. I almost smiled.',

  'Solid performance. No complaints today.',

  'You survived the academic battlefield.',

  'Well done. Your brain clocked in today.',
]

const failRemarks = [
  'That score was fighting for its life.',

  'The mascot expected chaos and still got surprised.',

  'You and the correct answers were avoiding each other.',

  'At least you showed up. That counts for something.',

  'That result needs emotional support.',
]

/* -----------------------------
   RANDOM REMARK
----------------------------- */

const remark =
  computed(() => {
    const remarks =
      result.passed
        ? passRemarks
        : failRemarks

    return remarks[
      Math.floor(
        Math.random() *
          remarks.length,
      )
    ]
  })

/* -----------------------------
   SYNC USER DATA
----------------------------- */

onMounted(async () => {
  await syncUserData()
})
</script>

<template>
  <main
    class="min-h-screen bg-[#F3F400] px-4 py-4 flex items-center justify-center"
  >
    <section
      class="w-full max-w-sm mx-auto"
    >
      <!-- MASCOT -->
      <img
        src="/mascot/mascot_marking.png"
        class="w-[92px] mx-auto"
      />

      <!-- PAPER -->
      <div
        class="mt-1 bg-white border-4 border-black rounded-[1.7rem] p-4 relative overflow-hidden"
      >
        <!-- LINES -->
        <div
          class="absolute inset-0 opacity-15 pointer-events-none"
          style="
            background-image:
              repeating-linear-gradient(
                to bottom,
                transparent,
                transparent 26px,
                #000 27px
              );
          "
        />

        <!-- CONTENT -->
        <div
          class="relative z-10"
        >
          <!-- TITLE -->
          <h1
            class="text-2xl font-black text-center text-[#FF2AA3]"
          >
            Quizbere Academy
          </h1>

          <!-- USER + TOPIC -->
          <div
            class="mt-5 grid grid-cols-2 gap-3"
          >
            <!-- USER -->
            <div>
              <p
                class="text-[10px] font-black text-black/50"
              >
                STUDENT
              </p>

              <h2
                class="mt-1 text-lg font-black leading-tight break-words"
              >
                {{
                  result.username
                }}
              </h2>
            </div>

            <!-- TOPIC -->
            <div>
              <p
                class="text-[10px] font-black text-black/50"
              >
                TOPIC
              </p>

              <h2
                class="mt-1 text-lg font-black leading-tight break-words"
              >
                {{
                  result.topic
                }}
              </h2>
            </div>
          </div>

          <!-- SCORE -->
          <div
            class="mt-5 flex justify-center"
          >
            <div
              class="w-[110px] h-[110px] rounded-full border-[6px] border-red-500 flex items-center justify-center rotate-[-8deg]"
            >
              <div
                class="text-center"
              >
                <h2
                  class="text-4xl font-black text-red-500 leading-none"
                >
                  {{ result.score }}/{{ result.total }}
                </h2>
              </div>
            </div>
          </div>

          <!-- REMARK -->
          <div
            class="mt-5 bg-[#03B5EC]/15 border-2 border-[#03B5EC] rounded-2xl px-4 py-3"
          >
            <p
              class="text-sm font-black text-center leading-6"
            >
              {{ remark }}
            </p>
          </div>

          <!-- BUTTON -->
          <button
            @click="
              router.push(
                '/topic-challenge',
              )
            "
            class="mt-5 w-full bg-[#03B5EC] border-4 border-black rounded-2xl py-4 text-lg font-black shadow-[0_5px_0_#000] active:translate-y-[3px] active:shadow-[0_2px_0_#000] transition-all duration-100"
          >
            FINISH
          </button>
        </div>
      </div>
    </section>
  </main>
</template>