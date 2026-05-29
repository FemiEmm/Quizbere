<script setup>
import {
  computed,
} from 'vue'

import { Vue3Lottie } from 'vue3-lottie'

import loadingMotion from '../assets/lottie/loading_motion.json'

import successfulActionCenter from '../assets/lottie/successful_action.json'

import failedCup from '../assets/lottie/failed_cup.json'

const props =
  defineProps({
    show: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      default: 'loading',
    },

    message: {
      type: String,
      default: '',
    },
  })

const emit =
  defineEmits([
    'close',
  ])

const animationData =
  computed(() => {

    if (
      props.status ===
      'success'
    ) {
      return successfulActionCenter
    }

    if (
      props.status ===
      'error'
    ) {
      return failedCup
    }

    return loadingMotion
  })

const title =
  computed(() => {

    if (
      props.status ===
      'success'
    ) {
      return 'SUCCESSFUL'
    }

    if (
      props.status ===
      'error'
    ) {
      return 'FAILED'
    }

    return 'PLEASE WAIT'
  })

const closeModal =
  () => {

    if (
      props.status ===
      'loading'
    ) {
      return
    }

    emit(
      'close',
    )
  }
</script>

<template>
  <div
    v-if="
      show
    "
    class="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
  >
    <section
      class="relative w-full max-w-[340px] bg-[#F3F400] border-4 border-black rounded-[2rem] p-5 shadow-[0_10px_0_#000] text-center"
    >
      <!-- CLOSE -->
      <button
        v-if="
          status !== 'loading'
        "
        @click="
          closeModal
        "
        class="absolute -top-4 -right-3 w-12 h-12 bg-[#FF2AA3] border-4 border-black rounded-full flex items-center justify-center shadow-[0_5px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000]"
      >
        <span
          class="text-white text-2xl font-black leading-none"
        >
          ×
        </span>
      </button>

      <!-- ANIMATION -->
      <div
        class="flex justify-center"
      >
        <Vue3Lottie
          :animationData="
            animationData
          "
          :height="130"
          :width="130"
        />
      </div>

      <!-- TITLE -->
      <h2
        class="mt-2 text-2xl font-black text-black leading-none"
      >
        {{
          title
        }}
      </h2>

      <!-- MESSAGE -->
      <p
        class="mt-3 text-sm font-black text-black/70 leading-5"
      >
        {{
          message
        }}
      </p>

      <!-- BUTTON -->
      <button
        v-if="
          status !== 'loading'
        "
        @click="
          closeModal
        "
        class="mt-5 w-full bg-[#FF2AA3] border-4 border-black rounded-2xl py-3 text-white text-sm font-black shadow-[0_5px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000]"
      >
        OKAY
      </button>
    </section>
  </div>
</template>