<!-- src/components/AdModal.vue -->

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'

import {
  playSound,
} from '../utils/playSound'

const emit =
  defineEmits([
    'complete',
  ])

/* -----------------------------
   ADS
----------------------------- */

const ads = [
  '/ad/ad1.png',
]

/* -----------------------------
   RANDOM AD
----------------------------- */

const selectedAd =
  ref('')

const chooseRandomAd =
  () => {
    const randomIndex =
      Math.floor(
        Math.random() *
          ads.length,
      )

    selectedAd.value =
      ads[randomIndex]
  }

/* -----------------------------
   TIMER
----------------------------- */

const countdown =
  ref(10)

let timer = null

const startCountdown =
  () => {
    timer =
      setInterval(() => {
        if (
          countdown.value >
          0
        ) {
          countdown.value--
        } else {
          finishAd()
        }
      }, 1000)
  }

/* -----------------------------
   PROGRESS
----------------------------- */

const progressWidth =
  computed(() => {
    return `${
      (countdown.value /
        10) *
      100
    }%`
  })

/* -----------------------------
   COMPLETE
----------------------------- */

const finishAd =
  () => {
    clearInterval(
      timer,
    )

    playSound(
      'button',
    )

    emit(
      'complete',
    )
  }

/* -----------------------------
   CLOSE
----------------------------- */

const closeAd =
  () => {
    clearInterval(
      timer,
    )

    playSound(
      'button',
    )

    emit(
      'complete',
    )
  }

/* -----------------------------
   LIFECYCLE
----------------------------- */

onMounted(() => {
  chooseRandomAd()

  startCountdown()
})

onBeforeUnmount(() => {
  clearInterval(
    timer,
  )
})
</script>

<template>
  <div
    class="fixed inset-0 z-[999] bg-black flex flex-col"
  >
    <!-- TOP -->
    <section
      class="absolute top-0 left-0 w-full z-20 px-4 pt-5"
    >
      <div
        class="flex items-center justify-between"
      >
        <!-- COUNTDOWN -->
        <div
          class="bg-[#F3F400] border-4 border-black rounded-2xl px-5 py-3 shadow-[0_5px_0_#000]"
        >
          <p
            class="text-black text-sm font-black"
          >
            {{
              countdown
            }}s
          </p>
        </div>

        <!-- CLOSE -->
        <button
          @click="
            closeAd
          "
          class="w-14 h-14 bg-[#FF2AA3] border-4 border-black rounded-full flex items-center justify-center shadow-[0_5px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000]"
        >
          <span
            class="text-white text-3xl font-black leading-none"
          >
            ×
          </span>
        </button>
      </div>

      <!-- PROGRESS -->
      <div
        class="mt-4 w-full h-5 bg-white border-4 border-black rounded-full overflow-hidden"
      >
        <div
          class="h-full bg-[#F3F400] transition-all duration-1000"
          :style="{
            width:
              progressWidth,
          }"
        />
      </div>
    </section>

    <!-- IMAGE -->
    <section
      class="flex-1 flex items-center justify-center px-4 py-20"
    >
      <img
        :src="
          selectedAd
        "
        alt="Advertisement"
        class="w-full max-w-md rounded-[2rem] border-4 border-white object-cover"
      />
    </section>

    <!-- FOOTER -->
    <section
      class="pb-10 px-6 text-center"
    >
      <p
        class="text-white text-lg font-black"
      >
        CONTINUING IN
        {{
          countdown
        }}s
      </p>
    </section>
  </div>
</template>