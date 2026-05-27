<!-- src/components/TopNav.vue -->

<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'

import {
  FontAwesomeIcon,
} from '@fortawesome/vue-fontawesome'

import {
  faBrain,
  faBolt,
  faTrophy,
  faUser,
} from '@fortawesome/free-solid-svg-icons'

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
   LOCAL DATA
----------------------------- */

const loadLocalData =
  () => {
    /* BRAINDRILL */

    braindrillPoints.value =
      Number(
        localStorage.getItem(
          'braindrill_total_points',
        ),
      ) || 0

    /* CHALLENGE */

    challengePoints.value =
      Number(
        localStorage.getItem(
          'challenge_total_points',
        ),
      ) || 0

    /* RANK */

    const savedRank =
      localStorage.getItem(
        'player_rank',
      )

    ranking.value =
      savedRank
        ? `#${savedRank}`
        : '--'
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

onMounted(() => {
  loadUsername()

  loadLocalData()
})
</script>

<template>
  <header
    class="w-full bg-black border-b-4 border-white px-3 py-3"
  >
    <div
      class="grid grid-cols-4 items-center"
    >
      <!-- PLAYER -->
      <div
        class="flex items-center justify-center gap-1.5"
      >
        <FontAwesomeIcon
          :icon="faUser"
          class="text-[#03B5EC] text-sm"
        />

        <h2
          class="text-[16px] font-black text-white leading-none truncate"
        >
          {{ displayName }}
        </h2>
      </div>

      <!-- BRAINDRILL -->
      <div
        class="flex items-center justify-center gap-1.5"
      >
        <FontAwesomeIcon
          :icon="faBrain"
          class="text-[#FD9501] text-sm"
        />

        <h3
          class="text-[16px] font-black text-white leading-none"
        >
          {{ braindrillPoints }}
        </h3>
      </div>

      <!-- CHALLENGE -->
      <div
        class="flex items-center justify-center gap-1.5"
      >
        <FontAwesomeIcon
          :icon="faBolt"
          class="text-[#FF2AA3] text-sm"
        />

        <h3
          class="text-[16px] font-black text-white leading-none"
        >
          {{ challengePoints }}
        </h3>
      </div>

      <!-- RANK -->
      <div
        class="flex items-center justify-center gap-1.5"
      >
        <FontAwesomeIcon
          :icon="faTrophy"
          class="text-[#F3F400] text-sm"
        />

        <h3
          class="text-[16px] font-black text-white leading-none"
        >
          {{ ranking }}
        </h3>
      </div>
    </div>
  </header>
</template>