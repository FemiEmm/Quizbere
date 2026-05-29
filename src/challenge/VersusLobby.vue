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
  (
    localStorage.getItem(
      'examinity_username',
    ) || 'anonymous'
  )
    .trim()
    .toUpperCase()

const opponent =
  ref('')

const selectedChallenge =
  ref({
    label: '6 HOURS',
    hours: 6,
    cost: 500,
    reward: 1000,
  })

const loading =
  ref(false)

const message =
  ref('')

const showDropdown =
  ref(false)

const durationOptions =
  [
    {
      label: '6 HOURS',
      hours: 6,
      cost: 500,
      reward: 1000,
    },

    {
      label: '12 HOURS',
      hours: 12,
      cost: 750,
      reward: 1500,
    },

    {
      label: '18 HOURS',
      hours: 18,
      cost: 1000,
      reward: 2500,
    },

    {
      label: '1 DAY',
      hours: 24,
      cost: 1500,
      reward: 3500,
    },

    {
      label: '3 DAYS',
      hours: 72,
      cost: 2000,
      reward: 5000,
    },
  ]

/* -----------------------------
   CURRENT LABEL
----------------------------- */

const currentDurationLabel =
  () => {
    return `${selectedChallenge.value.label} • ${selectedChallenge.value.cost} CP`
  }

/* -----------------------------
   TOGGLE DROPDOWN
----------------------------- */

const toggleDropdown =
  () => {
    playSound(
      'navclick',
    )

    showDropdown.value =
      !showDropdown.value
  }

/* -----------------------------
   SELECT DURATION
----------------------------- */

const selectDuration =
  (
    item,
  ) => {
    playSound(
      'navclick',
    )

    selectedChallenge.value =
      item

    showDropdown.value =
      false
  }

/* -----------------------------
   FETCH USER
----------------------------- */

const fetchUserByUsername =
  async (
    targetUsername,
  ) => {
    const {
      data,
      error,
    } = await supabase
      .from(
        'examinity_leaderboard',
      )
      .select(
        'id, username, challenge_points',
      )
      .eq(
        'username',
        targetUsername,
      )
      .maybeSingle()

    if (
      error
    ) {
      throw error
    }

    return data
  }

/* -----------------------------
   UPDATE CP
----------------------------- */

const updateUserCp =
  async (
    userId,
    newCp,
  ) => {
    const {
      error,
    } = await supabase
      .from(
        'examinity_leaderboard',
      )
      .update({
        challenge_points:
          newCp,
      })
      .eq(
        'id',
        userId,
      )

    if (
      error
    ) {
      throw error
    }
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

    message.value =
      ''

    try {
      const cleanChallenger =
        challenger
          .trim()
          .toUpperCase()

      const challenge =
        selectedChallenge.value

      const entryCost =
        Number(
          challenge.cost,
        )

      const rewardCp =
        Number(
          challenge.reward,
        )

      /* CURRENT USER */

      const currentUser =
        await fetchUserByUsername(
          username,
        )

      if (
        !currentUser
      ) {
        message.value =
          'Your account was not found.'

        playSound(
          'fail',
        )

        return
      }

      /* OPPONENT */

      const targetUser =
        await fetchUserByUsername(
          cleanChallenger,
        )

      if (
        !targetUser
      ) {
        message.value =
          'Opponent not found.'

        playSound(
          'fail',
        )

        return
      }

      if (
        cleanChallenger ===
        username
      ) {
        message.value =
          'You cannot challenge yourself.'

        playSound(
          'fail',
        )

        return
      }

      const currentUserCp =
        Number(
          currentUser.challenge_points,
        ) || 0

      const opponentCp =
        Number(
          targetUser.challenge_points,
        ) || 0

      if (
        currentUserCp <
        entryCost
      ) {
        message.value =
          `You need ${entryCost} CP to start this challenge.`

        playSound(
          'fail',
        )

        return
      }

      if (
        opponentCp <
        entryCost
      ) {
        message.value =
          `${targetUser.username} does not have enough CP for this challenge.`

        playSound(
          'fail',
        )

        return
      }

      /* DEDUCT BOTH PLAYERS */

      await updateUserCp(
        currentUser.id,
        currentUserCp -
          entryCost,
      )

      await updateUserCp(
        targetUser.id,
        opponentCp -
          entryCost,
      )

      /* END TIME */

      const endDate =
        new Date()

      endDate.setHours(
        endDate.getHours() +
          challenge.hours,
      )

      /* CREATE MATCH */

      const {
        error,
      } = await supabase
        .from(
          'versus_matches',
        )
        .insert([
          {
            player_one:
              username,

            player_two:
              cleanChallenger,

            duration_days:
              Math.ceil(
                challenge.hours / 24,
              ),

            duration_hours:
              challenge.hours,

            entry_cost:
              entryCost,

            reward_cp:
              rewardCp,

            ends_at:
              endDate.toISOString(),

            player_one_paid:
              true,

            player_two_paid:
              true,

            status:
              'active',
          },
        ])

      if (
        error
      ) {
        /* REFUND BOTH USERS IF MATCH CREATION FAILS */

        await updateUserCp(
          currentUser.id,
          currentUserCp,
        )

        await updateUserCp(
          targetUser.id,
          opponentCp,
        )

        throw error
      }

      playSound(
        'pass',
      )

      emit(
        'refresh',
      )
    }

    catch (error) {
      console.error(
        error,
      )

      message.value =
        'Could not create challenge.'

      playSound(
        'fail',
      )
    }

    finally {
      loading.value =
        false
    }
  }

