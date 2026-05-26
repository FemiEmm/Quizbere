<!-- src/components/TopNav.vue -->

<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'

import { supabase } from '../lib/supabase'

/* -----------------------------
   USER
----------------------------- */

const username =
  ref('Player')

/* -----------------------------
   SCORES
----------------------------- */

const braindrillPoints =
  ref(0)

const challengePoints =
  ref(0)

const ranking =
  ref('--')

/* -----------------------------
   USERNAME
----------------------------- */

const loadUsername =
  () => {
    username.value =
      localStorage.getItem(
        'examinity_username',
      ) || 'Player'
  }

/* -----------------------------
   LOCAL POINTS
----------------------------- */

const loadLocalPoints =
  () => {
    /* BRAINDRILL POINTS */

    braindrillPoints.value =
      Number(
        localStorage.getItem(
          'braindrill_total_points',
        ),
      ) || 0

    /* CHALLENGE POINTS */

    challengePoints.value =
      Number(
        localStorage.getItem(
          'challenge_total_points',
        ),
      ) || 0
  }

/* -----------------------------
   RANKING
----------------------------- */

const loadRanking =
  async () => {
    try {
      const {
        data,
        error,
      } = await supabase
        .from(
          'examinity_leaderboard',
        )
        .select(
          'username, best_run_score',
        )
        .order(
          'best_run_score',
          {
            ascending: false,
          },
        )

      if (
        error ||
        !data
      ) {
        return
      }

      const userIndex =
        data.findIndex(
          (user) =>
            user.username ===
            username.value,
        )

      if (
        userIndex !== -1
      ) {
        ranking.value =
          `#${userIndex + 1}`
      }
    } catch (err) {
      console.error(err)
    }
  }

/* -----------------------------
   DISPLAY
----------------------------- */

const displayName =
  computed(() => {
    return username.value
      .slice(0, 10)
      .toUpperCase()
  })

/* -----------------------------
   MOUNT
----------------------------- */

onMounted(async () => {
  loadUsername()

  loadLocalPoints()

  await loadRanking()
})
</script>

<template>
  <header
    class="w-full bg-black border-b-4 border-white px-3 py-3"
  >
    <div
      class="grid grid-cols-4 gap-2"
    >
      <!-- PLAYER -->
      <div
        class="text-center"
      >
        <p
          class="text-[8px] font-black text-white/50 leading-none"
        >
          PLAYER
        </p>

        <h2
          class="mt-1 text-[11px] font-black text-white leading-none truncate"
        >
          {{ displayName }}
        </h2>
      </div>

      <!-- BRAINDRILL -->
      <div
        class="text-center"
      >
        <p
          class="text-[8px] font-black text-white/50 leading-none"
        >
          BRAIN
        </p>

        <h3
          class="mt-1 text-[11px] font-black text-white leading-none"
        >
          {{ braindrillPoints }}
        </h3>
      </div>

      <!-- CHALLENGE -->
      <div
        class="text-center"
      >
        <p
          class="text-[8px] font-black text-white/50 leading-none"
        >
          CHALLENGE
        </p>

        <h3
          class="mt-1 text-[11px] font-black text-white leading-none"
        >
          {{ challengePoints }}
        </h3>
      </div>

      <!-- RANK -->
      <div
        class="text-center"
      >
        <p
          class="text-[8px] font-black text-white/50 leading-none"
        >
          RANK
        </p>

        <h3
          class="mt-1 text-[11px] font-black text-white leading-none"
        >
          {{ ranking }}
        </h3>
      </div>
    </div>
  </header>
</template>