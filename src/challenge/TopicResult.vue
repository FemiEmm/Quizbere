<script setup>
import {
  useRouter,
} from 'vue-router'

const router = useRouter()

const result =
  JSON.parse(
    localStorage.getItem(
      'topic_result',
    ),
  )

/* -----------------------------
   REMARK
----------------------------- */

const remark =
  result.passed
    ? 'Good work. You actually used your brain today.'
    : 'See me after class. This performance is suspicious.'
</script>

<template>
  <main
    class="min-h-screen bg-[#F3F400] px-4 pt-5 pb-10"
  >
    <section
      class="max-w-md mx-auto"
    >
      <!-- MASCOT -->
      <img
        src="/mascot/mascot_marking.png"
        class="w-[128px] mx-auto"
      />

      <!-- PAPER -->
      <div
        class="mt-2 bg-white border-4 border-black rounded-[2rem] p-6 relative overflow-hidden"
      >
        <!-- LINES -->
        <div
          class="absolute inset-0 opacity-20 pointer-events-none"
          style="
            background-image:
              repeating-linear-gradient(
                to bottom,
                transparent,
                transparent 32px,
                #000 33px
              );
          "
        />

        <!-- CONTENT -->
        <div
          class="relative z-10"
        >
          <!-- TITLE -->
          <h1
            class="text-3xl font-black text-center text-[#FF2AA3]"
          >
            Quizbere Academy
          </h1>

          <!-- USER -->
          <div
            class="mt-6"
          >
            <p
              class="text-sm font-black text-black/50"
            >
              STUDENT
            </p>

            <h2
              class="mt-1 text-3xl font-black"
            >
              {{
                result.username
              }}
            </h2>
          </div>

          <!-- TOPIC -->
          <div
            class="mt-5"
          >
            <p
              class="text-sm font-black text-black/50"
            >
              TOPIC
            </p>

            <h2
              class="mt-1 text-3xl font-black"
            >
              {{
                result.topic
              }}
            </h2>
          </div>

          <!-- SCORE + REMARK -->
          <div
            class="mt-8 flex items-center justify-between gap-4"
          >
            <!-- SCORE -->
            <div
              class="min-w-[140px] w-[140px] h-[140px] rounded-full border-[8px] border-red-500 flex items-center justify-center rotate-[-10deg] shrink-0"
            >
              <div
                class="text-center"
              >
                <h2
                  class="text-5xl font-black text-red-500"
                >
                  {{
                    result.score
                  }}/{{ result.total }}
                </h2>
              </div>
            </div>

            <!-- REMARK -->
            <div
              class="flex-1"
            >
              <p
                class="text-lg font-black leading-8"
              >
                {{ remark }}
              </p>
            </div>
          </div>

          <!-- BUTTON -->
          <button
            @click="
              router.push(
                '/topic-challenge',
              )
            "
            class="mt-8 w-full bg-[#03B5EC] border-4 border-black rounded-2xl py-5 text-2xl font-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000] transition-all duration-100"
          >
            FINISH
          </button>
        </div>
      </div>
    </section>
  </main>
</template>