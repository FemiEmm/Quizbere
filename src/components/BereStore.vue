<script setup>
import { ref } from 'vue'

import { useRouter } from 'vue-router'

import { supabase } from '../lib/supabase'

import { playSound } from '../utils/playSound'

import {
  syncUserData,
} from '../utils/syncUserData'

const router =
  useRouter()

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

const rewardMessage =
  ref('')

/* -----------------------------
   CLOSE
----------------------------- */

const closeStore =
  () => {

    if (
      loading.value
    )
      return

    playSound(
      'button',
    )

    emit(
      'close',
    )
  }

/* -----------------------------
   MYSTERY REWARDS
----------------------------- */

const rollMysteryReward =
  () => {

    const roll =
      Math.random() *
      100

    if (
      roll < 40
    ) {

      return {
        type:
          'score',

        amount:
          100,

        text:
          'YOU WON 100 BP!',
      }
    }

    if (
      roll < 65
    ) {

      return {
        type:
          'score',

        amount:
          250,

        text:
          'YOU WON 250 BP!',
      }
    }

    if (
      roll < 80
    ) {

      return {
        type:
          'score',

        amount:
          500,

        text:
          'YOU WON 500 BP!',
      }
    }

    if (
      roll < 90
    ) {

      return {
        type:
          'score',

        amount:
          1000,

        text:
          'YOU WON 1000 BP!',
      }
    }

    if (
      roll < 98
    ) {

      return {
        type:
          'level',

        amount:
          1,

        text:
          'YOU UNLOCKED 1 LEVEL!',
      }
    }

    return {

      type:
        'level',

      amount:
        5,

      text:
        'YOU UNLOCKED 5 LEVELS!',
    }
  }

/* -----------------------------
   PURCHASE
----------------------------- */

