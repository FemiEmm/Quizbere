<!-- src/components/AppLoader.vue -->

<script setup>
import { Vue3Lottie } from 'vue3-lottie'

import loadingAnimation from '../assets/lottie/loading_motion.json'
</script>

<template>
  <div
    class="fixed inset-0 z-[999] flex items-center justify-center"
  >
    <Vue3Lottie
      :animationData="loadingAnimation"
      :height="140"
      :width="140"
    />
  </div>
</template>