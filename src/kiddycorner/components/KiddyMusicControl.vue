<template>
  <div>
    <button
      type="button"
      class="music-control-button fixed bottom-24 right-4 z-[9999] flex h-14 w-14 items-center justify-center rounded-full border-4 border-black bg-[#F3F400] text-2xl font-black text-black shadow-[0_6px_0_#000] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_3px_0_#000] md:bottom-28 md:right-8 md:h-16 md:w-16 md:text-3xl"
      @click="openModal"
    >
      {{ musicState.isMuted || musicState.volume === 0 ? '🔇' : '🔊' }}
    </button>

    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 px-5"
      @click.self="closeModal"
    >
      <section
        class="bubble-in w-full max-w-md rounded-[2rem] border-4 border-black bg-[#1A1A1A] p-5 text-center shadow-[0_10px_0_#000] md:p-6"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="text-left">
            <h2 class="text-2xl font-black uppercase tracking-[0.16em] text-[#F3F400] md:text-3xl">
              MUSIC
            </h2>

            <p class="mt-1 text-xs font-black uppercase tracking-[0.18em] text-white/75">
              Background volume
            </p>
          </div>

          <button
            type="button"
            class="flex h-12 w-12 items-center justify-center rounded-full border-4 border-black bg-[#F3F400] text-2xl font-black text-black shadow-[0_5px_0_#000] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_2px_0_#000]"
            :aria-label="musicState.isMuted ? 'Unmute music' : 'Mute music'"
            @click="handleMuteToggle"
          >
            {{ musicState.isMuted || musicState.volume === 0 ? '🔇' : '🔊' }}
          </button>
        </div>

        <div class="mt-8 text-center text-xs font-black uppercase tracking-[0.22em] text-[#BFD6EA]">
          VOLUME
        </div>

        <div
          ref="knobWrapRef"
          class="volume-knob-wrap relative mx-auto mt-2 flex aspect-square w-full max-w-[320px] items-center justify-center"
          @pointerdown="handleKnobPointerDown"
        >
          <div
            v-for="tick in ticks"
            :key="tick.index"
            class="volume-tick absolute left-1/2 top-1/2 h-[18px] w-[4px] origin-center rounded-full"
            :class="tick.index <= activeTickIndex ? 'bg-[#8CD4FF] shadow-[0_0_10px_rgba(140,212,255,0.95)]' : 'bg-white/18'"
            :style="getTickStyle(tick.angle)"
          />

          <div
            class="volume-knob relative z-10 flex aspect-square h-[62%] w-[62%] shrink-0 items-center justify-center rounded-full border-[5px] border-black bg-[#151515] shadow-[inset_0_0_22px_rgba(255,255,255,0.04),0_10px_18px_rgba(0,0,0,0.55)]"
          >
            <div
              class="pointer-events-none absolute text-4xl font-black leading-none text-[#8CD4FF]/20 md:text-5xl"
            >
              {{ displayedVolume }}%
            </div>

            <div
              class="knob-dot absolute h-4 w-4 rounded-full border-2 border-white bg-[#8CD4FF] shadow-[0_0_12px_rgba(140,212,255,1)]"
              :style="knobDotStyle"
            />
          </div>
        </div>

        <div class="-mt-2 grid grid-cols-4 items-center px-10 text-xs font-black uppercase tracking-[0.16em] text-[#BFD6EA]">
          <button
            type="button"
            class="text-left text-xs font-black uppercase tracking-[0.16em] text-[#BFD6EA] transition hover:text-[#8CD4FF] active:scale-90"
            aria-label="Lower music volume"
            @click="decreaseVolume"
          >
            -
          </button>

          <span class="text-left">
            MIN
          </span>

          <span class="text-right">
            MAX
          </span>

          <button
            type="button"
            class="text-right text-xs font-black uppercase tracking-[0.16em] text-[#BFD6EA] transition hover:text-[#8CD4FF] active:scale-90"
            aria-label="Raise music volume"
            @click="increaseVolume"
          >
            +
          </button>
        </div>

        <input
          class="sr-only"
          type="range"
          min="0"
          max="100"
          step="1"
          :value="displayedVolume"
          @input="handleVolumeChange"
        />

        <div class="mt-7 flex justify-center">
          <button
            type="button"
            class="w-full max-w-[260px] rounded-2xl border-4 border-black bg-[#03B5EC] px-8 py-3 text-sm font-black text-black shadow-[0_5px_0_#000] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_2px_0_#000] md:max-w-[300px]"
            @click="closeModal"
          >
            DONE
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'

