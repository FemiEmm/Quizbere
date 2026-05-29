<script setup>
import {
  computed,
  onMounted,
} from 'vue'

import { useRouter } from 'vue-router'

import { supabase } from '../lib/supabase'

import BottomNavbar from '../components/BottomNavbar.vue'

import { playSound } from '../utils/playSound'

import { syncUserData } from '../utils/syncUserData'

const router =
  useRouter()

/* -----------------------------
   RESULT DATA
----------------------------- */

const result =
  JSON.parse(
    localStorage.getItem(
      'challenge_result',
    ),
  )

if (
  !result
) {
  router.push(
    '/challenge',
  )
}

const username =
  (
    localStorage.getItem(
      'examinity_username',
    ) || 'anonymous'
  )
    .trim()
    .toUpperCase()

/* -----------------------------
   RANDOM HEADMASTER LINES
----------------------------- */

const failLines =
  [
    'Is that all you got?',

    'I expected more.',

    'You folded under pressure.',

    'That was painful to watch.',
  ]

const passLines =
  [
    'Well... how long will you celebrate next?',

    'Not bad. Don’t get comfortable.',

    'You actually impressed me.',

    'You survived. Barely.',
  ]

const randomLine =
  computed(() => {
    const lines =
      result.won
        ? passLines
        : failLines

    return lines[
      Math.floor(
        Math.random() *
          lines.length,
      )
    ]
  })

/* -----------------------------
   MASCOT IMAGE
----------------------------- */

const mascotImage =
  computed(() => {
    return result.won
      ? '/mascot/mascot_win.png'
      : '/mascot/mascot_lose.png'
  })

/* -----------------------------
   UPDATE VERSUS SCORE
----------------------------- */

const updateVersusScore =
  async (
    reward,
  ) => {
    const {
      data,
      error,
    } = await supabase
      .from(
        'versus_matches',
      )
      .select(
        '*',
      )
      .eq(
        'status',
        'active',
      )
      .or(
        `player_one.eq.${username},player_two.eq.${username}`,
      )
      .order(
        'created_at',
        {
          ascending: false,
        },
      )
      .limit(1)

    if (
      error
    ) {
      console.error(
        error,
      )

      return
    }

    const activeMatch =
      data?.[0]

    if (
      !activeMatch
    ) {
      return
    }

    const playerOne =
      String(
        activeMatch.player_one || '',
      )
        .trim()
        .toUpperCase()

    const playerTwo =
      String(
        activeMatch.player_two || '',
      )
        .trim()
        .toUpperCase()

    if (
      playerOne ===
      username
    ) {
      const currentScore =
        Number(
          activeMatch.player_one_score,
        ) || 0

      const {
        error: updateError,
      } = await supabase
        .from(
          'versus_matches',
        )
        .update({
          player_one_score:
            currentScore +
            reward,
        })
        .eq(
          'id',
          activeMatch.id,
        )

      if (
        updateError
      ) {
        console.error(
          updateError,
        )
      }

      return
    }

    if (
      playerTwo ===
      username
    ) {
      const currentScore =
        Number(
          activeMatch.player_two_score,
        ) || 0

      const {
        error: updateError,
      } = await supabase
        .from(
          'versus_matches',
        )
        .update({
          player_two_score:
            currentScore +
            reward,
        })
        .eq(
          'id',
          activeMatch.id,
        )

      if (
        updateError
      ) {
        console.error(
          updateError,
        )
      }
    }
  }

/* -----------------------------
   SAVE CHALLENGE POINTS
----------------------------- */

const saveChallengePoints =
  async () => {
    if (
      !result.won ||
      result.reward <= 0
    ) {
      return
    }

    const reward =
      Number(
        result.reward,
      ) || 0

    if (
      reward <= 0
    ) {
      return
    }

    const {
      data: existingUser,
    } = await supabase
      .from(
        'examinity_leaderboard',
      )
      .select('*')
      .eq(
        'username',
        username,
      )
      .maybeSingle()

    if (
      existingUser
    ) {
      await supabase
        .from(
          'examinity_leaderboard',
        )
        .update({
          challenge_points:
            (existingUser.challenge_points ||
              0) +
            reward,
        })
        .eq(
          'username',
          username,
        )
    }

    else {
      await supabase
        .from(
          'examinity_leaderboard',
        )
        .insert([
          {
            username,

            best_run_score:
              0,

            highest_level:
              1,

            challenge_points:
              reward,
          },
        ])
    }

    /* -----------------------------
       ADD TO ACTIVE VERSUS SCORE
    ----------------------------- */

    await updateVersusScore(
      reward,
    )

    /* -----------------------------
       SYNC LOCAL DATA
    ----------------------------- */

    await syncUserData()
  }

