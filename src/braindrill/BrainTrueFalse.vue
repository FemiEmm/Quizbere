<script setup>
import {
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

const answered =
  ref(false)

const selectedAnswer =
  ref(null)

/* -----------------------------
   RESET
----------------------------- */

watch(
  () =>
    props.question,
  () => {
    answered.value =
      false

    selectedAnswer.value =
      null
  },
)

/* -----------------------------
   CHOOSE
----------------------------- */

const chooseAnswer =
  (answer) => {
    /* NO QUESTION */

    if (
      !props.question
    ) {
      return
    }

    /* PREVENT DOUBLE TAP */

    if (
      answered.value
    ) {
      return
    }

    answered.value =
      true

    selectedAnswer.value =
      answer

    /* SUCCESS */

    if (
      answer ===
      props.question
        ?.answer
    ) {
      emit(
        'success',
      )
    }

    /* FAIL */

    else {
      emit(
        'fail',
      )
    }

    /* COMPLETE */

    setTimeout(() => {
      emit(
        'complete',
      )
    }, 600)
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
        TRUE OR FALSE
        {{
          questionIndex +
          1
        }}/{{ totalQuestions }}
      </p>

      <h1
        class="mt-4 text-3xl font-black text-black leading-tight"
      >
        {{
          question?.statement
        }}
      </h1>
    </div>

    <!-- BUTTONS -->
    <div
      class="mt-8 flex flex-col gap-4"
    >
      <!-- TRUE -->
      <button
        @click="
          chooseAnswer(
            true,
          )
        "
        class="w-full border-4 border-black rounded-[2rem] py-8 text-3xl font-black transition-all duration-150"
        :class="[
          answered &&
          question?.answer ===
            true
            ? 'bg-green-400'
            : answered &&
                selectedAnswer ===
                  true &&
                question?.answer !==
                  true
              ? 'bg-red-400'
              : 'bg-[#03B5EC]',
        ]"
      >
        TRUE
      </button>

      <!-- FALSE -->
      <button
        @click="
          chooseAnswer(
            false,
          )
        "
        class="w-full border-4 border-black rounded-[2rem] py-8 text-3xl font-black transition-all duration-150"
        :class="[
          answered &&
          question?.answer ===
            false
            ? 'bg-green-400'
            : answered &&
                selectedAnswer ===
                  false &&
                question?.answer !==
                  false
              ? 'bg-red-400'
              : 'bg-[#FF2AA3]',
        ]"
      >
        FALSE
      </button>
    </div>
  </div>
</template>