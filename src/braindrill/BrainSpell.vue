<!-- src/braindrill/BrainSpell.vue -->

<script setup>
import {
  computed,
  ref,
  watch,
} from 'vue'

import {
  playSound,
} from '../utils/playSound'

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

const selectedLetters =
  ref([])

const usedIndexes =
  ref([])

const shuffledLetters =
  ref([])

const boardLocked =
  ref(false)

const wrongFlash =
  ref(false)

/* -----------------------------
   NORMALIZE TEXT
----------------------------- */

const normalizeText =
  (value) => {
    return String(
      value || '',
    )
      .replace(
        /\s+/g,
        '',
      )
      .trim()
      .toUpperCase()
  }

/* -----------------------------
   ANSWER
----------------------------- */

const playerAnswer =
  computed(() => {
    return selectedLetters.value
      .map(
        (item) =>
          item.letter,
      )
      .join('')
  })

const correctAnswer =
  computed(() => {
    return normalizeText(
      props.question?.answer,
    )
  })

/* -----------------------------
   SHUFFLE LETTERS
----------------------------- */

const shuffleArray =
  (items) => {
    const array =
      [...items]

    for (
      let i =
        array.length - 1;
      i > 0;
      i--
    ) {
      const j =
        Math.floor(
          Math.random() *
            (i + 1),
        )

      const temp =
        array[i]

      array[i] =
        array[j]

      array[j] =
        temp
    }

    return array
  }

const generateShuffledLetters =
  () => {
    const originalLetters =
      props.question?.letters ||
      []

    if (
      originalLetters.length ===
      0
    ) {
      shuffledLetters.value =
        []

      return
    }

    let shuffled =
      shuffleArray(
        originalLetters,
      )

    let attempts =
      0

    while (
      normalizeText(
        shuffled.join(''),
      ).startsWith(
        correctAnswer.value,
      ) &&
      attempts < 20
    ) {
      shuffled =
        shuffleArray(
          originalLetters,
        )

      attempts++
    }

    if (
      normalizeText(
        shuffled.join(''),
      ).startsWith(
        correctAnswer.value,
      )
    ) {
      shuffled =
        [...originalLetters].reverse()
    }

    shuffledLetters.value =
      shuffled
  }

/* -----------------------------
   RESET QUESTION
----------------------------- */

const resetQuestion =
  () => {
    selectedLetters.value =
      []

    usedIndexes.value =
      []

    boardLocked.value =
      false

    wrongFlash.value =
      false

    generateShuffledLetters()
  }

watch(
  () =>
    props.question,
  () => {
    resetQuestion()
  },
  {
    immediate: true,
  },
)

/* -----------------------------
   SELECT LETTER
----------------------------- */

const selectLetter =
  (
    letter,
    index,
  ) => {

    if (
      boardLocked.value ||
      usedIndexes.value.includes(
        index,
      )
    ) {
      return
    }

    playSound(
      'button',
    )

    selectedLetters.value.push({
      letter,
      index,
    })

    usedIndexes.value.push(
      index,
    )
  }

/* -----------------------------
   REMOVE LAST
----------------------------- */

const removeLast =
  () => {

    if (
      boardLocked.value ||
      selectedLetters.value.length ===
        0
    ) {
      return
    }

    playSound(
      'button',
    )

    const last =
      selectedLetters.value.pop()

    usedIndexes.value =
      usedIndexes.value.filter(
        (index) =>
          index !==
          last.index,
      )
  }

/* -----------------------------
   CLEAR ANSWER
----------------------------- */

const clearAnswer =
  () => {

    if (
      boardLocked.value ||
      selectedLetters.value.length ===
        0
    ) {
      return
    }

    playSound(
      'button',
    )

    selectedLetters.value =
      []

    usedIndexes.value =
      []
  }

/* -----------------------------
   SUBMIT
----------------------------- */

