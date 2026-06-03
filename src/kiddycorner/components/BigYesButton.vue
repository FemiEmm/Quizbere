<template>
  <button
    type="button"
    :disabled="disabled"
    class="yes-bubble w-full max-w-[240px] rounded-2xl border-4 border-black px-6 py-3 text-xl font-black tracking-[0.12em] text-black shadow-[0_6px_0_#000] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_3px_0_#000] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-[0_6px_0_#000] sm:max-w-[280px] md:max-w-[320px] md:px-9 md:py-4 md:text-2xl lg:max-w-[360px]"
    :class="disabled ? 'bg-[#F3F400]' : 'bg-[#F3F400]'"
    @click="handleClick"
  >
    YES
  </button>
</template>

<script setup>
import {
  playSound,
} from '../../utils/playSound'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['confirm'])

const handleClick = () => {
  if (props.disabled) {
    return
  }

  try {
    playSound('button')
  } catch (error) {
    // If button sound fails, keep the game running.
  }

  emit('confirm')
}
</script>

<style scoped>
.yes-bubble {
  animation: yesBubble 1.05s ease-in-out infinite;
}

.yes-bubble:hover:not(:disabled) {
  transform: scale(1.08);
}

@keyframes yesBubble {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.06);
  }

  100% {
    transform: scale(1);
  }
}
</style>