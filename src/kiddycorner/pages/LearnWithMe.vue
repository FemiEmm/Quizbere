<template>
  <main class="relative h-dvh w-full overflow-hidden bg-[#03B5EC] px-4 py-3 pb-28 sm:px-5 md:px-8 md:py-4 md:pb-28">
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
            <p class="text-sm font-black uppercase tracking-[0.18em] text-[#F3F400] md:text-base">
              LEARN WITH ME
            </p>
          </div>

          <div class="rounded-2xl border-4 border-black bg-[#F3F400] px-4 py-2 text-xs font-black text-black shadow-[0_5px_0_#000] md:px-5 md:py-3 md:text-sm">
            {{ currentItemIndex + 1 }} / {{ learningItems.length }}
          </div>
        </div>
      </header>

      <div
        v-if="currentItem"
        class="flex min-h-0 flex-1 flex-col gap-1"
      >
        <section class="bubble-in shrink-0 px-2 pt-2 text-center sm:px-3 md:px-5 md:pt-3">
          <h1 class="text-[2.3rem] font-black leading-none text-white sm:text-5xl md:text-6xl lg:text-7xl">
            {{ currentItem.letter }} for {{ currentItem.name }}
          </h1>

          <p class="mt-1 text-sm font-black text-black md:text-base">
            Tap the card to hear the sound.
          </p>
        </section>

        <section class="min-h-0 flex-1 overflow-hidden px-2 pb-4 pt-2 sm:px-3 sm:pb-5 sm:pt-3 md:px-5 md:pb-6 md:pt-4">
          <!-- STACKED LAYOUT FOR ALL PORTRAIT SCREENS -->
          <div class="stacked-learn-layout h-full w-full">
            <div class="flex min-h-0 items-end justify-center">
              <button
                type="button"
                class="main-card-bubble mx-auto flex aspect-square h-full max-h-[40vh] w-full max-w-[300px] flex-col overflow-hidden rounded-[2rem] p-3 shadow-[0_8px_0_#000,0_14px_24px_rgba(0,0,0,0.18)] transition active:translate-y-1 active:scale-[0.97] active:shadow-[0_4px_0_#000,0_8px_14px_rgba(0,0,0,0.14)] sm:max-w-[350px] md:max-h-[46vh] md:max-w-[420px] md:p-4"
                :class="currentCardColor"
                @click="playCurrentItemSound"
              >
                <div class="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[1.5rem] bg-white/45 md:rounded-[1.8rem]">
                  <img
                    class="h-[72%] w-[72%] select-none object-contain"
                    :src="currentItem.image"
                    :alt="currentItem.name"
                    draggable="false"
                  />
                </div>

                <div class="shrink-0 pt-2 text-center">
                  <p class="text-4xl font-black leading-none text-black md:text-5xl">
                    {{ currentItem.name }}
                  </p>

                  <p class="mt-1 text-sm font-black uppercase tracking-[0.16em] text-black/70 md:text-base">
                    {{ currentItem.category }}
                  </p>
                </div>
              </button>
            </div>

            <div class="mx-auto grid w-full max-w-[300px] grid-cols-2 gap-3 sm:max-w-[350px] md:max-w-[420px] md:gap-4">
              <button
                type="button"
                class="bubble-hover flex items-center justify-center gap-2 rounded-2xl border-4 border-black bg-white px-4 py-3 text-black shadow-[0_6px_0_#000] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_3px_0_#000] disabled:cursor-not-allowed disabled:opacity-45 md:rounded-[1.6rem] md:py-4"
                :disabled="currentItemIndex === 0"
                @click="goToPreviousItem"
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
                class="bubble-hover flex items-center justify-center gap-2 rounded-2xl border-4 border-black bg-[#F3F400] px-4 py-3 text-black shadow-[0_6px_0_#000] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_3px_0_#000] disabled:cursor-not-allowed disabled:opacity-45 md:rounded-[1.6rem] md:py-4"
                :disabled="currentItemIndex === learningItems.length - 1"
                @click="goToNextItem"
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
          <div class="side-learn-layout mx-auto h-full w-full max-w-4xl grid-cols-[auto_auto_auto] items-center justify-center gap-3 pb-4">
            <button
              type="button"
              class="bubble-hover flex h-24 w-24 flex-col items-center justify-center rounded-[1.6rem] border-4 border-black bg-white text-black shadow-[0_6px_0_#000] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_3px_0_#000] disabled:cursor-not-allowed disabled:opacity-45"
              :disabled="currentItemIndex === 0"
              @click="goToPreviousItem"
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
              class="main-card-bubble mx-2 flex aspect-square w-[min(34vw,52vh)] flex-col overflow-hidden rounded-[2rem] p-4 shadow-[0_8px_0_#000,0_14px_24px_rgba(0,0,0,0.18)] transition active:translate-y-1 active:scale-[0.97] active:shadow-[0_4px_0_#000,0_8px_14px_rgba(0,0,0,0.14)]"
              :class="currentCardColor"
              @click="playCurrentItemSound"
            >
              <div class="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[1.8rem] bg-white/45">
                <img
                  class="h-[72%] w-[72%] select-none object-contain"
                  :src="currentItem.image"
                  :alt="currentItem.name"
                  draggable="false"
                />
              </div>

              <div class="shrink-0 pt-2 text-center">
                <p class="text-5xl font-black leading-none text-black">
                  {{ currentItem.name }}
                </p>

                <p class="mt-1 text-base font-black uppercase tracking-[0.16em] text-black/70">
                  {{ currentItem.category }}
                </p>
              </div>
            </button>

            <button
              type="button"
              class="bubble-hover flex h-24 w-24 flex-col items-center justify-center rounded-[1.6rem] border-4 border-black bg-[#F3F400] text-black shadow-[0_6px_0_#000] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_3px_0_#000] disabled:cursor-not-allowed disabled:opacity-45"
              :disabled="currentItemIndex === learningItems.length - 1"
              @click="goToNextItem"
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
        <p class="text-2xl font-black text-white">
          Loading...
        </p>
      </div>
    </section>

    <button
      type="button"
      class="bubble-hover fixed bottom-24 left-4 z-[9998] rounded-2xl border-4 border-black px-5 py-3 text-sm font-black uppercase text-black shadow-[0_6px_0_#000] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_3px_0_#000] md:bottom-28 md:left-8 md:px-7 md:py-4 md:text-base"
      :class="isAutoPlaying ? 'bg-white' : 'bg-[#F3F400]'"
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
  nextTick,
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
  kiddyItems,
} from '../data/kiddyItems'

