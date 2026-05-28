<script setup>
const props =
  defineProps({
    show: Boolean,

    winner: Object,
  })

const emit =
  defineEmits([
    'close',
  ])

/* -----------------------------
   CLOSE
----------------------------- */

const closeModal =
  () => {
    emit('close')
  }
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/70 z-[999] flex items-center justify-center px-5"
  >
    <div
      class="relative w-full max-w-md bg-[#F3F400] border-4 border-black rounded-[2.5rem] p-8 text-center shadow-[0_10px_0_#000]"
    >
      <!-- CLOSE -->
      <button
        @click="
          closeModal
        "
        class="absolute top-4 right-4 w-10 h-10 bg-white border-4 border-black rounded-full flex items-center justify-center text-xl font-black text-black"
      >
        ×
      </button>

      <p
        class="text-sm font-black text-black/60"
      >
        WEEKLY WINNER
      </p>

      <h1
        class="mt-3 text-4xl font-black text-[#FF2AA3]"
      >
        🏆
      </h1>

      <h2
        class="mt-3 text-2xl font-black text-black"
      >
        {{
          winner?.league
        }}
      </h2>

      <div
        class="mt-6 bg-white border-4 border-black rounded-3xl p-5"
      >
        <p
          class="text-sm font-black text-black/50"
        >
          1ST PLACE
        </p>

        <h3
          class="mt-2 text-3xl font-black text-[#03B5EC]"
        >
          {{
            winner?.username
          }}
        </h3>

        <p
          class="mt-3 text-xl font-black text-black"
        >
          {{
            winner?.challenge_points
          }}
          POINTS
        </p>
      </div>
    </div>
  </div>
</template>