/* -----------------------------
   RANDOM
----------------------------- */

const findRandom =
  async () => {
    if (
      loading.value
    ) {
      return
    }

    playSound(
      'button',
    )

    message.value =
      ''

    loading.value =
      true

    const entryCost =
      selectedChallenge.value.cost

    const {
      data,
      error,
    } = await supabase
      .from(
        'examinity_leaderboard',
      )
      .select(
        'username, challenge_points',
      )
      .neq(
        'username',
        username,
      )
      .gte(
        'challenge_points',
        entryCost,
      )

    loading.value =
      false

    if (
      error
    ) {
      console.error(
        error,
      )

      message.value =
        'Could not find random player.'

      playSound(
        'fail',
      )

      return
    }

    if (
      !data ||
      !data.length
    ) {
      message.value =
        `No random players found with at least ${entryCost} CP.`

      playSound(
        'fail',
      )

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
    if (
      loading.value
    ) {
      return
    }

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

      playSound(
        'fail',
      )

      return
    }

    const clean =
      opponent.value
        .trim()
        .toUpperCase()

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
      v-if="
        loading
      "
      class="w-full max-w-md min-h-[60vh] flex items-center justify-center"
    >
      <AppLoader />
    </div>

    <template
      v-else
    >
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
              CHALLENGE TYPE
            </p>

            <!-- CUSTOM DROPDOWN -->
            <button
              @click="
                toggleDropdown
              "
              class="mt-2 w-full bg-[#F3F400] border-4 border-black rounded-2xl px-4 py-4 flex items-center justify-between shadow-[0_5px_0_#000] active:translate-y-[3px] active:shadow-[0_2px_0_#000] transition-all duration-100"
            >
              <span
                class="text-sm font-black text-black text-left"
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
                :key="
                  item.label
                "
                @click="
                  selectDuration(
                    item,
                  )
                "
                class="w-full px-4 py-4 text-left border-b-4 border-black last:border-b-0 hover:bg-[#F3F400] transition-all duration-100"
              >
                <p
                  class="text-base font-black text-black"
                >
                  {{
                    item.label
                  }}
                </p>

                <p
                  class="mt-1 text-xs font-black text-black/60"
                >
                  Cost:
                  {{
                    item.cost
                  }}
                  CP • Win:
                  {{
                    item.reward
                  }}
                  CP
                </p>
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
              Enter the username of the player
              you want to challenge.
            </p>
          </div>

          <!-- INPUT -->
          <input
            v-model="
              opponent
            "
            @input="
              opponent =
                opponent.toUpperCase()
            "
            type="text"
            placeholder="Username..."
            class="mt-4 w-full bg-[#F5F5F5] border-4 border-black rounded-2xl px-4 py-4 text-lg font-black text-center outline-none"
          />

          <!-- SELECTED STAKE -->
          <div
            class="mt-4 bg-black border-4 border-black rounded-2xl px-4 py-3 text-center"
          >
            <p
              class="text-[10px] font-black text-white/50"
            >
              CURRENT STAKE
            </p>

            <h3
              class="mt-1 text-lg font-black text-[#F3F400]"
            >
              {{
                selectedChallenge.cost
              }}
              CP FROM BOTH PLAYERS
            </h3>

            <p
              class="mt-1 text-xs font-black text-green-400"
            >
              Winner gets
              {{
                selectedChallenge.reward
              }}
              CP
            </p>
          </div>

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

          <!-- RULES -->
          <div
            class="mt-5 bg-[#F5F5F5] border-4 border-black rounded-2xl px-4 py-4"
          >
            <h3
              class="text-sm font-black text-black"
            >
              VERSUS RULES
            </h3>

            <div
              class="mt-3 text-xs font-bold text-black/70 leading-5 text-left space-y-2"
            >
              <p>
                • Starting a challenge costs CP from both players.
              </p>

              <p>
                • Your CP is deducted once the challenge is created.
              </p>

              <p>
                • The opponent’s CP is also deducted immediately if they have enough CP.
              </p>

              <p>
                • If the opponent does not have enough CP, the challenge will not start.
              </p>

              <p>
                • The challenge starts immediately after both players are charged.
              </p>

              <p>
                • The winner receives the listed CP reward.
              </p>
            </div>
          </div>

          <!-- MESSAGE -->
          <div
            v-if="
              message
            "
            class="mt-4 bg-red-100 border-4 border-black rounded-2xl px-4 py-3"
          >
            <p
              class="text-center text-red-500 text-sm font-black"
            >
              {{
                message
              }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>