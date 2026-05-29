<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import { supabase } from '../lib/supabase'

import { playSound } from '../utils/playSound'

const props =
  defineProps({
    match: Object,
  })

const emit =
  defineEmits([
    'refresh',
  ])

const router =
  useRouter()

const username =
  (
    localStorage.getItem(
      'examinity_username',
    ) || 'anonymous'
  )
    .trim()
    .toUpperCase()

const loading =
  ref(false)

const activeMatches =
  ref([])

const selectedMatchId =
  ref(
    props.match?.id || null,
  )

let interval =
  null

/* -----------------------------
   SELECTED MATCH
----------------------------- */

const selectedMatch =
  computed(() => {
    return (
      activeMatches.value.find(
        (match) =>
          match.id ===
          selectedMatchId.value,
      ) ||
      activeMatches.value[0] ||
      props.match ||
      null
    )
  })

/* -----------------------------
   PLAYER SCORES
----------------------------- */

const playerOnePoints =
  computed(() => {
    return Number(
      selectedMatch.value?.player_one_score,
    ) || 0
  })

const playerTwoPoints =
  computed(() => {
    return Number(
      selectedMatch.value?.player_two_score,
    ) || 0
  })

/* -----------------------------
   OPPONENT
----------------------------- */

const getOpponent =
  (
    match,
  ) => {
    if (
      !match
    ) {
      return ''
    }

    const playerOne =
      String(
        match.player_one || '',
      )
        .trim()
        .toUpperCase()

    if (
      playerOne ===
      username
    ) {
      return match.player_two
    }

    return match.player_one
  }

const opponent =
  computed(() => {
    return getOpponent(
      selectedMatch.value,
    )
  })

/* -----------------------------
   TAB LABEL
----------------------------- */

const getTabLabel =
  (
    match,
  ) => {
    const opponentName =
      getOpponent(
        match,
      )

    return opponentName || 'MATCH'
  }

/* -----------------------------
   TAB SCORE
----------------------------- */

const getTabScore =
  (
    match,
  ) => {
    const p1 =
      Number(
        match.player_one_score,
      ) || 0

    const p2 =
      Number(
        match.player_two_score,
      ) || 0

    return `${p1} - ${p2}`
  }

/* -----------------------------
   TIME LEFT
----------------------------- */

const getTimeLeft =
  (
    match,
  ) => {
    if (
      !match?.ends_at
    ) {
      return 'MATCH OVER'
    }

    const now =
      new Date()

    const end =
      new Date(
        match.ends_at,
      )

    const diff =
      end - now

    if (
      diff <= 0
    ) {
      return 'MATCH OVER'
    }

    const hours =
      Math.floor(
        diff /
          (
            1000 *
            60 *
            60
          ),
      )

    const minutes =
      Math.floor(
        (
          diff %
          (
            1000 *
            60 *
            60
          )
        ) /
          (
            1000 *
            60
          ),
      )

    return `${hours}H ${minutes}M`
  }

const timeLeft =
  computed(() => {
    return getTimeLeft(
      selectedMatch.value,
    )
  })

/* -----------------------------
   SELECT TAB
----------------------------- */

const selectMatch =
  (
    match,
  ) => {
    playSound(
      'button',
    )

    selectedMatchId.value =
      match.id
  }

/* -----------------------------
   FETCH ACTIVE MATCHES
----------------------------- */

const fetchMatches =
  async () => {
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

    if (
      error
    ) {
      console.error(
        error,
      )

      return
    }

    activeMatches.value =
      data || []

    if (
      activeMatches.value.length ===
      0
    ) {
      emit(
        'refresh',
      )

      return
    }

    const selectedStillExists =
      activeMatches.value.some(
        (match) =>
          match.id ===
          selectedMatchId.value,
      )

    if (
      !selectedStillExists
    ) {
      selectedMatchId.value =
        activeMatches.value[0].id
    }

    await checkExpiredMatches()
  }

/* -----------------------------
   CHECK EXPIRED MATCHES
----------------------------- */

