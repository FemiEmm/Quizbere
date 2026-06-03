<template>
  <main class="relative h-dvh w-full overflow-hidden bg-[#FF2AA3] px-3 py-2 pb-24 md:px-6 md:py-3 md:pb-24">
    <section class="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden">
      <header class="bubble-in grid shrink-0 grid-cols-[auto_1fr_auto] items-center gap-3 pb-1 md:pb-2">
        <button
          type="button"
          class="bubble-hover rounded-2xl border-4 border-black bg-white px-4 py-2 text-xs font-black text-black shadow-[0_5px_0_#000] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_2px_0_#000] md:px-5 md:py-3 md:text-sm"
          @click="goBack"
        >
          BACK
        </button>

        <div class="text-center">
          <p class="text-sm font-black uppercase tracking-[0.18em] text-[#F3F400] md:text-base">
            KIDDY CORNER
          </p>
        </div>

        <div class="rounded-2xl border-4 border-black bg-[#F3F400] px-4 py-2 text-xs font-black text-black shadow-[0_5px_0_#000] md:px-5 md:py-3 md:text-sm">
          {{ currentQuestionIndex + 1 }} / {{ questions.length }}
        </div>
      </header>

      <div class="flex min-h-0 flex-1 flex-col gap-2">
        <section class="bubble-in shrink-0 text-center">
          <h1 class="text-[2.65rem] font-black leading-none text-white sm:text-5xl md:text-6xl lg:text-7xl">
            {{ currentQuestion.prompt }}
          </h1>

          <p class="mt-1 text-sm font-black text-black md:text-base">
            Tap the correct animal.
          </p>
        </section>

        <section class="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
          <div
            class="grid aspect-square w-[min(74vw,46vh)] grid-cols-2 gap-3 sm:w-[min(62vw,48vh)] md:w-[min(48vw,50vh)] md:gap-4 lg:w-[min(36vw,52vh)]"
          >
            <AnimalCard
              v-for="animal in optionAnimals"
              :key="animal.id"
              :animal="animal"
              :is-selected="selectedAnswer === animal.id"
              @select="selectAnswer"
            />
          </div>
        </section>

        <section class="bubble-in flex shrink-0 justify-center pb-2">
          <BigYesButton
            :disabled="!selectedAnswer"
            @confirm="confirmAnswer"
          />
        </section>
      </div>

      <div
        v-if="showFeedback"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      >
        <div class="bubble-in w-full max-w-sm rounded-[2rem] border-4 border-black bg-white p-6 text-center shadow-[0_10px_0_#000] md:max-w-md">
          <div
            class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-black text-4xl shadow-[0_5px_0_#000]"
            :class="isCorrect ? 'bg-[#F3F400]' : 'bg-[#FD9501]'"
          >
            {{ isCorrect ? '🎉' : '🙂' }}
          </div>

          <h2
            class="text-3xl font-black md:text-4xl"
            :class="isCorrect ? 'text-[#03B5EC]' : 'text-[#FD9501]'"
          >
            {{ isCorrect ? 'CORRECT!' : 'TRY AGAIN' }}
          </h2>

          <p class="mt-3 text-base font-black text-black md:text-lg">
            {{ feedbackMessage }}
          </p>
        </div>
      </div>

      <div
        v-if="isGameFinished"
        class="fixed inset-0 z-50 flex items-center justify-center bg-[#FF2AA3] px-6"
      >
        <div class="bubble-in w-full max-w-md rounded-[2.5rem] border-4 border-black bg-[#F3F400] p-7 text-center shadow-[0_10px_0_#000]">
          <div class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-black bg-white text-5xl shadow-[0_5px_0_#000]">
            🏆
          </div>

          <h2 class="text-4xl font-black text-black md:text-5xl">
            WELL DONE!
          </h2>

          <p class="mt-3 text-base font-black text-black/80 md:text-lg">
            You finished the animal game.
          </p>

          <button
            type="button"
            class="bubble-hover mt-6 w-full rounded-2xl border-4 border-black bg-[#FF2AA3] px-8 py-4 text-lg font-black text-white shadow-[0_6px_0_#000] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_3px_0_#000]"
            @click="restartGame"
          >
            PLAY AGAIN
          </button>

          <button
            type="button"
            class="bubble-hover mt-4 w-full rounded-2xl border-4 border-black bg-white px-8 py-4 text-base font-black text-black shadow-[0_6px_0_#000] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_3px_0_#000]"
            @click="goBack"
          >
            GO HOME
          </button>
        </div>
      </div>
    </section>

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

import AnimalCard from '../components/AnimalCard.vue'

import BigYesButton from '../components/BigYesButton.vue'

import BottomNavbar from '../../components/BottomNavbar.vue'

import {
  kiddyAnimals,
} from '../data/animals'

import {
  aForWhatQuestions,
} from '../data/aForWhatQuestions'

const router = useRouter()

const questions = aForWhatQuestions

const currentQuestionIndex = ref(0)

const selectedAnswer = ref('')

const showFeedback = ref(false)

const isCorrect = ref(false)

const isGameFinished = ref(false)

let gameplayAudio = null

const gameplaySoundPath = '/kiddyanimals/sounds/gameplaysound.mp3'

const correctSoundPath = '/kiddyanimals/sounds/gameplaycorrect.mp3'

const currentQuestion = computed(() => {
  return questions[currentQuestionIndex.value]
})

const optionAnimals = computed(() => {
  return currentQuestion.value.options
    .map((animalId) => kiddyAnimals.find((animal) => animal.id === animalId))
    .filter(Boolean)
})

const correctAnimal = computed(() => {
  return kiddyAnimals.find((animal) => animal.id === currentQuestion.value.correctAnswer)
})

const feedbackMessage = computed(() => {
  if (isCorrect.value) {
    return `${currentQuestion.value.letter} is for ${correctAnimal.value?.name || 'this animal'}!`
  }

  return 'Pick another animal and try again.'
})

const startGameplaySound = () => {
  if (gameplayAudio) {
    return
  }

  try {
    gameplayAudio = new Audio(gameplaySoundPath)
    gameplayAudio.loop = true
    gameplayAudio.volume = 0.1

    const playPromise = gameplayAudio.play()

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Some browsers block autoplay until the child taps the screen.
      })
    }
  } catch (error) {
    gameplayAudio = null
  }
}

