<!-- src/braindrill/BrainMatch.vue -->

<script setup>
import {
  computed,
  onMounted,
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
    'complete',
    'correct',
    'wrong',
  ])

/* -----------------------------
   STATE
----------------------------- */

const selectedLeft =
  ref(null)

const matchedLeft =
  ref([])

const matchedRight =
  ref([])

const currentMatches =
  ref(0)

const boardLocked =
  ref(false)

/* -----------------------------
   LEFT ITEMS
----------------------------- */

const leftItems =
  computed(() => {
    return props.question.pairs.map(
      (
        pair,
        index,
      ) => ({
        id: index,

        left:
          pair.left,
      }),
    )
  })

/* -----------------------------
   RIGHT ITEMS
----------------------------- */

const rightItems =
  ref([])

/* -----------------------------
   GENERATE BOARD
----------------------------- */

const generateBoard =
  () => {
    rightItems.value =
      [
        ...props.question.pairs.map(
          (
            pair,
            index,
          ) => ({
            id: index,

            right:
              pair.right,
          }),
        ),
      ].sort(
        () =>
          Math.random() -
          0.5,
      )
  }

/* -----------------------------
   RESET ON NEW QUESTION
----------------------------- */

watch(
  () =>
    props.question,
  () => {
    selectedLeft.value =
      null

    matchedLeft.value =
      []

    matchedRight.value =
      []

    currentMatches.value = 0

    boardLocked.value =
      false

    generateBoard()
  },
)

/* -----------------------------
   MOUNT
----------------------------- */

onMounted(() => {
  generateBoard()
})

/* -----------------------------
   SELECT LEFT
----------------------------- */

const selectLeft =
  (item) => {
    if (
      boardLocked.value
    ) {
      return
    }

    playSound(
      'button',
    )

    selectedLeft.value =
      item
  }

/* -----------------------------
   SELECT RIGHT
----------------------------- */

const selectRight =
  (item) => {
    if (
      !selectedLeft.value ||
      boardLocked.value
    ) {
      return
    }

    /* CORRECT */

    if (
      selectedLeft.value
        .id ===
      item.id
    ) {
      matchedLeft.value.push(
        item.id,
      )

      matchedRight.value.push(
        item.id,
      )

      currentMatches.value++

      emit('correct')

      /* FINISHED */

      if (
        currentMatches.value >=
        props.question
          .pairs.length
      ) {
        boardLocked.value =
          true

        setTimeout(() => {
          emit(
            'complete',
          )
        }, 800)
      }
    }

    /* WRONG */

    else {
      emit('wrong')
    }

    selectedLeft.value =
      null
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
        MATCH
        {{
          questionIndex +
          1
        }}/{{ totalQuestions }}
      </p>

      <h1
        class="mt-1 text-lg font-black text-black"
      >
        MATCH THE
        PAIRS
      </h1>

      <p
        class="mt-1 text-[11px] font-black text-black/60"
      >
        Tap left.
        Then tap the
        correct pair.
      </p>
    </div>

    <!-- BOARD -->
    <div
      class="mt-4 grid grid-cols-2 gap-2"
    >
      <!-- LEFT -->
      <div
        class="flex flex-col gap-2"
      >
        <button
          v-for="item in leftItems"
          :key="
            item.id
          "
          @click="
            selectLeft(
              item,
            )
          "
          class="min-h-[54px] border-4 border-black rounded-xl px-2 py-2 text-xs font-black leading-tight transition-all duration-150"
          :class="[
            selectedLeft?.id ===
            item.id
              ? 'bg-[#F3F400]'
              : matchedLeft.includes(
                    item.id,
                  )
                ? 'bg-green-400 opacity-50'
                : 'bg-white',
          ]"
          :disabled="
            matchedLeft.includes(
              item.id,
            ) ||
            boardLocked
          "
        >
          {{
            item.left
          }}
        </button>
      </div>

      <!-- RIGHT -->
      <div
        class="flex flex-col gap-2"
      >
        <button
          v-for="item in rightItems"
          :key="
            item.id
          "
          @click="
            selectRight(
              item,
            )
          "
          class="min-h-[54px] border-4 border-black rounded-xl px-2 py-2 text-xs font-black leading-tight transition-all duration-150"
          :class="[
            matchedRight.includes(
              item.id,
            )
              ? 'bg-green-400 opacity-50'
              : 'bg-[#03B5EC]',
          ]"
          :disabled="
            matchedRight.includes(
              item.id,
            ) ||
            boardLocked
          "
        >
          {{
            item.right
          }}
        </button>
      </div>
    </div>

    <!-- MATCH COUNT -->
    <div
      class="mt-4 bg-[#F3F400] border-4 border-black rounded-xl py-2 text-center"
    >
      <p
        class="text-[10px] font-black text-black/60"
      >
        MATCHED
      </p>

      <h2
        class="text-lg font-black text-black"
      >
        {{
          currentMatches
        }}
        /
        {{
          question
            .pairs.length
        }}
      </h2>
    </div>
  </div>
</template>