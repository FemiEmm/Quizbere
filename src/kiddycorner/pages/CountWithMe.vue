<template>
  <main
    class="relative h-dvh w-full overflow-hidden px-4 py-3 pb-28 transition-colors duration-700 sm:px-5 md:px-8 md:py-4 md:pb-28"
    :style="{ backgroundColor: currentBackgroundColor }"
  >
    <section class="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden">
      <header class="bubble-in shrink-0 px-2 pb-2 sm:px-3 md:px-5">
        <div class="grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <button
            type="button"
            class="bubble-hover rounded-2xl border-4 border-black bg-white px-4 py-2 text-xs font-black text-black shadow-[0_5px_0_#000] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_2px_0_#000] md:px-5 md:py-3 md:text-sm"
            @click="goBackHome"
          >
            BACK
          </button>

          <div class="text-center">
            <p class="text-sm font-black uppercase tracking-[0.18em] text-[#FF2AA3] md:text-base">
              COUNT WITH ME
            </p>
          </div>

          <div class="rounded-2xl border-4 border-black bg-white px-4 py-2 text-xs font-black text-black shadow-[0_5px_0_#000] md:px-5 md:py-3 md:text-sm">
            {{ currentNumberIndex + 1 }} / {{ kiddyNumbers.length }}
          </div>
        </div>
      </header>

      <div
        v-if="currentNumber"
        class="flex min-h-0 flex-1 flex-col gap-1"
      >
        <section class="bubble-in shrink-0 px-2 pt-2 text-center sm:px-3 md:px-5 md:pt-3">
          <h1 class="text-[2.3rem] font-black leading-none text-[#FF2AA3] sm:text-5xl md:text-6xl lg:text-7xl">
            Number {{ currentNumber.number }}
          </h1>

          <p class="mt-1 text-sm font-black text-black md:text-base">
            Tap the card and say the number.
          </p>
        </section>

        <section class="min-h-0 flex-1 overflow-hidden px-2 pb-4 pt-2 sm:px-3 sm:pb-5 sm:pt-3 md:px-5 md:pb-6 md:pt-4">
          <!-- STACKED LAYOUT FOR ALL PORTRAIT SCREENS -->
          <div class="stacked-count-layout h-full w-full">
            <div class="flex min-h-0 items-end justify-center">
              <button
                type="button"
                class="number-card-bubble mx-auto flex aspect-square h-full max-h-[42vh] w-full max-w-[310px] flex-col items-center justify-center overflow-hidden rounded-[2.2rem] border-4 border-black bg-white p-4 text-black shadow-[0_9px_0_#000,0_15px_24px_rgba(0,0,0,0.18)] transition active:translate-y-1 active:scale-[0.97] active:shadow-[0_5px_0_#000,0_9px_14px_rgba(0,0,0,0.14)] sm:max-w-[360px] md:max-h-[48vh] md:max-w-[430px]"
                @click="playCurrentNumberSequence"
              >
                <span class="text-[8.5rem] font-black leading-none text-[#03B5EC] sm:text-[10.5rem] md:text-[12.5rem]">
                  {{ currentNumber.number }}
                </span>

                <span class="mt-1 text-4xl font-black leading-none text-[#FF2AA3] md:text-5xl">
                  {{ currentNumber.word }}
                </span>
              </button>
            </div>

            <div class="mx-auto grid w-full max-w-[310px] grid-cols-2 gap-3 sm:max-w-[360px] md:max-w-[430px] md:gap-4">
              <button
                type="button"
                class="bubble-hover flex items-center justify-center gap-2 rounded-2xl border-4 border-black bg-white px-4 py-3 text-black shadow-[0_6px_0_#000] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_3px_0_#000] md:rounded-[1.6rem] md:py-4"
                @click="goToPreviousNumber"
              >
                <span class="text-3xl font-black leading-none md:text-5xl">
                  ‹
                </span>

                <span class="text-xs font-black uppercase leading-none md:text-sm">
                  Previous
                </span>
              </button>

              <button
                type="button"
                class="bubble-hover flex items-center justify-center gap-2 rounded-2xl border-4 border-black bg-[#03B5EC] px-4 py-3 text-black shadow-[0_6px_0_#000] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_3px_0_#000] md:rounded-[1.6rem] md:py-4"
                @click="goToNextNumber"
              >
                <span class="text-xs font-black uppercase leading-none md:text-sm">
                  Next
                </span>

                <span class="text-3xl font-black leading-none md:text-5xl">
                  ›
                </span>
              </button>
            </div>
          </div>

          <!-- SIDE LAYOUT ONLY FOR LARGE LANDSCAPE SCREENS -->
          <div class="side-count-layout mx-auto h-full w-full max-w-4xl grid-cols-[auto_auto_auto] items-center justify-center gap-3 pb-4">
            <button
              type="button"
              class="bubble-hover flex h-24 w-24 flex-col items-center justify-center rounded-[1.6rem] border-4 border-black bg-white text-black shadow-[0_6px_0_#000] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_3px_0_#000]"
              @click="goToPreviousNumber"
            >
              <span class="text-5xl font-black leading-none">
                ‹
              </span>

              <span class="text-xs font-black uppercase leading-none">
                Previous
              </span>
            </button>

            <button
              type="button"
              class="number-card-bubble mx-2 flex aspect-square w-[min(36vw,56vh)] flex-col items-center justify-center overflow-hidden rounded-[2.2rem] border-4 border-black bg-white p-4 text-black shadow-[0_9px_0_#000,0_15px_24px_rgba(0,0,0,0.18)] transition active:translate-y-1 active:scale-[0.97] active:shadow-[0_5px_0_#000,0_9px_14px_rgba(0,0,0,0.14)]"
              @click="playCurrentNumberSequence"
            >
              <span class="text-[10.5rem] font-black leading-none text-[#03B5EC]">
                {{ currentNumber.number }}
              </span>

              <span class="mt-1 text-5xl font-black leading-none text-[#FF2AA3]">
                {{ currentNumber.word }}
              </span>
            </button>

            <button
              type="button"
              class="bubble-hover flex h-24 w-24 flex-col items-center justify-center rounded-[1.6rem] border-4 border-black bg-[#03B5EC] text-black shadow-[0_6px_0_#000] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_3px_0_#000]"
              @click="goToNextNumber"
            >
              <span class="text-5xl font-black leading-none">
                ›
              </span>

              <span class="text-xs font-black uppercase leading-none">
                Next
              </span>
            </button>
          </div>
        </section>
      </div>

      <div
        v-else
        class="flex flex-1 items-center justify-center"
      >
        <p class="text-2xl font-black text-[#FF2AA3]">
          Loading...
        </p>
      </div>
    </section>

    <button
      type="button"
      class="bubble-hover fixed bottom-24 left-4 z-[9998] rounded-2xl border-4 border-black px-5 py-3 text-sm font-black uppercase text-black shadow-[0_6px_0_#000] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_3px_0_#000] md:bottom-28 md:left-8 md:px-7 md:py-4 md:text-base"
      :class="isAutoPlaying ? 'bg-white' : 'bg-[#03B5EC]'"
      @click="toggleAutoPlay"
    >
      {{ isAutoPlaying ? 'STOP' : 'PLAY' }}
    </button>

    <KiddyMusicControl />

    <BottomNavbar />
  </main>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import BottomNavbar from '../../components/BottomNavbar.vue'

