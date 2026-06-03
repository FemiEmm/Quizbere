<template>
  <main class="relative h-dvh w-full overflow-hidden bg-white px-4 py-3 pb-24 sm:px-5 md:px-8 md:py-4 md:pb-24">
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
              COLOR GAME
            </p>
          </div>

          <div class="rounded-2xl border-4 border-black bg-[#F3F400] px-4 py-2 text-xs font-black text-black shadow-[0_5px_0_#000] md:px-5 md:py-3 md:text-sm">
            {{ currentQuestionIndex + 1 }} / {{ colorRounds.length }}
          </div>
        </div>
      </header>

      <div
        v-if="currentColor"
        class="flex min-h-0 flex-1 flex-col gap-2"
      >
        <section class="bubble-in shrink-0 px-2 pt-2 text-center sm:px-3 md:px-5 md:pt-3">
          <h1 class="text-[2.2rem] font-black leading-none text-[#FF2AA3] sm:text-5xl md:text-6xl lg:text-7xl">
            Tap {{ currentColor.name }}
          </h1>

          <p class="mt-1 text-sm font-black text-black md:text-base">
            Tap the big card to hear the color.
          </p>
        </section>

        <section class="min-h-0 flex-1 overflow-hidden px-2 pt-3 sm:px-3 sm:pt-4 md:px-5 md:pt-5">
          <!-- STACKED LAYOUT FOR ALL PORTRAIT SCREENS -->
          <div class="stacked-color-layout h-full w-full">
            <div class="flex min-h-0 items-center justify-center">
              <div class="h-full max-h-[34vh] w-full max-w-[270px] sm:max-w-[310px] md:max-h-[40vh] md:max-w-[360px]">
                <ColorCard
                  :color="currentColor"
                  variant="main"
                  @select="playCurrentColorSound"
                />
              </div>
            </div>

            <div class="grid min-h-0 grid-cols-2 grid-rows-2 gap-3 sm:gap-4">
              <ColorCard
                v-for="option in currentOptions"
                :key="option.id"
                :color="option"
                :should-jiggle="shouldJiggle(option.id)"
                :is-correct="selectedCorrectId === option.id"
                @select="handleOptionClick"
              />
            </div>
          </div>

          <!-- SIDE LAYOUT ONLY FOR LARGE LANDSCAPE SCREENS -->
          <div class="side-color-layout mx-auto h-full w-full max-w-5xl grid-cols-[1fr_1.35fr_1fr] items-center gap-3">
            <div class="grid h-full min-w-0 grid-rows-2 gap-4">
              <ColorCard
                v-for="option in leftOptions"
                :key="option.id"
                :color="option"
                :should-jiggle="shouldJiggle(option.id)"
                :is-correct="selectedCorrectId === option.id"
                @select="handleOptionClick"
              />
            </div>

            <div class="flex h-full min-w-0 items-center justify-center px-2">
              <ColorCard
                :color="currentColor"
                variant="main"
                @select="playCurrentColorSound"
              />
            </div>

            <div class="grid h-full min-w-0 grid-rows-2 gap-4">
              <ColorCard
                v-for="option in rightOptions"
                :key="option.id"
                :color="option"
                :should-jiggle="shouldJiggle(option.id)"
                :is-correct="selectedCorrectId === option.id"
                @select="handleOptionClick"
              />
            </div>
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

    <KiddyMusicControl />

    <BottomNavbar />
  </main>
</template>

<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import BottomNavbar from '../../components/BottomNavbar.vue'

import ColorCard from '../components/ColorCard.vue'

import KiddyMusicControl from '../components/KiddyMusicControl.vue'

import {
  playSound as playAppSound,
} from '../../utils/playSound'

import {
  kiddyColors,
} from '../data/colors'

import {
  startKiddyMusic,
} from '../utils/kiddyMusicController'

const router = useRouter()

const currentQuestionIndex = ref(0)

const nudgedCorrectId = ref('')

const selectedCorrectId = ref('')

const correctSoundPath = '/kiddyanimals/sounds/gameplaycorrect.mp3'

const shuffleItems = (items) => {
  return [...items].sort(() => Math.random() - 0.5)
}

const buildColorRounds = () => {
  return shuffleItems(kiddyColors).map((color) => {
    const wrongOptions = shuffleItems(
      kiddyColors.filter((item) => item.id !== color.id),
    ).slice(0, 3)

    const options = shuffleItems([
      color,
      ...wrongOptions,
    ])

    return {
      id: color.id,
      correctColorId: color.id,
      color,
      options,
    }
  })
}

const colorRounds = ref(buildColorRounds())

const currentRound = computed(() => {
  return colorRounds.value[currentQuestionIndex.value] || null
})

const currentColor = computed(() => {
  return currentRound.value?.color || null
})

const currentOptions = computed(() => {
  return currentRound.value?.options || []
})

const leftOptions = computed(() => {
  return currentOptions.value.slice(0, 2)
})

const rightOptions = computed(() => {
  return currentOptions.value.slice(2, 4)
})

const playColorSound = (soundPath) => {
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

const playCorrectSound = () => {
  try {
    const audio = new Audio(correctSoundPath)
    audio.volume = 0.1

    const playPromise = audio.play()

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // If the correct sound is missing or blocked, keep the game running silently.
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

const playCurrentColorSound = () => {
  if (!currentColor.value) {
    return
  }

  playColorSound(currentColor.value.sound)
}

const shouldJiggle = (optionId) => {
  return nudgedCorrectId.value === optionId
}

const handleOptionClick = (option) => {
  startKiddyMusic()

  if (!currentRound.value || !option) {
    return
  }

  playButtonClickSound()
  playColorSound(option.sound)

  const isCorrect =
    option.id === currentRound.value.correctColorId

  if (isCorrect) {
    selectedCorrectId.value = option.id
    nudgedCorrectId.value = ''
    playCorrectSound()

    window.setTimeout(() => {
      goToNextRound()
    }, 700)

    return
  }

  selectedCorrectId.value = ''
  nudgedCorrectId.value = currentRound.value.correctColorId

  window.setTimeout(() => {
    nudgedCorrectId.value = ''
  }, 700)
}

const goToNextRound = () => {
  selectedCorrectId.value = ''
  nudgedCorrectId.value = ''

  const nextIndex = currentQuestionIndex.value + 1

  if (nextIndex >= colorRounds.value.length) {
    colorRounds.value = buildColorRounds()
    currentQuestionIndex.value = 0
    return
  }

  currentQuestionIndex.value = nextIndex
}

const goBackHome = () => {
  router.push('/kiddycorner')
}

onMounted(() => {
  startKiddyMusic()
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

.stacked-color-layout {
  display: grid;
  grid-template-rows: 1.05fr 1fr;
  gap: 0.75rem;
}

.side-color-layout {
  display: none;
}

@media (orientation: landscape) and (min-width: 1024px) {
  .stacked-color-layout {
    display: none;
  }

  .side-color-layout {
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
</style>