const stopGameplaySound = () => {
  if (!gameplayAudio) {
    return
  }

  gameplayAudio.pause()
  gameplayAudio.currentTime = 0
  gameplayAudio = null
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

const selectAnswer = (animalId) => {
  startGameplaySound()
  selectedAnswer.value = animalId
}

const confirmAnswer = () => {
  startGameplaySound()

  if (!selectedAnswer.value) {
    return
  }

  isCorrect.value = selectedAnswer.value === currentQuestion.value.correctAnswer

  if (isCorrect.value) {
    playCorrectSound()
  }

  showFeedback.value = true

  window.setTimeout(() => {
    showFeedback.value = false

    if (isCorrect.value) {
      goToNextQuestion()
    }

    selectedAnswer.value = ''
  }, isCorrect.value ? 850 : 750)
}

const goToNextQuestion = () => {
  const nextIndex = currentQuestionIndex.value + 1

  if (nextIndex >= questions.length) {
    isGameFinished.value = true
    stopGameplaySound()
    return
  }

  currentQuestionIndex.value = nextIndex
}

const restartGame = () => {
  currentQuestionIndex.value = 0
  selectedAnswer.value = ''
  showFeedback.value = false
  isCorrect.value = false
  isGameFinished.value = false
  startGameplaySound()
}

const goBack = () => {
  stopGameplaySound()
  router.push('/kiddycorner')
}

onMounted(() => {
  startGameplaySound()
})

onBeforeUnmount(() => {
  stopGameplaySound()
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

.bubble-hover:hover {
  transform: scale(1.05);
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