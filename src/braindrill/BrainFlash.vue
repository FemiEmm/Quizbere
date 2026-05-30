<!-- src/braindrill/BrainFlash.vue -->

<script setup>
import {
  computed,
  onBeforeUnmount,
  ref,
  watch,
} from 'vue'

const props =
  defineProps({
    question: Object,

    questionIndex: Number,

    totalQuestions:
      Number,
  })

const emit =
  defineEmits([
    'success',
    'fail',
  ])

/* -----------------------------
   STATE
----------------------------- */

const phase =
  ref('ready')
// ready | flash | blank | answer

const locked =
  ref(false)

const selectedOption =
  ref(null)

const shuffledOptions =
  ref([])

const currentFlashIndex =
  ref(0)

const hasSeenIntro =
  ref(false)

let flashTimeout =
  null

/* -----------------------------
   HELPERS
----------------------------- */

const flashDuration =
  computed(() => {
    return (
      props.question?.flashDuration ||
      1000
    )
  })

const blankDuration =
  computed(() => {
    return (
      props.question?.blankDuration ||
      400
    )
  })

const flashItems =
  computed(() => {
    return (
      props.question?.flashItems ||
      []
    )
  })

const currentFlashItem =
  computed(() => {
    return (
      flashItems.value[
        currentFlashIndex.value
      ] || ''
    )
  })

const flashWordClass =
  computed(() => {
    const wordLength =
      String(
        currentFlashItem.value,
      ).length

    if (
      wordLength > 14
    ) {
      return 'text-2xl'
    }

    if (
      wordLength > 9
    ) {
      return 'text-3xl'
    }

    return 'text-4xl'
  })

const questionText =
  computed(() => {
    return (
      props.question?.question ||
      ''
    )
  })

const prepareOptions =
  () => {
    if (
      !props.question?.options
    ) {
      shuffledOptions.value =
        []

      return
    }

    shuffledOptions.value =
      [
        ...props.question.options,
      ].sort(
        () =>
          Math.random() -
          0.5,
      )
  }

/* -----------------------------
   RESET
----------------------------- */

const resetRound =
  () => {
    clearTimeout(
      flashTimeout,
    )

    locked.value =
      false

    selectedOption.value =
      null

    currentFlashIndex.value =
      0

    prepareOptions()

    if (
      !hasSeenIntro.value
    ) {
      phase.value =
        'ready'

      return
    }

    startFlash()
  }

watch(
  () => [
    props.question,
    props.questionIndex,
  ],
  () => {
    resetRound()
  },
  {
    immediate:
      true,
  },
)

/* -----------------------------
   FLASH SEQUENCE
----------------------------- */

const showCurrentFlash =
  () => {
    phase.value =
      'flash'

    flashTimeout =
      setTimeout(() => {
        showBlank()
      }, flashDuration.value)
  }

const showBlank =
  () => {
    phase.value =
      'blank'

    flashTimeout =
      setTimeout(() => {
        const nextIndex =
          currentFlashIndex.value +
          1

        if (
          nextIndex >=
          flashItems.value.length
        ) {
          phase.value =
            'answer'

          return
        }

        currentFlashIndex.value =
          nextIndex

        showCurrentFlash()
      }, blankDuration.value)
  }

/* -----------------------------
   START FLASH
----------------------------- */

const startFlash =
  () => {
    if (
      !props.question
    ) {
      return
    }

    clearTimeout(
      flashTimeout,
    )

    hasSeenIntro.value =
      true

    currentFlashIndex.value =
      0

    showCurrentFlash()
  }

/* -----------------------------
   ANSWER
----------------------------- */

const chooseOption =
  (option) => {
    if (
      locked.value ||
      phase.value !==
        'answer'
    ) {
      return
    }

    locked.value =
      true

    selectedOption.value =
      option

    const isCorrect =
      option ===
      props.question.answer

    if (
      isCorrect
    ) {
      emit(
        'success',
      )

      return
    }

    emit(
      'fail',
    )
  }