const purchaseOffer =
  async (
    type,
  ) => {

    if (
      loading.value
    )
      return

    loading.value =
      true

    errorMessage.value =
      ''

    rewardMessage.value =
      ''

    try {

      const {
        data:
          leaderboardUser,

        error:
          leaderboardError,
      } = await supabase
        .from(
          'examinity_leaderboard',
        )
        .select(
          `
          challenge_points,
          best_run_score
          `,
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
            'NOT ENOUGH CP'

          loading.value =
            false

          return
        }

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

        await syncUserData()

        playSound(
          'pass',
        )

        loading.value =
          false

        emit(
          'close',
        )

        router.push(
          '/reward',
        )

        return
      }

      /* -----------------------------
         MYSTERY REWARD
      ----------------------------- */

      if (
        type ===
        'mystery'
      ) {

        if (
          currentPoints <
          500
        ) {

          playSound(
            'fail',
          )

          errorMessage.value =
            'NOT ENOUGH CP'

          loading.value =
            false

          return
        }

        const reward =
          rollMysteryReward()

        await supabase
          .from(
            'examinity_leaderboard',
          )
          .update({
            challenge_points:
              currentPoints -
              500,
          })
          .eq(
            'username',
            username,
          )

        if (
          reward.type ===
          'score'
        ) {

          await supabase
            .from(
              'examinity_leaderboard',
            )
            .update({
              best_run_score:
                (
                  Number(
                    leaderboardUser.best_run_score,
                  ) || 0
                ) +
                reward.amount,
            })
            .eq(
              'username',
              username,
            )
        }

        else {

          const {
            data: userData,
          } = await supabase
            .from(
              'examinity_users',
            )
            .select(
              'braindrill_level',
            )
            .eq(
              'username',
              username,
            )
            .maybeSingle()

          await supabase
            .from(
              'examinity_users',
            )
            .update({
              braindrill_level:
                (
                  Number(
                    userData?.braindrill_level,
                  ) || 0
                ) +
                reward.amount,
            })
            .eq(
              'username',
              username,
            )
        }

        await syncUserData()

        rewardMessage.value =
          `${reward.text} Refresh the page if your reward has not appeared.`

        playSound(
          'pass',
        )

        loading.value =
          false

        return
      }

      /* -----------------------------
         NEXT LEVEL
      ----------------------------- */

      if (
        type ===
        'level'
      ) {

        if (
          currentPoints <
          1000
        ) {

          playSound(
            'fail',
          )

          errorMessage.value =
            'NOT ENOUGH CP'

          loading.value =
            false

          return
        }

        const {
          data: userData,
        } = await supabase
          .from(
            'examinity_users',
          )
          .select(
            'braindrill_level',
          )
          .eq(
            'username',
            username,
          )
          .maybeSingle()

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

        await supabase
          .from(
            'examinity_users',
          )
          .update({
            braindrill_level:
              (
                Number(
                  userData?.braindrill_level,
                ) || 0
              ) + 1,
          })
          .eq(
            'username',
            username,
          )

        await syncUserData()

        rewardMessage.value =
          'NEXT BRAIN DRILL LEVEL UNLOCKED! Refresh the page if your reward has not appeared.'

        playSound(
          'pass',
        )

        loading.value =
          false

        return
      }
    }

    catch (err) {

      console.error(
        err,
      )

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
            class="text-[1.25rem] leading-none font-black text-[#FF2AA3]"
          >
            MAMA NO CREDIT
          </h1>

          <p
            class="mt-1 text-xs font-black text-black"
          >
            STORE
          </p>

          <p
            class="mt-1 text-[10px] font-bold text-black/70"
          >
            CP = Challenge Points
          </p>
        </div>
      </div>

      <!-- FREE SPIN -->
      <div
        class="mt-4 bg-white border-4 border-black rounded-[1.5rem] p-4 shadow-[0_5px_0_#000]"
      >
        <div
          class="flex items-center justify-between gap-3"
        >
          <div>
            <h2
              class="text-xl font-black text-[#FD9501]"
            >
              FREE SPIN
            </h2>

            <p
              class="mt-1 text-sm font-black text-black"
            >
              1000 CP
            </p>

            <p
              class="mt-1 text-[10px] font-bold text-black/70"
            >
              Gain 1 spin token.
            </p>
          </div>

          <button
            @click="
              purchaseOffer(
                'spin',
              )
            "
            :disabled="
              loading
            "
            class="bg-[#FD9501] border-4 border-black rounded-2xl px-4 py-3 text-sm font-black text-black shadow-[0_4px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000] disabled:opacity-70"
          >
            {{
              loading
                ? 'WAIT'
                : 'BUY'
            }}
          </button>
        </div>
      </div>

      <!-- MYSTERY REWARD -->
      <div
        class="mt-4 bg-white border-4 border-black rounded-[1.5rem] p-4 shadow-[0_5px_0_#000]"
      >
        <div
          class="flex items-center justify-between gap-3"
        >
          <div>
            <h2
              class="text-xl font-black text-[#FF2AA3]"
            >
              MYSTERY REWARD
            </h2>

            <p
              class="mt-1 text-sm font-black text-black"
            >
              500 CP
            </p>

            <p
              class="mt-1 text-[10px] font-bold text-black/70"
            >
              Open to reveal a surprise reward.
            </p>
          </div>

          <button
            @click="
              purchaseOffer(
                'mystery',
              )
            "
            :disabled="
              loading
            "
            class="bg-[#FF2AA3] border-4 border-black rounded-2xl px-4 py-3 text-sm font-black text-white shadow-[0_4px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000] disabled:opacity-70"
          >
            {{
              loading
                ? 'WAIT'
                : 'BUY'
            }}
          </button>
        </div>
      </div>

      <!-- NEXT LEVEL -->
      <div
        class="mt-4 bg-white border-4 border-black rounded-[1.5rem] p-4 shadow-[0_5px_0_#000]"
      >
        <div
          class="flex items-center justify-between gap-3"
        >
          <div>
            <h2
              class="text-xl font-black text-[#03B5EC]"
            >
              NEXT LEVEL
            </h2>

            <p
              class="mt-1 text-sm font-black text-black"
            >
              1000 CP
            </p>

            <p
              class="mt-1 text-[10px] font-bold text-black/70"
            >
              Unlock the next Brain Drill level.
            </p>
          </div>

          <button
            @click="
              purchaseOffer(
                'level',
              )
            "
            :disabled="
              loading
            "
            class="bg-[#03B5EC] border-4 border-black rounded-2xl px-4 py-3 text-sm font-black text-black shadow-[0_4px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000] disabled:opacity-70"
          >
            {{
              loading
                ? 'WAIT'
                : 'BUY'
            }}
          </button>
        </div>
      </div>

      <!-- REWARD MESSAGE -->
      <div
        v-if="
          rewardMessage
        "
        class="mt-4 bg-[#03B5EC] border-4 border-black rounded-2xl px-4 py-3 shadow-[0_5px_0_#000]"
      >
        <p
          class="text-center text-black text-sm font-black"
        >
          {{
            rewardMessage
          }}
        </p>
      </div>

      <!-- ERROR -->
      <div
        v-if="
          errorMessage
        "
        class="mt-4 bg-[#FF2AA3] border-4 border-black rounded-2xl px-4 py-3 shadow-[0_5px_0_#000]"
      >
        <p
          class="text-center text-white text-sm font-black"
        >
          {{
            errorMessage
          }}
        </p>
      </div>
    </section>
  </div>
</template>