import {
  playSound as playAppSound,
} from '../../utils/playSound'

import KiddyMusicControl from '../components/KiddyMusicControl.vue'

import {
  kiddyNumbers,
} from '../data/numbers'

import {
  startKiddyMusic,
} from '../utils/kiddyMusicController'

const router = useRouter()

const currentNumberIndex = ref(0)

const currentBackgroundIndex = ref(0)

const isAutoPlaying = ref(false)

const backgroundColors = [
  '#F3F400',
  '#03B5EC',
  '#FFB3D9',
  '#CFF0B8',
  '#FFD0A6',
  '#D6C7FF',
  '#FFE3A3',
  '#BDEBFF',
]

const greatJobSoundPath = '/kiddynumbers/sounds/great-job.mp3'

const audioVolume = 0.9

const responsePause = 2000

const autoPauseAfterSequence = 1600

let activeAudio = null

let autoPlayTimer = null

let backgroundTimer = null

let mountPlayTimer = null

let sequenceToken = 0

const currentNumber = computed(() => {
  return kiddyNumbers[currentNumberIndex.value] || null
})

const currentBackgroundColor = computed(() => {
  return backgroundColors[currentBackgroundIndex.value] || '#F3F400'
})

const wait = (milliseconds) => {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })
}

const clearAutoPlayTimer = () => {
  if (autoPlayTimer) {
    window.clearTimeout(autoPlayTimer)
    autoPlayTimer = null
  }
}

const clearMountPlayTimer = () => {
  if (mountPlayTimer) {
    window.clearTimeout(mountPlayTimer)
    mountPlayTimer = null
  }
}

const stopBackgroundColorLoop = () => {
  if (backgroundTimer) {
    window.clearInterval(backgroundTimer)
    backgroundTimer = null
  }
}

const startBackgroundColorLoop = () => {
  stopBackgroundColorLoop()

  backgroundTimer = window.setInterval(() => {
    currentBackgroundIndex.value =
      (currentBackgroundIndex.value + 1) % backgroundColors.length
  }, 3000)
}

const stopActiveAudio = () => {
  if (!activeAudio) {
    return
  }

  try {
    activeAudio.pause()
    activeAudio.currentTime = 0
  } catch (error) {
    // If stopping audio fails, keep the app running.
  }

  activeAudio = null
}

const cancelCurrentSequence = () => {
  sequenceToken += 1
  stopActiveAudio()
}