const checkExpiredMatches =
  async () => {
    const now =
      new Date()

    for (
      const match of activeMatches.value
    ) {
      const end =
        new Date(
          match.ends_at,
        )

      if (
        now < end
      ) {
        continue
      }

      let winner =
        'draw'

      const playerOneScore =
        Number(
          match.player_one_score,
        ) || 0

      const playerTwoScore =
        Number(
          match.player_two_score,
        ) || 0

      if (
        playerOneScore >
        playerTwoScore
      ) {
        winner =
          match.player_one
      }

      if (
        playerTwoScore >
        playerOneScore
      ) {
        winner =
          match.player_two
      }

      const {
        error,
      } = await supabase
        .from(
          'versus_matches',
        )
        .update({
          status:
            'completed',

          winner,
        })
        .eq(
          'id',
          match.id,
        )

      if (
        error
      ) {
        console.error(
          error,
        )
      }
    }

    const expiredExists =
      activeMatches.value.some(
        (match) => {
          const end =
            new Date(
              match.ends_at,
            )

          return now >= end
        },
      )

    if (
      expiredExists
    ) {
      emit(
        'refresh',
      )
    }
  }

/* -----------------------------
   EARN POINTS
----------------------------- */

const earnPoints =
  () => {
    playSound(
      'button',
    )

    router.push(
      '/challenge',
    )
  }

/* -----------------------------
   GIVE UP
----------------------------- */

const giveUp =
  async () => {
    if (
      loading.value ||
      !selectedMatch.value
    ) {
      return
    }

    playSound(
      'fail',
    )

    loading.value =
      true

    const {
      error,
    } = await supabase
      .from(
        'versus_matches',
      )
      .update({
        status:
          'completed',

        winner:
          opponent.value,
      })
      .eq(
        'id',
        selectedMatch.value.id,
      )

    loading.value =
      false

    if (
      error
    ) {
      console.error(
        error,
      )

      return
    }

    emit(
      'refresh',
    )
  }

/* -----------------------------
   MOUNT
----------------------------- */

onMounted(() => {
  fetchMatches()

  interval =
    setInterval(() => {
      fetchMatches()
    }, 10000)
})

onBeforeUnmount(() => {
  clearInterval(
    interval,
  )
})
</script>

