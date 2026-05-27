<!-- src/components/BereStore.vue -->

<script setup>
import { ref } from 'vue'

import { useRouter } from 'vue-router'

import { supabase } from '../lib/supabase'

import { playSound } from '../utils/playSound'

import {
  syncUserData,
} from '../utils/syncUserData'

const router = useRouter()

const emit =
  defineEmits([
    'close',
  ])

/* -----------------------------
   USERNAME
----------------------------- */

const username =
  (
    localStorage.getItem(
      'examinity_username',
    ) || 'anonymous'
  )
    .trim()
    .toUpperCase()

/* -----------------------------
   STATE
----------------------------- */

const loading =
  ref(false)

const errorMessage =
  ref('')

/* -----------------------------
   CLOSE
----------------------------- */

const closeStore =
  () => {
    if (loading.value)
      return

    playSound('button')

    emit('close')
  }

/* -----------------------------
   PURCHASE
----------------------------- */

const purchaseOffer =
  async (type) => {
    if (loading.value)
      return

    loading.value = true

    errorMessage.value =
      ''

    try {
      /* FETCH USER */

      const {
        data: leaderboardUser,
        error:
          leaderboardError,
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
        .maybeSingle()

      if (
        leaderboardError ||
        !leaderboardUser
      ) {
        errorMessage.value =
          'USER NOT FOUND'

        loading.value =
          false

        return
      }

      const currentPoints =
        Number(
          leaderboardUser.challenge_points,
        ) || 0

      /* -----------------------------
         FREE SPIN
      ----------------------------- */

      if (
        type ===
        'spin'
      ) {
        if (
          currentPoints <
          1000
        ) {
          playSound(
            'fail',
          )

          errorMessage.value =
            'NOT ENOUGH POINTS'

          loading.value =
            false

          return
        }

        /* FETCH TOKENS */

        const {
          data: userData,
          error:
            userError,
        } = await supabase
          .from(
            'examinity_users',
          )
          .select(
            'spin_token',
          )
          .eq(
            'username',
            username,
          )
          .maybeSingle()

        if (
          userError ||
          !userData
        ) {
          errorMessage.value =
            'USER ERROR'

          loading.value =
            false

          return
        }

        const currentTokens =
          Number(
            userData.spin_token,
          ) || 0

        /* UPDATE USERS */

        await supabase
          .from(
            'examinity_users',
          )
          .update({
            spin_token:
              currentTokens +
              1,
          })
          .eq(
            'username',
            username,
          )

        /* UPDATE LEADERBOARD */

        await supabase
          .from(
            'examinity_leaderboard',
          )
          .update({
            challenge_points:
              currentPoints -
              1000,
          })
          .eq(
            'username',
            username,
          )

        /* SYNC DATA */

        await syncUserData()

        playSound(
          'pass',
        )

        loading.value =
          false

        emit('close')

        router.push(
          '/reward',
        )

        return
      }

      /* -----------------------------
         1GB DATA
      ----------------------------- */

      if (
        type === 'data'
      ) {
        if (
          currentPoints <
          2000
        ) {
          playSound(
            'fail',
          )

          errorMessage.value =
            'NOT ENOUGH POINTS'

          loading.value =
            false

          return
        }

        /* UPDATE LEADERBOARD */

        await supabase
          .from(
            'examinity_leaderboard',
          )
          .update({
            challenge_points:
              currentPoints -
              2000,
          })
          .eq(
            'username',
            username,
          )

        /* SAVE WINNER */

        await supabase
          .from(
            'examinity_winners',
          )
          .insert([
            {
              username,

              reward:
                '1GB DATA',

              claim_code:
                'MamaNCbuy',

              screenshot_claimed:
                false,

              claim_status:
                'pending',
            },
          ])

        /* SAVE LOCAL */

        localStorage.setItem(
          'examinity_reward',
          '1GB DATA',
        )

        /* SYNC DATA */

        await syncUserData()

        playSound(
          'pass',
        )

        loading.value =
          false

        emit('close')

        router.push(
          '/winner',
        )
      }
    } catch (err) {
      console.error(err)

      playSound(
        'fail',
      )

      errorMessage.value =
        'SOMETHING WENT WRONG'

      loading.value =
        false
    }
  }
</script>

<template>
  <div
    class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
  >
    <section
      class="relative w-full max-w-[340px] bg-[#F3F400] border-4 border-black rounded-[2rem] p-4 shadow-[0_10px_0_#000]"
    >
      <!-- CLOSE -->
      <button
        @click="
          closeStore
        "
        class="absolute -top-4 -right-3 w-12 h-12 bg-[#FF2AA3] border-4 border-black rounded-full flex items-center justify-center shadow-[0_5px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000]"
      >
        <span
          class="text-white text-2xl font-black leading-none"
        >
          ×
        </span>
      </button>

      <!-- HEADER -->
      <div
        class="flex items-center gap-3"
      >
        <img
          src="/mascot/mamanocredit.png"
          alt="Mama No Credit"
          class="w-20 h-20 object-contain shrink-0"
        />

        <div>
          <h1
            class="text-[1.8rem] leading-none font-black text-[#FF2AA3]"
          >
            MAMA NO
          </h1>

          <h1
            class="text-[1.8rem] leading-none font-black text-black"
          >
            CREDIT
          </h1>

          <p
            class="mt-1 text-xs font-black text-black/70"
          >
            STORE
          </p>
        </div>
      </div>

      <!-- SUBTEXT -->
      <p
        class="mt-3 text-black text-sm font-bold leading-6"
      >
        Spend challenge points on
        rewards and bonuses.
      </p>

      <!-- OFFER 1 -->
      <div
        class="mt-4 bg-white border-4 border-black rounded-[1.5rem] p-4 shadow-[0_5px_0_#000]"
      >
        <div
          class="flex items-center justify-between"
        >
          <div>
            <h2
              class="text-2xl font-black text-[#03B5EC]"
            >
              FREE SPIN
            </h2>

            <p
              class="mt-1 text-sm font-black text-black"
            >
              1000 Points
            </p>
          </div>

          <button
            @click="
              purchaseOffer(
                'spin',
              )
            "
            :disabled="loading"
            class="bg-[#FD9501] border-4 border-black rounded-2xl px-4 py-3 text-sm font-black text-black shadow-[0_4px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000]"
          >
            BUY
          </button>
        </div>
      </div>

      <!-- OFFER 2 -->
      <div
        class="mt-4 bg-white border-4 border-black rounded-[1.5rem] p-4 shadow-[0_5px_0_#000]"
      >
        <div
          class="flex items-center justify-between"
        >
          <div>
            <h2
              class="text-2xl font-black text-[#FF2AA3]"
            >
              1GB DATA
            </h2>

            <p
              class="mt-1 text-sm font-black text-black"
            >
              2000 Points
            </p>
          </div>

          <button
            @click="
              purchaseOffer(
                'data',
              )
            "
            :disabled="loading"
            class="bg-[#03B5EC] border-4 border-black rounded-2xl px-4 py-3 text-sm font-black text-black shadow-[0_4px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000]"
          >
            BUY
          </button>
        </div>
      </div>

      <!-- ERROR -->
      <div
        v-if="
          errorMessage
        "
        class="mt-4 bg-[#FF2AA3] border-4 border-black rounded-2xl px-4 py-3 text-center shadow-[0_5px_0_#000]"
      >
        <p
          class="text-white text-sm font-black"
        >
          {{
            errorMessage
          }}
        </p>
      </div>
    </section>
  </div>
</template>