/* -----------------------------
   STYLE
----------------------------- */

const getButtonClass =
  (option) => {
    if (
      selectedOption.value ===
      option
    ) {
      if (
        option ===
        props.question.answer
      ) {
        return 'bg-green-400'
      }

      return 'bg-red-400'
    }

    return 'bg-[#03B5EC]'
  }

/* -----------------------------
   UNMOUNT
----------------------------- */

onBeforeUnmount(() => {
  clearTimeout(
    flashTimeout,
  )
})
</script>

<template>
  <div
    v-if="
      question
    "
  >
    <!-- TOP -->
    <div
      class="text-center"
    >
      <p
        class="text-[11px] font-black text-black/50"
      >
        FLASH GAME
        {{
          questionIndex +
          1
        }}/{{ totalQuestions }}
      </p>

      <h1
        class="mt-4 text-2xl font-black text-black leading-tight"
      >
        BrainFlash
      </h1>
    </div>

    <!-- READY SCREEN -->
    <div
      v-if="
        phase === 'ready'
      "
      class="mt-7 text-center"
    >
      <div
        class="bg-[#F3F400] border-4 border-black rounded-[2rem] p-5"
      >
        <h2
          class="text-2xl font-black text-black"
        >
          ARE YOU READY?
        </h2>

        <p
          class="mt-3 text-sm font-black text-black/70 leading-6"
        >
          Words will flash one at a time.
          Focus, remember them, then answer the question.
        </p>

        <p
          class="mt-4 text-xs font-black text-black/50"
        >
          {{
            flashItems.length
          }}
          items will flash.
        </p>
      </div>

      <button
        @click="
          startFlash
        "
        class="mt-5 w-full bg-[#03B5EC] border-4 border-black rounded-2xl py-5 text-xl font-black text-black active:scale-[0.98]"
      >
        YES, START
      </button>
    </div>

    <!-- FLASH SCREEN -->
    <div
      v-if="
        phase === 'flash'
      "
      class="mt-7"
    >
      <div
        class="min-h-[260px] bg-black border-4 border-black rounded-[2rem] p-4 text-center flex flex-col items-center justify-center overflow-hidden"
      >
        <p
          class="text-[10px] font-black text-white/60"
        >
          REMEMBER THIS
        </p>

        <h2
          class="mt-8 w-full max-w-full px-1 font-black text-white tracking-wide leading-tight text-center whitespace-normal break-words [overflow-wrap:anywhere]"
          :class="
            flashWordClass
          "
        >
          {{
            currentFlashItem
          }}
        </h2>

        <p
          class="mt-8 text-xs font-black text-white/50"
        >
          {{
            currentFlashIndex +
            1
          }}
          /
          {{
            flashItems.length
          }}
        </p>
      </div>
    </div>

    <!-- BLANK SCREEN -->
    <div
      v-if="
        phase === 'blank'
      "
      class="mt-7"
    >
      <div
        class="min-h-[260px] bg-black border-4 border-black rounded-[2rem] p-5"
      ></div>
    </div>

    <!-- ANSWER SCREEN -->
    <div
      v-if="
        phase === 'answer'
      "
      class="mt-7"
    >
      <h2
        class="text-xl font-black text-black text-center leading-tight"
      >
        {{
          questionText
        }}
      </h2>

      <div
        class="mt-6 grid grid-cols-2 gap-3"
      >
        <button
          v-for="
            option in shuffledOptions
          "
          :key="
            option
          "
          @click="
            chooseOption(
              option,
            )
          "
          :disabled="
            locked
          "
          class="border-4 border-black rounded-2xl py-5 px-3 text-base font-black text-black transition-all duration-150 disabled:opacity-80"
          :class="
            getButtonClass(
              option,
            )
          "
        >
          {{
            option
          }}
        </button>
      </div>
    </div>
  </div>
</template>