<template>
  <!-- FULL SCREEN ROOT -->
  <section
    class="fixed inset-0 overflow-y-auto bg-[#101010] text-white"
  >
    <!-- CONTENT -->
    <div
      class="w-full max-w-sm mx-auto px-4 py-5 pb-36"
    >
      <!-- HEADER -->
      <div
        class="flex items-start justify-between gap-3"
      >
        <!-- LEFT -->
        <div>
          <p
            class="text-[10px] uppercase tracking-[0.25em] text-white/40 font-bold"
          >
            Live Match
          </p>

          <h1
            class="mt-1 text-3xl font-black leading-none"
          >
            VERSUS
          </h1>
        </div>

        <!-- TIMER -->
        <div
          class="bg-[#1D1D1D] rounded-2xl px-4 py-3 border border-white/10 shrink-0"
        >
          <p
            class="text-[9px] uppercase text-white/40 font-bold text-center"
          >
            Remaining
          </p>

          <p
            class="mt-1 text-sm font-black text-center"
          >
            {{
              timeLeft
            }}
          </p>
        </div>
      </div>

      <!-- BROWSER STYLE TABS -->
      <div
        v-if="
          activeMatches.length > 1
        "
        class="mt-5 overflow-x-auto scrollbar-hide"
      >
        <div
          class="flex items-end gap-1 min-w-max"
        >
          <button
            v-for="
              match in activeMatches
            "
            :key="
              match.id
            "
            @click="
              selectMatch(
                match,
              )
            "
            class="min-w-[130px] max-w-[150px] border-x-2 border-t-2 border-white/10 rounded-t-2xl px-3 py-3 text-left transition-all duration-100"
            :class="
              selectedMatch?.id === match.id
                ? 'bg-[#181818] text-white border-white/20'
                : 'bg-[#262626] text-white/50'
            "
          >
            <p
              class="text-[8px] font-black uppercase tracking-[0.18em] truncate"
            >
              {{
                getTabLabel(
                  match,
                )
              }}
            </p>

            <p
              class="mt-1 text-xs font-black"
              :class="
                selectedMatch?.id === match.id
                  ? 'text-[#F3F400]'
                  : 'text-white/40'
              "
            >
              {{
                getTabScore(
                  match,
                )
              }}
            </p>
          </button>
        </div>
      </div>

      <!-- MATCH CARD -->
      <div
        v-if="
          selectedMatch
        "
        class="bg-[#181818] border border-white/10 rounded-[2rem] p-5"
        :class="
          activeMatches.length > 1
            ? 'rounded-tl-none'
            : 'mt-6'
        "
      >
        <!-- PLAYER ONE -->
        <div
          class="flex items-center justify-between gap-4"
        >
          <!-- INFO -->
          <div
            class="min-w-0"
          >
            <p
              class="text-[10px] uppercase text-white/40 font-bold"
            >
              PLAYER ONE
            </p>

            <h2
              class="mt-1 text-xl font-black truncate"
            >
              {{
                selectedMatch
                  .player_one
              }}
            </h2>
          </div>

          <!-- SCORE -->
          <div
            class="w-[88px] h-[88px] rounded-3xl bg-[#222222] flex flex-col items-center justify-center shrink-0 px-2"
          >
            <p
              class="text-[9px] uppercase text-white/40 font-bold"
            >
              Score
            </p>

            <h3
              class="mt-1 max-w-full overflow-hidden text-ellipsis text-2xl font-black text-[#67E8F9] leading-none"
            >
              {{
                playerOnePoints
              }}
            </h3>
          </div>
        </div>

        <!-- VS -->
        <div
          class="py-5 flex justify-center"
        >
          <div
            class="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center text-lg font-black"
          >
            VS
          </div>
        </div>

        <!-- PLAYER TWO -->
        <div
          class="flex items-center justify-between gap-4"
        >
          <!-- INFO -->
          <div
            class="min-w-0"
          >
            <p
              class="text-[10px] uppercase text-white/40 font-bold"
            >
              PLAYER TWO
            </p>

            <h2
              class="mt-1 text-xl font-black truncate"
            >
              {{
                selectedMatch
                  .player_two
              }}
            </h2>
          </div>

          <!-- SCORE -->
          <div
            class="w-[88px] h-[88px] rounded-3xl bg-[#222222] flex flex-col items-center justify-center shrink-0 px-2"
          >
            <p
              class="text-[9px] uppercase text-white/40 font-bold"
            >
              Score
            </p>

            <h3
              class="mt-1 max-w-full overflow-hidden text-ellipsis text-2xl font-black text-[#FF82D8] leading-none"
            >
              {{
                playerTwoPoints
              }}
            </h3>
          </div>
        </div>
      </div>

      <!-- NO MATCH FALLBACK -->
      <div
        v-else
        class="mt-6 bg-[#181818] border border-white/10 rounded-[2rem] p-5 text-center"
      >
        <p
          class="text-sm font-black text-white/50"
        >
          No active match found.
        </p>
      </div>

      <!-- BUTTONS -->
      <div
        class="mt-5 flex flex-col gap-3"
      >
        <!-- EARN -->
        <button
          @click="
            earnPoints
          "
          class="h-[56px] rounded-2xl bg-white text-black text-base font-black active:scale-[0.98] transition-all duration-100"
        >
          Earn More Points
        </button>

        <!-- GIVE UP -->
        <button
          @click="
            giveUp
          "
          :disabled="
            loading ||
            !selectedMatch
          "
          class="h-[56px] rounded-2xl bg-[#262626] border border-white/10 text-white text-base font-black active:scale-[0.98] transition-all duration-100 disabled:opacity-50"
        >
          {{
            loading
              ? 'Opening Result...'
              : 'Give Up'
          }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;

  scrollbar-width: none;
}
</style>