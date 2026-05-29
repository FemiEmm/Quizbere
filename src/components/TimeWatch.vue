<script setup>
import {
  ref,
  onMounted,
  onUnmounted,
} from 'vue'

const emit =
  defineEmits([
    'time-up',
  ])

const timeLeft =
  ref('')

let interval =
  null

/* -----------------------------
   USERNAME
----------------------------- */

const username =
  localStorage.getItem(
    'examinity_username',
  )

/* -----------------------------
   ADMIN CHECK
----------------------------- */

const isAdmin =
  username ===
  'ADMINDEVELOPER'

/* -----------------------------
   MANUAL TRIGGER
----------------------------- */

const triggerWinner =
  () => {

    if (
      !isAdmin
    ) {
      return
    }

    emit(
      'time-up',
    )
  }

/* -----------------------------
   GET NEXT SATURDAY 8PM WAT
----------------------------- */

const getNextReset =
  () => {

    const now =
      new Date()

    /* CONVERT TO UTC */

    const utcNow =
      new Date(
        now.getTime() +
          now.getTimezoneOffset() *
            60000,
      )

    /* WAT = UTC+1 */

    const watNow =
      new Date(
        utcNow.getTime() +
          1 *
            60 *
            60 *
            1000,
      )

    const next =
      new Date(
        watNow,
      )

    /* SATURDAY = 6 */

    const daysUntilSaturday =
      (
        6 -
        watNow.getDay() +
        7
      ) % 7

    next.setDate(
      watNow.getDate() +
        daysUntilSaturday,
    )

    /* 8PM WAT */

    next.setHours(
      20,
      0,
      0,
      0,
    )

    /* IF ALREADY PAST SATURDAY 8PM */

    if (
      next <= watNow
    ) {

      next.setDate(
        next.getDate() +
          7,
      )
    }

    return next
  }

/* -----------------------------
   UPDATE TIMER
----------------------------- */

const updateTimer =
  () => {

    const now =
      new Date()

    /* CONVERT TO UTC */

    const utcNow =
      new Date(
        now.getTime() +
          now.getTimezoneOffset() *
            60000,
      )

    /* WAT = UTC+1 */

    const watNow =
      new Date(
        utcNow.getTime() +
          1 *
            60 *
            60 *
            1000,
      )

    const resetDate =
      getNextReset()

    const diff =
      resetDate -
      watNow

    if (
      diff <= 0
    ) {

      timeLeft.value =
        '00:00:00'

      emit(
        'time-up',
      )

      clearInterval(
        interval,
      )

      return
    }

    const days =
      Math.floor(
        diff /
          (
            1000 *
            60 *
            60 *
            24
          ),
      )

    const hours =
      Math.floor(
        (
          diff /
          (
            1000 *
            60 *
            60
          )
        ) %
          24,
      )

    const minutes =
      Math.floor(
        (
          diff /
          (
            1000 *
            60
          )
        ) %
          60,
      )

    const seconds =
      Math.floor(
        (
          diff /
          1000
        ) %
          60,
      )

    timeLeft.value =
      `${days}D ${hours}H ${minutes}M ${seconds}S`
  }

/* -----------------------------
   MOUNT
----------------------------- */

onMounted(() => {

  updateTimer()

  interval =
    setInterval(
      updateTimer,
      1000,
    )
})

/* -----------------------------
   UNMOUNT
----------------------------- */

onUnmounted(() => {

  clearInterval(
    interval,
  )
})
</script>

<template>
  <button
    @click="
      triggerWinner
    "
    class="w-full bg-white border-4 border-black rounded-2xl px-3 py-2 text-center"
  >
    <p
      class="text-[9px] font-black text-black/50 uppercase leading-none"
    >
      League Will End In
    </p>

    <h2
      class="mt-1 text-sm font-black text-[#FF2AA3] leading-none"
    >
      {{
        timeLeft
      }}
    </h2>
  </button>
</template>