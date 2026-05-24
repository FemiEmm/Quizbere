<script setup>
import {
  ref,
} from 'vue'

import AppLoader from '../components/AppLoader.vue'

import { supabase } from '../lib/supabase'

import { playSound } from '../utils/playSound'

const emit =
  defineEmits([
    'refresh',
  ])

const username =
  localStorage.getItem(
    'examinity_username',
  ) || 'anonymous'

const opponent =
  ref('')

const duration =
  ref(3)

const loading =
  ref(false)

const message =
  ref('')

const showDropdown =
  ref(false)

const durationOptions =
  [
    {
      label: '1 DAY',
      value: 1,
    },

    {
      label: '3 DAYS',
      value: 3,
    },

    {
      label: '7 DAYS',
      value: 7,
    },
  ]

/* -----------------------------
   CURRENT LABEL
----------------------------- */

const currentDurationLabel =
  () => {
    const found =
      durationOptions.find(
        (item) =>
          item.value ===
          duration.value,
      )

    return (
      found?.label ||
      '3 DAYS'
    )
  }

/* -----------------------------
   SELECT DURATION
----------------------------- */

const selectDuration =
  (
    value,
  ) => {
    playSound(
      'navclick',
    )

    duration.value =
      value

    showDropdown.value =
      false
  }

/* -----------------------------
   CREATE MATCH
----------------------------- */

const createMatch =
  async (
    challenger,
  ) => {
    loading.value =
      true

    const endDate =
      new Date()

    endDate.setDate(
      endDate.getDate() +
        duration.value,
    )

    const { error } =
      await supabase
        .from(
          'versus_matches',
        )
        .insert([
          {
            player_one:
              username,

            player_two:
              challenger,

            duration_days:
              duration.value,

            ends_at:
              endDate.toISOString(),

            status:
              'active',
          },
        ])

    loading.value =
      false

    if (error) {
      message.value =
        'Could not create challenge.'

      playSound('fail')

      return
    }

    playSound('pass')

    emit('refresh')
  }

/* -----------------------------
   RANDOM
----------------------------- */

const findRandom =
  async () => {
    if (loading.value)
      return

    playSound(
      'button',
    )

    message.value =
      ''

    loading.value =
      true

    /* GET USERS */

    const { data } =
      await supabase
        .from(
          'examinity_leaderboard',
        )
        .select(
          'username',
        )
        .neq(
          'username',
          username,
        )

    loading.value =
      false

    if (
      !data ||
      !data.length
    ) {
      message.value =
        'No players found.'

      playSound('fail')

      return
    }

    const random =
      data[
        Math.floor(
          Math.random() *
            data.length,
        )
      ]

    createMatch(
      random.username,
    )
  }

/* -----------------------------
   USERNAME
----------------------------- */

const challengeUser =
  async () => {
    if (loading.value)
      return

    playSound(
      'button',
    )

    message.value =
      ''

    if (
      !opponent.value
    ) {
      message.value =
        'Enter a username.'

      playSound('fail')

      return
    }

    const clean =
      opponent.value.trim()

    loading.value =
      true

    const { data } =
      await supabase
        .from(
          'examinity_leaderboard',
        )
        .select(
          'username',
        )
        .eq(
          'username',
          clean,
        )
        .maybeSingle()

    loading.value =
      false

    if (!data) {
      message.value =
        'User not found.'

      playSound('fail')

      return
    }

    if (
      clean ===
      username
    ) {
      message.value =
        'You cannot challenge yourself.'

      playSound('fail')

      return
    }

    createMatch(
      clean,
    )
  }
</script>

<template>
  <section
    class="min-h-screen flex items-center justify-center px-4 py-5"
  >
    <!-- LOADING -->
    <div
      v-if="loading"
      class="w-full max-w-md min-h-[60vh] flex items-center justify-center"
    >
      <AppLoader />
    </div>

    <template v-else>
      <!-- WRAPPER -->
      <div
        class="w-full max-w-md flex flex-col items-center justify-center"
      >
        <!-- HEADER -->
        <div
          class="text-center"
        >
          <h1
            class="text-4xl font-black text-white"
          >
            VERSUS
          </h1>

          <p
            class="mt-2 text-sm text-black font-bold text-center"
          >
            Challenge another player.
          </p>
        </div>

        <!-- CARD -->
        <div
          class="mt-5 w-full bg-white border-4 border-black rounded-[2rem] p-4"
        >
          <!-- DURATION -->
          <div
            class="relative"
          >
            <p
              class="text-center text-xs font-black text-black/60"
            >
              DURATION
            </p>

            <!-- CUSTOM DROPDOWN -->
            <button
              @click="
                () => {
                  playSound(
                    'navclick',
                  )

                  showDropdown =
                    !showDropdown
                }
              "
              class="mt-2 w-full bg-[#F3F400] border-4 border-black rounded-2xl px-4 py-4 flex items-center justify-between shadow-[0_5px_0_#000] active:translate-y-[3px] active:shadow-[0_2px_0_#000] transition-all duration-100"
            >
              <span
                class="text-lg font-black text-black"
              >
                {{
                  currentDurationLabel()
                }}
              </span>

              <span
                class="text-xl font-black"
              >
                ↓
              </span>
            </button>

            <!-- OPTIONS -->
            <div
              v-if="
                showDropdown
              "
              class="absolute z-30 mt-2 w-full bg-white border-4 border-black rounded-2xl overflow-hidden shadow-[0_6px_0_#000]"
            >
              <button
                v-for="item in durationOptions"
                :key="item.value"
                @click="
                  selectDuration(
                    item.value,
                  )
                "
                class="w-full px-4 py-4 text-center text-base font-black border-b-4 border-black last:border-b-0 hover:bg-[#F3F400] transition-all duration-100"
              >
                {{
                  item.label
                }}
              </button>
            </div>
          </div>

          <!-- CHALLENGE USER -->
          <div
            class="mt-5 text-center"
          >
            <h2
              class="text-2xl font-black text-[#FF2AA3]"
            >
              CHALLENGE USER
            </h2>

            <p
              class="mt-2 text-xs font-bold text-black/70 leading-5"
            >
              Enter the username of the user
              you want to challenge.
            </p>
          </div>

          <!-- INPUT -->
          <input
            v-model="opponent"
            type="text"
            placeholder="Username..."
            class="mt-4 w-full bg-[#F5F5F5] border-4 border-black rounded-2xl px-4 py-4 text-lg font-black text-center outline-none"
          />

          <!-- BUTTON -->
          <button
            @click="
              challengeUser
            "
            class="mt-4 w-full bg-[#FF2AA3] border-4 border-black rounded-2xl py-4 text-lg font-black text-white shadow-[0_5px_0_#000] active:translate-y-[3px] active:shadow-[0_2px_0_#000] transition-all duration-100"
          >
            CHALLENGE USER
          </button>

          <!-- OR -->
          <div
            class="mt-4 text-center"
          >
            <p
              class="text-xl font-black text-black"
            >
              OR
            </p>
          </div>

          <!-- RANDOM -->
          <button
            @click="
              findRandom
            "
            class="mt-4 w-full bg-[#FD9501] border-4 border-black rounded-2xl py-4 text-lg font-black shadow-[0_5px_0_#000] active:translate-y-[3px] active:shadow-[0_2px_0_#000] transition-all duration-100"
          >
            RANDOM CHALLENGER
          </button>

          <!-- MESSAGE -->
          <div
            v-if="message"
            class="mt-4 bg-red-100 border-4 border-black rounded-2xl px-4 py-3"
          >
            <p
              class="text-center text-red-500 text-sm font-black"
            >
              {{ message }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>