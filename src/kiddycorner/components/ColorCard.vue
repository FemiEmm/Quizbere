<template>
  <button
    type="button"
    class="color-card"
    :class="[
      variant === 'main'
        ? 'main-color-card main-card-bubble'
        : 'option-color-card',
      shouldJiggle ? 'jiggle-answer' : '',
      isCorrect ? 'correct-bubble' : '',
    ]"
    :style="{ backgroundColor: color.hex }"
    @click="$emit('select', color)"
  >
    <div
      class="inner-color-card"
      :class="variant === 'main' ? 'main-inner' : 'option-inner'"
    >
      <p
        class="color-name"
        :class="[
          variant === 'main' ? 'main-name' : 'option-name',
          color.id === 'black' ? 'text-white' : 'text-black',
        ]"
      >
        {{ color.name }}
      </p>

      <p
        v-if="variant === 'main'"
        class="mt-2 text-xs font-black uppercase tracking-[0.16em] md:text-sm"
        :class="color.id === 'black' ? 'text-white/80' : 'text-black/70'"
      >
        Tap me
      </p>
    </div>
  </button>
</template>

<script setup>
defineProps({
  color: {
    type: Object,
    required: true,
  },

  variant: {
    type: String,
    default: 'option',
  },

  shouldJiggle: {
    type: Boolean,
    default: false,
  },

  isCorrect: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['select'])
</script>

<style scoped>
.color-card {
  min-width: 0;
  border: 4px solid black;
  box-shadow: 0 6px 0 #000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
  overflow: hidden;
}

.color-card:active {
  transform: translateY(3px);
  box-shadow: 0 3px 0 #000;
}

.option-color-card {
  width: 78%;
  height: 78%;
  justify-self: center;
  align-self: center;
  border-radius: 1.4rem;
}

.main-color-card {
  width: min(100%, 46vh);
  height: min(100%, 58vh);
  max-width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 2rem;
  padding: 0.8rem;
  box-shadow: 0 8px 0 #000, 0 14px 24px rgba(0, 0, 0, 0.18);
}

.inner-color-card {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.option-inner {
  border-radius: 1rem;
}

.main-inner {
  border-radius: 1.5rem;
}

.color-name {
  font-weight: 1000;
  line-height: 1;
}

.option-name {
  font-size: clamp(0.7rem, 1.8vw, 1.2rem);
}

.main-name {
  font-size: clamp(2.3rem, 5vw, 4.5rem);
}

.main-card-bubble {
  animation: mainCardBubble 1.2s ease-in-out infinite;
}

.jiggle-answer {
  animation: jiggleAnswer 0.42s ease-in-out;
}

.correct-bubble {
  animation: correctBubble 0.55s ease-in-out;
}

@keyframes mainCardBubble {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.045);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes jiggleAnswer {
  0% {
    transform: translateX(0) scale(1);
  }

  20% {
    transform: translateX(-8px) scale(1.06);
  }

  40% {
    transform: translateX(8px) scale(1.06);
  }

  60% {
    transform: translateX(-6px) scale(1.06);
  }

  80% {
    transform: translateX(6px) scale(1.06);
  }

  100% {
    transform: translateX(0) scale(1);
  }
}

@keyframes correctBubble {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.14);
  }

  100% {
    transform: scale(1);
  }
}

@media (max-width: 640px) {
  .main-color-card {
    width: min(100%, 36vh);
    height: min(100%, 44vh);
    border-radius: 1.5rem;
  }

  .option-color-card {
    width: 82%;
    height: 82%;
    border-radius: 1.2rem;
  }

  .option-name {
    font-size: 0.75rem;
  }
}
</style>