const safePlayAudio = (soundPath, volume = audioVolume) => {
  return new Promise((resolve) => {
    if (!soundPath) {
      resolve()
      return
    }

    try {
      const audio = new Audio(soundPath)

      activeAudio = audio
      audio.volume = volume

      const finish = () => {
        if (activeAudio === audio) {
          activeAudio = null
        }

        resolve()
      }

      audio.onended = finish
      audio.onerror = finish

      const playPromise = audio.play()

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          finish()
        })
      }
    } catch (error) {
      resolve()
    }
  })
}

const playButtonClickSound = () => {
  startKiddyMusic()

  try {
    playAppSound('button')
  } catch (error) {
    // If button sound fails, keep the game running.
  }
}

const continueIfSameSequence = (localToken) => {
  return localToken === sequenceToken
}

const playNumberSequence = async (numberItem) => {
  if (!numberItem) {
    return
  }

  cancelCurrentSequence()

  const localToken = sequenceToken

  startKiddyMusic()

  // Example: one.mp3
  await safePlayAudio(numberItem.sound)

  if (!continueIfSameSequence(localToken)) {
    return
  }

  await wait(responsePause)

  if (!continueIfSameSequence(localToken)) {
    return
  }

  // Example: say-one.mp3
  await safePlayAudio(numberItem.saySound)

  if (!continueIfSameSequence(localToken)) {
    return
  }

  await wait(responsePause)

  if (!continueIfSameSequence(localToken)) {
    return
  }

  // Example: one.mp3 again
  await safePlayAudio(numberItem.sound)

  if (!continueIfSameSequence(localToken)) {
    return
  }

  await wait(responsePause)

  if (!continueIfSameSequence(localToken)) {
    return
  }

  // Shared praise sound
  await safePlayAudio(greatJobSoundPath)
}

const playCurrentNumberSequence = () => {
  playNumberSequence(currentNumber.value)
}

const playCurrentNumberAfterChange = () => {
  clearMountPlayTimer()

  mountPlayTimer = window.setTimeout(() => {
    playCurrentNumberSequence()
  }, 120)
}

const goToPreviousNumber = () => {
  clearAutoPlayTimer()
  clearMountPlayTimer()
  isAutoPlaying.value = false
  cancelCurrentSequence()
  playButtonClickSound()

  if (currentNumberIndex.value === 0) {
    currentNumberIndex.value = kiddyNumbers.length - 1
  } else {
    currentNumberIndex.value -= 1
  }

  playCurrentNumberAfterChange()
}

const goToNextNumber = () => {
  clearAutoPlayTimer()
  clearMountPlayTimer()
  isAutoPlaying.value = false
  cancelCurrentSequence()
  playButtonClickSound()

  if (currentNumberIndex.value >= kiddyNumbers.length - 1) {
    currentNumberIndex.value = 0
  } else {
    currentNumberIndex.value += 1
  }

  playCurrentNumberAfterChange()
}

const goToNextAutoNumber = () => {
  if (currentNumberIndex.value >= kiddyNumbers.length - 1) {
    currentNumberIndex.value = 0
  } else {
    currentNumberIndex.value += 1
  }
}

const runAutoPlay = async () => {
  if (!isAutoPlaying.value) {
    return
  }

  await playNumberSequence(currentNumber.value)

  if (!isAutoPlaying.value) {
    return
  }

  autoPlayTimer = window.setTimeout(() => {
    goToNextAutoNumber()
    runAutoPlay()
  }, autoPauseAfterSequence)
}

const startAutoPlay = () => {
  if (isAutoPlaying.value || kiddyNumbers.length === 0) {
    return
  }

  clearAutoPlayTimer()
  clearMountPlayTimer()
  cancelCurrentSequence()
  playButtonClickSound()

  isAutoPlaying.value = true

  runAutoPlay()
}

const stopAutoPlay = () => {
  isAutoPlaying.value = false
  clearAutoPlayTimer()
  clearMountPlayTimer()
  cancelCurrentSequence()
}

const toggleAutoPlay = () => {
  if (isAutoPlaying.value) {
    playButtonClickSound()
    stopAutoPlay()
    return
  }

  startAutoPlay()
}

const goBackHome = () => {
  stopAutoPlay()
  stopBackgroundColorLoop()
  router.push('/kiddycorner')
}

onMounted(() => {
  startKiddyMusic()
  startBackgroundColorLoop()

  mountPlayTimer = window.setTimeout(() => {
    playCurrentNumberSequence()
  }, 450)
})

onBeforeUnmount(() => {
  stopAutoPlay()
  clearMountPlayTimer()
  stopBackgroundColorLoop()
})
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

.bubble-hover:hover:not(:disabled) {
  transform: scale(1.05);
}

.number-card-bubble {
  animation: numberCardBubble 1.2s ease-in-out infinite;
}

.number-card-bubble:hover {
  transform: scale(1.05);
}

.stacked-count-layout {
  display: grid;
  grid-template-rows: auto auto;
  align-content: center;
  gap: 0.7rem;
  height: 100%;
}

.side-count-layout {
  display: none;
}

@media (orientation: landscape) and (min-width: 1024px) {
  .stacked-count-layout {
    display: none;
  }

  .side-count-layout {
    display: grid;
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

@keyframes numberCardBubble {
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
</style>