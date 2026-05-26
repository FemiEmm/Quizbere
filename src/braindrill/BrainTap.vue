<!-- src/braindrill/BrainTap.vue -->

<script setup>
import {
  computed,
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
    'complete',
  ])

/* -----------------------------
   STATE
----------------------------- */

const selectedItems =
  ref([])

const locked =
  ref(false)

/* -----------------------------
   RESET
----------------------------- */

watch(
  () => props.question,
  () => {
    selectedItems.value =
      []

    locked.value =
      false
  },
)

/* -----------------------------
   SHUFFLED OPTIONS
----------------------------- */

const shuffledOptions =
  computed(() => {
    if (
      !props.question
    ) {
      return []
    }

    return [
      ...props.question.options,
    ].sort(
      () =>
        Math.random() -
        0.5,
    )
  })

/* -----------------------------
   TAP
----------------------------- */

const tapOption =
  (option) => {
    if (
      locked.value
    ) {
      return
    }

    if (
      selectedItems.value.includes(
        option,
      )
    ) {
      return
    }

    selectedItems.value.push(
      option,
    )

    /* CHECK COMPLETE */

    const correctAnswers =
      props.question.answers

    const allCorrect =
      correctAnswers.every(
        (
          answer,
        ) =>
          selectedItems.value.includes(
            answer,
          ),
      )

    const wrongTap =
      !correctAnswers.includes(
        option,
      )

    /* FAIL */

    if (
      wrongTap
    ) {
      locked.value =
        true

      emit(
        'fail',
      )

      setTimeout(() => {
        emit(
          'complete',
        )
      }, 700)

      return
    }

    /* SUCCESS */

    if (
      allCorrect
    ) {
      locked.value =
        true

      emit(
        'success',
      )

      setTimeout(() => {
        emit(
          'complete',
        )
      }, 700)
    }
  }

/* -----------------------------
   STYLE
----------------------------- */

const getButtonClass =
  (option) => {
    if (
      selectedItems.value.includes(
        option,
      )
    ) {
      if (
        props.question.answers.includes(
          option,
        )
      ) {
        return 'bg-green-400'
      }

      return 'bg-red-400'
    }

    return 'bg-[#03B5EC]'
  }
</script>

<template>
  <div
    v-if="question"
  >
    <!-- TOP -->
    <div
      class="text-center"
    >
      <p
        class="text-[11px] font-black text-black/50"
      >
        TAP GAME
        {{
          questionIndex +
          1
        }}/{{ totalQuestions }}
      </p>

      <h1
        class="mt-4 text-2xl font-black text-black leading-tight"
      >
        {{
          question.task
        }}
      </h1>
    </div>

    <!-- GRID -->
    <div
      class="mt-7 grid grid-cols-2 gap-3"
    >
      <button
        v-for="option in shuffledOptions"
        :key="option"
        @click="
          tapOption(
            option,
          )
        "
        class="border-4 border-black rounded-2xl py-5 px-3 text-base font-black text-black transition-all duration-150"
        :class="
          getButtonClass(
            option,
          )
        "
      >
        {{ option }}
      </button>
    </div>
  </div>
</template>