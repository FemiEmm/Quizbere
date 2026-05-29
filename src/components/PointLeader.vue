<script setup>
/* -----------------------------
   IMPORTS
----------------------------- */

import {
  nextTick,
  ref,
} from 'vue'

import { Vue3Lottie } from 'vue3-lottie'

import html2canvas from 'html2canvas'

import championCrown from '../assets/lottie/champion_crown.json'

/* -----------------------------
   PROPS
----------------------------- */

const props =
  defineProps({
    show: Boolean,

    winner: Object,
  })

/* -----------------------------
   EMITS
----------------------------- */

const emit =
  defineEmits([
    'close',
  ])

/* -----------------------------
   REFS / STATE
----------------------------- */

const screenshotCard =
  ref(null)

const saving =
  ref(false)

const screenshotTime =
  ref('')

const showScreenshotStamp =
  ref(false)

/* -----------------------------
   CLOSE MODAL
----------------------------- */

const closeModal =
  () => {
    emit('close')
  }

/* -----------------------------
   WAT TIME
----------------------------- */

const getWatTime =
  () => {

    return new Intl.DateTimeFormat(
      'en-GB',
      {
        timeZone:
          'Africa/Lagos',

        weekday:
          'short',

        year:
          'numeric',

        month:
          'short',

        day:
          '2-digit',

        hour:
          '2-digit',

        minute:
          '2-digit',

        second:
          '2-digit',

        hour12:
          true,
      },
    ).format(
      new Date(),
    )
  }

/* -----------------------------
   SAVE SCREENSHOT
----------------------------- */

const saveScreenshot =
  async () => {

    if (
      !screenshotCard.value ||
      saving.value
    ) {
      return
    }

    saving.value =
      true

    screenshotTime.value =
      getWatTime()

    showScreenshotStamp.value =
      true

    await nextTick()

    try {

      const canvas =
        await html2canvas(
          screenshotCard.value,
          {
            backgroundColor:
              null,

            scale:
              2,

            useCORS:
              true,
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

      link.href =
        image

      link.download =
        `quizbere-winner-${props.winner?.username || 'winner'}.png`

      document.body.appendChild(
        link,
      )

      link.click()

      document.body.removeChild(
        link,
      )
    }

    catch (err) {

      console.error(
        err,
      )
    }

    finally {

      showScreenshotStamp.value =
        false

      saving.value =
        false
    }
  }
</script>

<template>
  <!-- MODAL OVERLAY -->
  <div
    v-if="
      show
    "
    class="fixed inset-0 bg-black/70 z-[999] flex items-center justify-center px-5"
  >
    <!-- MODAL WRAPPER -->
    <div
      class="relative w-full max-w-[320px]"
    >
      <!-- SCREENSHOT CARD -->
      <div
        ref="screenshotCard"
        class="relative w-full bg-[#F3F400] border-4 border-black rounded-[2.5rem] p-6 text-center shadow-[0_10px_0_#000] overflow-hidden"
      >
        <!-- CLOSE BUTTON -->
        <button
          @click="
            closeModal
          "
          class="absolute top-4 right-4 w-9 h-9 bg-white border-4 border-black rounded-full flex items-center justify-center text-lg font-black text-black"
        >
          ×
        </button>

        <!-- SMALL LABEL -->
        <p
          class="text-xs font-black text-black/50"
        >
          WEEKLY WINNER
        </p>

        <!-- CROWN ANIMATION -->
        <div
          class="-mt-2 flex justify-center"
        >
          <Vue3Lottie
            :animationData="
              championCrown
            "
            :height="
              180
            "
            :width="
              180
            "
          />
        </div>

        <!-- LEAGUE NAME -->
        <h2
          class="-mt-3 text-base font-black text-black/70 leading-tight"
        >
          {{
            winner?.league
          }}
        </h2>

        <!-- WINNER DETAILS -->
        <div
          class="mt-4 bg-white border-4 border-black rounded-3xl px-4 py-4"
        >
          <!-- POSITION -->
          <p
            class="text-[10px] font-black text-black/40 leading-none"
          >
            1ST PLACE
          </p>

          <!-- USERNAME -->
          <h3
            class="mt-2 text-[1.75rem] font-black text-[#03B5EC] leading-tight break-words"
          >
            {{
              winner?.username
            }}
          </h3>

          <!-- TOTAL SCORE -->
          <p
            class="mt-1 text-sm font-black text-black/70 leading-tight"
          >
            {{
              winner?.total_score
            }}
            POINTS
          </p>

          <!-- SCORE BREAKDOWN -->
          <div
            class="mt-3 grid grid-cols-2 gap-2"
          >
            <!-- RUN SCORE -->
            <div
              class="bg-[#F3F400] border-2 border-black rounded-xl py-2 px-2"
            >
              <p
                class="text-[8px] font-black text-black/50 leading-none"
              >
                RUN SCORE
              </p>

              <p
                class="mt-1 text-sm font-black text-black leading-tight"
              >
                {{
                  winner?.best_run_score || 0
                }}
              </p>
            </div>

            <!-- CP -->
            <div
              class="bg-[#F3F400] border-2 border-black rounded-xl py-2 px-2"
            >
              <p
                class="text-[8px] font-black text-black/50 leading-none"
              >
                CP
              </p>

              <p
                class="mt-1 text-sm font-black text-black leading-tight"
              >
                {{
                  winner?.challenge_points || 0
                }}
              </p>
            </div>
          </div>
        </div>

        <!-- SCREENSHOT TIME -->
        <div
          v-if="
            showScreenshotStamp
          "
          class="mt-4 bg-black border-4 border-black rounded-2xl px-3 py-2"
        >
          <p
            class="text-[8px] font-black text-white/60 uppercase leading-none"
          >
            Screenshot Time
          </p>

          <p
            class="mt-1 text-[11px] font-black text-white leading-tight"
          >
            {{
              screenshotTime
            }}
          </p>

          <p
            class="mt-1 text-[8px] font-black text-[#F3F400] leading-none"
          >
            West Africa Time
          </p>
        </div>
      </div>

      <!-- SAVE BUTTON -->
      <button
        @click="
          saveScreenshot
        "
        :disabled="
          saving
        "
        class="mt-5 w-full bg-[#FF2AA3] border-4 border-black rounded-2xl py-3 text-white text-sm font-black shadow-[0_5px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000] disabled:opacity-70"
      >
        {{
          saving
            ? 'SAVING...'
            : 'SAVE WINNER SCREENSHOT'
        }}
      </button>
    </div>
  </div>
</template>