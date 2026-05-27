<!-- src/components/AdModal.vue -->

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'

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
    <!-- CLOSE -->
    <button
      @click="
        closeAd
      "
      class="absolute top-5 right-4 z-30 w-14 h-14 bg-[#FF2AA3] border-4 border-black rounded-full flex items-center justify-center shadow-[0_5px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000]"
    >
      <span
        class="text-white text-3xl font-black leading-none"
      >
        ×
      </span>
    </button>

    <!-- IMAGE -->
    <section
      class="flex-1 flex items-center justify-center px-4 py-10"
    >
      <img
        :src="
          selectedAd
        "
        alt="Advertisement"
        class="w-full max-w-md rounded-[2rem] border-4 border-white object-cover"
      />
    </section>

    <!-- BOTTOM -->
    <section
      class="pb-8 px-4"
    >
      <!-- PROGRESS -->
      <div
        class="w-full max-w-md mx-auto h-5 bg-white border-4 border-black rounded-full overflow-hidden"
      >
        <div
          class="h-full bg-[#F3F400] transition-all duration-1000"
          :style="{
            width:
              progressWidth,
          }"
        />
      </div>

      <!-- TEXT -->
      <p
        class="mt-4 text-center text-white text-lg font-black"
      >
        Logging in...
      </p>
    </section>
  </div>
</template>