import {
  startKiddyMusic,
} from '../utils/kiddyMusicController'

const router = useRouter()

const currentItemIndex = ref(0)

const isAutoPlaying = ref(false)

const cardColors = [
  'bg-[#F3F400]',
  'bg-[#FFD0A6]',
  'bg-[#BDEBFF]',
  'bg-[#E9B7E8]',
  'bg-[#CFF0B8]',
  'bg-[#FFE3A3]',
  'bg-[#FFC1C1]',
  'bg-[#D6C7FF]',
]

const learningItems = ref([])

let autoPlayTimer = null

const autoPlayDelay = 2200

const shuffleItems = (items) => {
  return [...items].sort(() => Math.random() - 0.5)
}

const buildLearningItems = () => {
  return shuffleItems(kiddyItems).slice(0, 20)
}

learningItems.value = buildLearningItems()

const currentItem = computed(() => {
  return learningItems.value[currentItemIndex.value] || null
})

const currentCardColor = computed(() => {
  return cardColors[currentItemIndex.value % cardColors.length]
})

const playItemSound = (soundPath) => {
  startKiddyMusic()

  if (!soundPath) {
    return
  }

  try {
    const audio = new Audio(soundPath)
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

const playButtonClickSound = () => {
  startKiddyMusic()

  try {
    playAppSound('button')
  } catch (error) {
    // If button sound fails, keep the game running.
  }
}

const playCurrentItemSound = () => {
  if (!currentItem.value) {
    return
  }

  playItemSound(currentItem.value.sound)
}

const playShownItemAfterChange = async () => {
  await nextTick()

  window.setTimeout(() => {
    playCurrentItemSound()
  }, 120)
}

const stopAutoPlay = () => {
  isAutoPlaying.value = false

  if (autoPlayTimer) {
    window.clearTimeout(autoPlayTimer)
    autoPlayTimer = null
  }
}

const scheduleNextAutoSlide = () => {
  if (!isAutoPlaying.value) {
    return
  }

  if (autoPlayTimer) {
    window.clearTimeout(autoPlayTimer)
  }

  autoPlayTimer = window.setTimeout(() => {
    goToNextAutoSlide()
  }, autoPlayDelay)
}

const goToNextAutoSlide = async () => {
  if (!isAutoPlaying.value || learningItems.value.length === 0) {
    return
  }

  const nextIndex = currentItemIndex.value + 1

  if (nextIndex >= learningItems.value.length) {
    currentItemIndex.value = 0
  } else {
    currentItemIndex.value = nextIndex
  }

  await playShownItemAfterChange()

  scheduleNextAutoSlide()
}

const startAutoPlay = () => {
  if (isAutoPlaying.value || learningItems.value.length === 0) {
    return
  }

  playButtonClickSound()

  isAutoPlaying.value = true

  playCurrentItemSound()

  scheduleNextAutoSlide()
}

const toggleAutoPlay = () => {
  if (isAutoPlaying.value) {
    playButtonClickSound()
    stopAutoPlay()
    return
  }

  startAutoPlay()
}

const goToPreviousItem = () => {
  if (currentItemIndex.value === 0) {
    return
  }

  stopAutoPlay()
  playButtonClickSound()
  currentItemIndex.value -= 1
  playShownItemAfterChange()
}

const goToNextItem = () => {
  if (currentItemIndex.value >= learningItems.value.length - 1) {
    return
  }

  stopAutoPlay()
  playButtonClickSound()
  currentItemIndex.value += 1
  playShownItemAfterChange()
}

const goBackHome = () => {
  stopAutoPlay()
  router.push('/kiddycorner')
}

onMounted(() => {
  startKiddyMusic()
})

onBeforeUnmount(() => {
  stopAutoPlay()
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

.main-card-bubble {
  animation: mainCardBubble 1.2s ease-in-out infinite;
}

.main-card-bubble:hover {
  transform: scale(1.05);
}

.stacked-learn-layout {
  display: grid;
  grid-template-rows: auto auto;
  align-content: center;
  gap: 0.7rem;
  height: 100%;
}

.side-learn-layout {
  display: none;
}

@media (orientation: landscape) and (min-width: 1024px) {
  .stacked-learn-layout {
    display: none;
  }

  .side-learn-layout {
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
</style>