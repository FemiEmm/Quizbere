<script setup>
import { ref } from 'vue'

import { useRouter } from 'vue-router'

import { supabase } from '../lib/supabase'

import { playSound } from '../utils/playSound'

import StoreActionModal from './StoreActionModal.vue'

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

const actionModal =
  ref({
    show: false,

    status: 'loading',

    message: '',
  })

/* -----------------------------
   ACTION MODAL
----------------------------- */

const showActionLoading =
  (
    message =
      'Processing your purchase...',
  ) => {

    actionModal.value =
      {
        show: true,

        status: 'loading',

        message,
      }
  }

const showActionSuccess =
  (
    message,
  ) => {

    actionModal.value =
      {
        show: true,

        status: 'success',

        message,
      }
  }

const showActionError =
  (
    message =
      'Transfer unsuccessful. Try again.',
  ) => {

    actionModal.value =
      {
        show: true,

        status: 'error',

        message,
      }
  }

const closeActionModal =
  () => {

    actionModal.value.show =
      false
  }

/* -----------------------------
   CLOSE STORE
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
   OPEN BOUTIQUE
----------------------------- */

const openBoutique =
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

    router.push(
      '/cosmetics-store',
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
          'You won 100 BP!',
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
          'You won 250 BP!',
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
          'You won 500 BP!',
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
          'You won 1000 BP!',
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
          'You unlocked 1 level!',
      }
    }

    return {

      type:
        'level',

      amount:
        5,

      text:
        'You unlocked 5 levels!',
    }
  }

/* -----------------------------
   UPDATE LOCAL SCORE
----------------------------- */

