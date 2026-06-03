<template>
  <button
    type="button"
    class="bubble-in bubble-hover flex aspect-square w-full flex-col overflow-hidden rounded-[1.4rem] p-2 shadow-[0_7px_0_#d8e7ff,0_12px_22px_rgba(42,73,120,0.14)] transition active:translate-y-1 active:scale-[0.97] active:shadow-[0_4px_0_#d8e7ff,0_8px_14px_rgba(42,73,120,0.12)] md:rounded-[1.8rem] md:p-3"
    :class="[
      cardColor,
      isSelected
        ? 'ring-4 ring-black scale-[1.02] shadow-[0_7px_0_#000,0_12px_22px_rgba(0,0,0,0.22)]'
        : ''
    ]"
    @click="handleCardTap"
  >
    <div
      class="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[1.1rem] bg-white/35 md:rounded-[1.5rem]"
    >
      <img
        class="h-[68%] w-[68%] select-none object-contain"
        :src="animal.image"
        :alt="animal.name"
        draggable="false"
      />
    </div>

    <p class="shrink-0 pt-1 text-center text-[11px] font-black leading-tight text-slate-900 sm:text-xs md:pt-2 md:text-sm lg:text-base">
      {{ animal.name }}
    </p>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  animal: {
    type: Object,
    required: true,
  },

  isSelected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select'])

const cardColors = [
  'bg-[#FFE3A3]',
  'bg-[#BDEBFF]',
  'bg-[#FFE38A]',
  'bg-[#E9B7E8]',
  'bg-[#CFF0B8]',
  'bg-[#FFD0A6]',
  'bg-[#FFC1C1]',
  'bg-[#D6C7FF]',
]

const cardColor = computed(() => {
  const firstLetter = props.animal?.name?.charAt(0)?.toUpperCase() || 'A'
  const index = firstLetter.charCodeAt(0) % cardColors.length

  return cardColors[index]
})

const playAnimalSound = () => {
  if (!props.animal?.sound) return

  try {
    const audio = new Audio(props.animal.sound)
    audio.volume = 0.9

    const playPromise = audio.play()

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // If the sound file is missing or blocked, keep the game running silently.
      })
    }
  } catch (error) {
    // If audio fails, keep the game running silently.
  }
}

const handleCardTap = () => {
  playAnimalSound()
  emit('select', props.animal.id)
}
</script>

<style scoped>
.bubble-in {
  animation: bubbleIn 0.42s ease both;
}

.bubble-hover {
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.bubble-hover:hover {
  transform: scale(1.04);
}

@keyframes bubbleIn {
  0% {
    opacity: 0;
    transform: scale(0.78) translateY(14px);
  }

  65% {
    opacity: 1;
    transform: scale(1.04) translateY(-3px);
  }

  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>