const submitAnswer =
  () => {

    if (
      boardLocked.value ||
      playerAnswer.value.length ===
        0
    ) {
      return
    }

    if (
      normalizeText(
        playerAnswer.value,
      ) ===
      correctAnswer.value
    ) {

      boardLocked.value =
        true

      playSound(
        'correct',
      )

      emit(
        'success',
      )

      setTimeout(() => {
        emit(
          'complete',
        )
      }, 700)

      return
    }

    playSound(
      'wrong',
    )

    wrongFlash.value =
      true

    emit(
      'fail',
    )

    setTimeout(() => {
      wrongFlash.value =
        false
    }, 450)
  }
</script>

<template>
  <div>
    <!-- HEADER -->
    <div
      class="text-center"
    >
      <p
        class="text-[9px] font-black text-black/50"
      >
        SPELL
        {{
          questionIndex + 1
        }}/{{ totalQuestions }}
      </p>

      <h1
        class="mt-1 text-lg font-black text-black"
      >
        SPELL THE ANSWER
      </h1>

      <p
        class="mt-1 text-[11px] font-black text-black/60"
      >
        Read the clue.
        Tap letters.
        Submit your answer.
      </p>
    </div>

    <!-- CLUE -->
    <div
      class="mt-4 bg-[#F3F400] border-4 border-black rounded-2xl px-4 py-4 text-center"
    >
      <p
        class="text-sm font-black text-black leading-6"
      >
        {{
          question?.clue
        }}
      </p>
    </div>

    <!-- ANSWER DISPLAY -->
    <div
      class="mt-4 border-4 border-black rounded-2xl px-3 py-4 text-center"
      :class="[
        wrongFlash
          ? 'bg-[#FF2AA3]'
          : 'bg-white',
      ]"
    >
      <p
        class="text-[9px] font-black text-black/50"
      >
        YOUR ANSWER
      </p>

      <h2
        class="mt-2 min-h-[32px] text-2xl font-black text-black tracking-[0.25em] break-words leading-tight"
      >
        {{
          playerAnswer ||
          '...'
        }}
      </h2>
    </div>

    <!-- LETTER BOARD -->
    <div
      class="mt-4 grid grid-cols-5 gap-2"
    >
      <button
        v-for="(
          letter,
          index
        ) in shuffledLetters"
        :key="
          `${letter}-${index}`
        "
        @click="
          selectLetter(
            letter,
            index,
          )
        "
        :disabled="
          usedIndexes.includes(
            index,
          ) ||
          boardLocked
        "
        class="h-12 bg-[#03B5EC] border-4 border-black rounded-xl text-lg font-black text-black transition-all duration-100 active:scale-95 disabled:opacity-35"
      >
        {{
          letter
        }}
      </button>
    </div>

    <!-- ACTION BUTTON -->
    <div
      class="mt-4 grid grid-cols-[1fr_3fr_1fr] bg-[#FF2AA3] border-4 border-black rounded-2xl overflow-hidden shadow-[0_5px_0_#000]"
    >
      <!-- DELETE LAST -->
      <button
        @click="
          removeLast
        "
        :disabled="
          selectedLetters.length ===
            0 ||
          boardLocked
        "
        class="border-r-4 border-black py-4 text-2xl font-black text-white active:bg-[#e51f91] disabled:opacity-40"
      >
        ⌫
      </button>

      <!-- SUBMIT -->
      <button
        @click="
          submitAnswer
        "
        :disabled="
          selectedLetters.length ===
            0 ||
          boardLocked
        "
        class="py-4 text-white text-lg font-black active:bg-[#e51f91] disabled:opacity-40"
      >
        SUBMIT
      </button>

      <!-- CLEAR ALL -->
      <button
        @click="
          clearAnswer
        "
        :disabled="
          selectedLetters.length ===
            0 ||
          boardLocked
        "
        class="border-l-4 border-black py-4 text-2xl font-black text-white active:bg-[#e51f91] disabled:opacity-40"
      >
        ×
      </button>
    </div>
  </div>
</template>