const updateLocalScores =
  ({
    challengePoints,
    brainDrillPoints,
    brainDrillLevel,
  } = {}) => {

    if (
      challengePoints !== undefined
    ) {

      localStorage.setItem(
        'challenge_total_points',
        String(
          challengePoints,
        ),
      )
    }

    if (
      brainDrillPoints !== undefined
    ) {

      localStorage.setItem(
        'braindrill_total_points',
        String(
          brainDrillPoints,
        ),
      )
    }

    if (
      brainDrillLevel !== undefined
    ) {

      localStorage.setItem(
        'braindrill_unlocked_level',
        String(
          brainDrillLevel,
        ),
      )
    }

    const localChallenge =
      Number(
        localStorage.getItem(
          'challenge_total_points',
        ),
      ) || 0

    const localBrainDrill =
      Number(
        localStorage.getItem(
          'braindrill_total_points',
        ),
      ) || 0

    localStorage.setItem(
      'total_score',
      String(
        localChallenge +
        localBrainDrill,
      ),
    )
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

    showActionLoading()

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

        playSound(
          'fail',
        )

        showActionError(
          'User not found. Try again.',
        )

        loading.value =
          false

        return
      }

      const currentPoints =
        Number(
          leaderboardUser.challenge_points,
        ) || 0

      const currentBrainDrillScore =
        Number(
          leaderboardUser.best_run_score,
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

          showActionError(
            'Not enough CP.',
          )

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

          playSound(
            'fail',
          )

          showActionError(
            'User error. Try again.',
          )

          loading.value =
            false

          return
        }

        const currentTokens =
          Number(
            userData.spin_token,
          ) || 0

        const {
          error:
            tokenUpdateError,
        } = await supabase
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

        if (
          tokenUpdateError
        ) {

          playSound(
            'fail',
          )

          showActionError()

          loading.value =
            false

          return
        }

        const {
          error:
            pointsUpdateError,
        } = await supabase
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

        if (
          pointsUpdateError
        ) {

          playSound(
            'fail',
          )

          showActionError()

          loading.value =
            false

          return
        }

        updateLocalScores({
          challengePoints:
            currentPoints -
            1000,

          brainDrillPoints:
            currentBrainDrillScore,
        })

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

          showActionError(
            'Not enough CP.',
          )

          loading.value =
            false

          return
        }

        const reward =
          rollMysteryReward()

        const newChallengePoints =
          currentPoints -
          500

        const {
          error:
            challengeUpdateError,
        } = await supabase
          .from(
            'examinity_leaderboard',
          )
          .update({
            challenge_points:
              newChallengePoints,
          })
          .eq(
            'username',
            username,
          )

        if (
          challengeUpdateError
        ) {

          playSound(
            'fail',
          )

          showActionError()

          loading.value =
            false

          return
        }

        if (
          reward.type ===
          'score'
        ) {

          const newBrainDrillScore =
            currentBrainDrillScore +
            reward.amount

          const {
            error:
              scoreUpdateError,
          } = await supabase
            .from(
              'examinity_leaderboard',
            )
            .update({
              best_run_score:
                newBrainDrillScore,
            })
            .eq(
              'username',
              username,
            )

          if (
            scoreUpdateError
          ) {

            playSound(
              'fail',
            )

            showActionError()

            loading.value =
              false

            return
          }

          updateLocalScores({
            challengePoints:
              newChallengePoints,

            brainDrillPoints:
              newBrainDrillScore,
          })
        }

        else {

          const {
            data: userData,

            error:
              levelFetchError,
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

          if (
            levelFetchError ||
            !userData
          ) {

            playSound(
              'fail',
            )

            showActionError()

            loading.value =
              false

            return
          }

          const newBrainDrillLevel =
            (
              Number(
                userData.braindrill_level,
              ) || 0
            ) +
            reward.amount

          const {
            error:
              levelUpdateError,
          } = await supabase
            .from(
              'examinity_users',
            )
            .update({
              braindrill_level:
                newBrainDrillLevel,
            })
            .eq(
              'username',
              username,
            )

          if (
            levelUpdateError
          ) {

            playSound(
              'fail',
            )

            showActionError()

            loading.value =
              false

            return
          }

          updateLocalScores({
            challengePoints:
              newChallengePoints,

            brainDrillPoints:
              currentBrainDrillScore,

            brainDrillLevel:
              newBrainDrillLevel,
          })
        }

        playSound(
          'pass',
        )

        showActionSuccess(
          `${reward.text} Refresh the page if your reward has not appeared.`,
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

          showActionError(
            'Not enough CP.',
          )

          loading.value =
            false

          return
        }

        const {
          data: userData,

          error:
            levelFetchError,
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

        if (
          levelFetchError ||
          !userData
        ) {

          playSound(
            'fail',
          )

          showActionError()

          loading.value =
            false

          return
        }

        const newChallengePoints =
          currentPoints -
          1000

        const newBrainDrillLevel =
          (
            Number(
              userData.braindrill_level,
            ) || 0
          ) + 1

        const {
          error:
            challengeUpdateError,
        } = await supabase
          .from(
            'examinity_leaderboard',
          )
          .update({
            challenge_points:
              newChallengePoints,
          })
          .eq(
            'username',
            username,
          )

        if (
          challengeUpdateError
        ) {

          playSound(
            'fail',
          )

          showActionError()

          loading.value =
            false

          return
        }

        const {
          error:
            levelUpdateError,
        } = await supabase
          .from(
            'examinity_users',
          )
          .update({
            braindrill_level:
              newBrainDrillLevel,
          })
          .eq(
            'username',
            username,
          )

        if (
          levelUpdateError
        ) {

          playSound(
            'fail',
          )

          showActionError()

          loading.value =
            false

          return
        }

        updateLocalScores({
          challengePoints:
            newChallengePoints,

          brainDrillPoints:
            currentBrainDrillScore,

          brainDrillLevel:
            newBrainDrillLevel,
        })

        playSound(
          'pass',
        )

        showActionSuccess(
          'Next Brain Drill level unlocked. Refresh the page if your reward has not appeared.',
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

      showActionError()

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
            class="text-[0.95rem] leading-none font-black text-[#FF2AA3]"
          >
            MAMA NO CREDIT
          </h1>

          <p
            class="mt-1 text-[0.75rem] font-black text-black"
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

      <!-- BOUTIQUE -->
      <div
        class="mt-4 bg-white border-4 border-black rounded-[1.5rem] p-4 shadow-[0_5px_0_#000]"
      >
        <div
          class="flex items-center justify-between gap-3"
        >
          <div>
            <h2
              class="text-[0.95rem] font-black text-[#7C3AED]"
            >
              BOUTIQUE
            </h2>

            <p
              class="mt-1 text-sm font-black text-black"
            >
              AVATARS
            </p>

            <p
              class="mt-1 text-[10px] font-bold text-black/70"
            >
              Buy and equip profile avatars.
            </p>
          </div>

          <button
            @click="
              openBoutique
            "
            :disabled="
              loading
            "
            class="bg-[#7C3AED] border-4 border-black rounded-2xl px-4 py-3 text-sm font-black text-white shadow-[0_4px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000] disabled:opacity-70"
          >
            OPEN
          </button>
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
              class="text-[0.95rem] font-black text-[#FD9501]"
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
              class="text-[0.95rem] font-black text-[#FF2AA3]"
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
              class="text-[0.95rem] font-black text-[#03B5EC]"
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
    </section>

    <!-- ACTION MODAL -->
    <StoreActionModal
      :show="
        actionModal.show
      "
      :status="
        actionModal.status
      "
      :message="
        actionModal.message
      "
      @close="
        closeActionModal
      "
    />
  </div>
</template>