/* -----------------------------
   BUTTONS
----------------------------- */

const replayChallenge =
  () => {
    playSound(
      'button',
    )

    router.push(
      '/challenge/play',
    )
  }

const backToChallenges =
  () => {
    playSound(
      'button',
    )

    router.push(
      '/challenge',
    )
  }

/* -----------------------------
   MOUNT
----------------------------- */

onMounted(async () => {
  if (
    result.won
  ) {
    playSound(
      'pass',
    )
  }

  else {
    playSound(
      'fail',
    )
  }

  await saveChallengePoints()
})
</script>

<template>
  <main
    class="min-h-screen bg-[#F3F400] px-4 py-4 flex items-center justify-center overflow-hidden"
  >
    <section
      class="w-full max-w-md text-center"
    >
      <!-- CHAT -->
      <div
        class="relative inline-block"
      >
        <div
          class="bg-white border-4 border-black rounded-2xl px-4 py-3 w-[260px]"
        >
          <p
            class="text-xs font-black text-black leading-5"
          >
            {{
              randomLine
            }}
          </p>

          <!-- TIP -->
          <div
            class="absolute left-1/2 -bottom-3 -translate-x-1/2 w-5 h-5 bg-white border-r-4 border-b-4 border-black rotate-45"
          />
        </div>
      </div>

      <!-- MASCOT -->
      <div
        class="mt-5 flex justify-center"
      >
        <img
          :src="
            mascotImage
          "
          alt="Mascot"
          class="w-24 object-contain"
        />
      </div>

      <!-- TITLE -->
      <h1
        class="mt-3 text-4xl font-black leading-none"
        :class="
          result.won
            ? 'text-[#03B5EC]'
            : 'text-[#FF2AA3]'
        "
      >
        {{
          result.won
            ? 'YOU WON!'
            : 'YOU LOST!'
        }}
      </h1>

      <!-- CARD -->
      <div
        class="mt-5 bg-white border-4 border-black rounded-[1.7rem] p-4"
      >
        <!-- CHALLENGE -->
        <div>
          <p
            class="text-[10px] font-black text-black/60"
          >
            CHALLENGE
          </p>

          <h2
            class="mt-1 text-2xl font-black text-black leading-tight"
          >
            {{
              result.challengeTitle
            }}
          </h2>
        </div>

        <!-- SCORE -->
        <div
          class="mt-4 flex gap-2"
        >
          <div
            class="flex-1 bg-[#03B5EC] border-4 border-black rounded-2xl py-3"
          >
            <p
              class="text-[9px] font-black text-black/60"
            >
              CORRECT ANSWERS
            </p>

            <h3
              class="mt-1 text-3xl font-black text-white leading-none"
            >
              {{
                result.score
              }}
            </h3>
          </div>

          <div
            class="flex-1 bg-[#FD9501] border-4 border-black rounded-2xl py-3"
          >
            <p
              class="text-[9px] font-black text-black/60"
            >
              REWARD
            </p>

            <h3
              class="mt-1 text-3xl font-black text-black leading-none"
            >
              {{
                result.reward
              }}
            </h3>
          </div>
        </div>
      </div>

      <!-- BUTTONS -->
      <div
        class="mt-5 flex flex-col gap-3"
      >
        <button
          @click="
            replayChallenge
          "
          class="w-full bg-[#FF2AA3] border-4 border-black rounded-2xl py-4 text-white text-lg font-black shadow-[0_5px_0_#000] active:translate-y-[3px] active:shadow-[0_2px_0_#000] transition-all duration-100"
        >
          PLAY AGAIN
        </button>

        <button
          @click="
            backToChallenges
          "
          class="w-full bg-white border-4 border-black rounded-2xl py-4 text-black text-lg font-black shadow-[0_5px_0_#000] active:translate-y-[3px] active:shadow-[0_2px_0_#000] transition-all duration-100"
        >
          BACK
        </button>
      </div>
    </section>

    <BottomNavbar />
  </main>
</template>