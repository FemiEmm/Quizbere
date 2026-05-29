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
  ])

/* -----------------------------
   STATE
----------------------------- */

const selectedAnswer =
  ref('')

const answered =
  ref(false)

/* -----------------------------
   ANSWER
----------------------------- */

const selectAnswer =
  (option) => {
    /* PREVENT DOUBLE TAP */

    if (
      answered.value
    ) {
      return
    }

    answered.value =
      true

    selectedAnswer.value =
      option

    /* SUCCESS */

    if (
      option ===
      props.question.answer
    ) {
      emit(
        'success',
      )

      return
    }

    /* FAIL */

    emit(
      'fail',
    )
  }

/* -----------------------------
   RESET ON NEW QUESTION
----------------------------- */

watch(
  () =>
    props.question,
  () => {
    answered.value =
      false

    selectedAnswer.value =
      ''
  },
)
</script>

<template>
  <div>
    <!-- QUESTION COUNT -->
    <p
      class="text-[11px] font-black text-black/50"
    >
      Q{{
        questionIndex +
        1
      }}/{{ totalQuestions }}
    </p>

    <!-- QUESTION -->
    <h1
      class="mt-3 text-2xl font-black text-black leading-tight"
    >
      {{
        question?.question
      }}
    </h1>

    <!-- OPTIONS -->
    <div
      class="mt-5 flex flex-col gap-3"
    >
      <button
        v-for="option in question?.options || []"
        :key="
          option
        "
        @click="
          selectAnswer(
            option,
          )
        "
        :disabled="
          answered
        "
        class="w-full border-4 border-black rounded-2xl px-4 py-4 text-base font-black transition-all duration-100"
        :class="[
          answered &&
          option ===
            question?.answer
            ? 'bg-green-400'
            : answered &&
                selectedAnswer ===
                  option
              ? 'bg-red-400'
              : 'bg-[#03B5EC]',
        ]"
      >
        {{
          option
        }}
      </button>
    </div>
  </div>
</template>