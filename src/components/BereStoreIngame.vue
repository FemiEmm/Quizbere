<script setup>
import {
  ref,
} from 'vue'

import { supabase } from '../lib/supabase'

/* -----------------------------
   PROPS
----------------------------- */

const props =
  defineProps({
    show: Boolean,
  })

/* -----------------------------
   EMITS
----------------------------- */

const emit =
  defineEmits([
    'close',
    'time-added',
  ])

/* -----------------------------
   STATE
----------------------------- */

const loading =
  ref(false)

const errorMessage =
  ref('')

/* -----------------------------
   USERNAME
----------------------------- */

const username =
  localStorage.getItem(
    'examinity_username',
  )

/* -----------------------------
   BUY TIME
----------------------------- */

const buyTime =
  async (
    seconds,
    cost,
  ) => {

    if (
      loading.value
    ) {
      return
    }

    loading.value =
      true

    errorMessage.value =
      ''

    /* -----------------------------
       GET USER
    ----------------------------- */

    const {
      data: user,
      error,
    } = await supabase
      .from(
        'examinity_leaderboard',
      )
      .select(
        'challenge_points',
      )
      .eq(
        'username',
        username,
      )
      .single()

    if (
      error ||
      !user
    ) {

      errorMessage.value =
        'Failed to fetch user.'

      loading.value =
        false

      return
    }

    /* -----------------------------
       CHECK POINTS
    ----------------------------- */

    if (
      user.challenge_points <
      cost
    ) {

      errorMessage.value =
        'Not enough challenge points.'

      loading.value =
        false

      return
    }

    /* -----------------------------
       REMOVE POINTS
    ----------------------------- */

    const {
      error: updateError,
    } = await supabase
      .from(
        'examinity_leaderboard',
      )
      .update({
        challenge_points:
          user.challenge_points -
          cost,
      })
      .eq(
        'username',
        username,
      )

    if (
      updateError
    ) {

      errorMessage.value =
        'Purchase failed.'

      loading.value =
        false

      return
    }

    /* -----------------------------
       SUCCESS
    ----------------------------- */

    emit(
      'time-added',
      seconds,
    )

    emit(
      'close',
      {
        purchased: true,
      },
    )

    loading.value =
      false
  }

/* -----------------------------
   CONTINUE WITHOUT BUYING
----------------------------- */

const continueWithoutBuying =
  () => {

    emit(
      'close',
      {
        purchased: false,
      },
    )
  }
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[999] bg-black/70 flex items-center justify-center px-4"
  >
    <div
      class="w-full max-w-[320px] bg-[#F3F400] border-4 border-black rounded-[2rem] p-4"
    >
      <!-- HEADER -->
      <div
        class="flex items-center gap-3"
      >
        <!-- MASCOT -->
        <img
          src="/mascot/mamanocredit.png"
          alt="Mama No Credit"
          class="w-20 h-20 object-contain shrink-0"
        />

        <!-- TEXT -->
        <div
          class="flex-1"
        >
          <p
            class="text-[10px] font-black text-black/50 leading-none"
          >
            MAMA NO CREDIT
          </p>

          <h1
            class="mt-1 text-xl font-black text-black leading-none"
          >
            NEED MORE TIME?
          </h1>

          <p
            class="mt-2 text-[11px] font-bold text-black/70 leading-4"
          >
            Continue your current run.
          </p>
        </div>
      </div>

      <!-- OPTIONS -->
      <div
        class="mt-4 flex flex-col gap-2"
      >
        <!-- 10 -->
        <button
          @click="
            buyTime(
              10,
              500,
            )
          "
          class="w-full bg-white border-4 border-black rounded-xl px-4 py-3 flex items-center justify-between"
        >
          <span
            class="text-sm font-black text-black"
          >
            +10 SECS
          </span>

          <span
            class="text-xs font-black text-[#FF2AA3]"
          >
            500CP
          </span>
        </button>

        <!-- 30 -->
        <button
          @click="
            buyTime(
              30,
              1000,
            )
          "
          class="w-full bg-white border-4 border-black rounded-xl px-4 py-3 flex items-center justify-between"
        >
          <span
            class="text-sm font-black text-black"
          >
            +30 SECS
          </span>

          <span
            class="text-xs font-black text-[#FF2AA3]"
          >
            1000CP
          </span>
        </button>

        <!-- 60 -->
        <button
          @click="
            buyTime(
              60,
              1500,
            )
          "
          class="w-full bg-white border-4 border-black rounded-xl px-4 py-3 flex items-center justify-between"
        >
          <span
            class="text-sm font-black text-black"
          >
            +60 SECS
          </span>

          <span
            class="text-xs font-black text-[#FF2AA3]"
          >
            1500CP
          </span>
        </button>

        <!-- 120 -->
        <button
          @click="
            buyTime(
              120,
              3000,
            )
          "
          class="w-full bg-black border-4 border-black rounded-xl px-4 py-3 flex items-center justify-between"
        >
          <span
            class="text-sm font-black text-white"
          >
            +120 SECS
          </span>

          <span
            class="text-xs font-black text-[#F3F400]"
          >
            3000CP
          </span>
        </button>
      </div>

      <!-- ERROR -->
      <p
        v-if="
          errorMessage
        "
        class="mt-3 text-center text-red-600 text-xs font-black"
      >
        {{
          errorMessage
        }}
      </p>

      <!-- CONTINUE -->
      <button
        @click="
          continueWithoutBuying
        "
        class="mt-4 w-full bg-[#FF2AA3] border-4 border-black rounded-xl py-3 text-white text-sm font-black"
      >
        CONTINUE WITHOUT BUYING
      </button>
    </div>
  </div>
</template>