import {
  useKiddyMusic,
} from '../utils/kiddyMusicController'

const {
  musicState,
  initKiddyMusic,
  startKiddyMusic,
  stopKiddyMusic,
  setKiddyMusicVolume,
  toggleKiddyMusicMute,
} = useKiddyMusic()

const isModalOpen = ref(false)

const knobWrapRef = ref(null)

const tickCount = 42

const minAngle = -135

const maxAngle = 135

const angleRange = maxAngle - minAngle

const volumeStep = 5

const ticks = computed(() => {
  return Array.from({ length: tickCount }, (_, index) => {
    const ratio = index / (tickCount - 1)

    return {
      index,
      angle: minAngle + ratio * angleRange,
    }
  })
})

const displayedVolume = computed(() => {
  if (musicState.isMuted) {
    return 0
  }

  return Number(musicState.volume) || 0
})

const activeTickIndex = computed(() => {
  return Math.round((displayedVolume.value / 100) * (tickCount - 1))
})

const knobAngle = computed(() => {
  return minAngle + (displayedVolume.value / 100) * angleRange
})

const knobDotStyle = computed(() => {
  const radius = 38
  const angleInRadians = (knobAngle.value - 90) * (Math.PI / 180)
  const x = Math.cos(angleInRadians) * radius
  const y = Math.sin(angleInRadians) * radius

  return {
    left: `calc(50% + ${x}% - 0.5rem)`,
    top: `calc(50% + ${y}% - 0.5rem)`,
  }
})

const getTickStyle = (angle) => {
  return {
    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-142px)`,
  }
}

const clampVolume = (volume) => {
  return Math.min(100, Math.max(0, Math.round(volume)))
}

const applyVolume = (volume) => {
  const newVolume = clampVolume(volume)

  setKiddyMusicVolume(newVolume)

  if (newVolume > 0) {
    startKiddyMusic()
  }
}

const setVolumeFromPointer = (event) => {
  const knobWrap = knobWrapRef.value

  if (!knobWrap) {
    return
  }

  const rect = knobWrap.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  const x = event.clientX - centerX
  const y = event.clientY - centerY

  let angle = Math.atan2(y, x) * (180 / Math.PI) + 90

  if (angle > 180) {
    angle -= 360
  }

  const clampedAngle = Math.min(maxAngle, Math.max(minAngle, angle))
  const volume = ((clampedAngle - minAngle) / angleRange) * 100

  applyVolume(volume)
}

const handlePointerMove = (event) => {
  setVolumeFromPointer(event)
}

const handlePointerUp = () => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', handlePointerUp)
}

const handleKnobPointerDown = (event) => {
  event.preventDefault()

  setVolumeFromPointer(event)

  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', handlePointerUp)
}

const openModal = () => {
  startKiddyMusic()
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const handleVolumeChange = (event) => {
  const volume = Number(event.target.value)

  applyVolume(volume)
}

const increaseVolume = () => {
  applyVolume(displayedVolume.value + volumeStep)
}

const decreaseVolume = () => {
  applyVolume(displayedVolume.value - volumeStep)
}

const handleMuteToggle = () => {
  toggleKiddyMusicMute()

  if (!musicState.isMuted && musicState.volume > 0) {
    startKiddyMusic()
  }
}

onMounted(() => {
  initKiddyMusic()
})

onBeforeUnmount(() => {
  handlePointerUp()
  stopKiddyMusic()
})
</script>

<style scoped>
.music-control-button {
  animation: musicButtonBubble 1.15s ease-in-out infinite;
}

.music-control-button:hover {
  transform: scale(1.08);
}

.bubble-in {
  animation: bubbleIn 0.42s ease both;
}

.volume-knob-wrap {
  touch-action: none;
  user-select: none;
}

.volume-knob {
  cursor: grab;
}

.volume-knob:active {
  cursor: grabbing;
}

.volume-tick {
  transition:
    background-color 0.12s ease,
    box-shadow 0.12s ease;
}

.knob-dot {
  pointer-events: none;
}

@keyframes musicButtonBubble {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.08);
  }

  100% {
    transform: scale(1);
  }
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