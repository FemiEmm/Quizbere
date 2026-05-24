<!-- src/components/SpinWheel.vue -->

<script setup>
import {
  computed,
  ref,
} from 'vue'

import {
  supabase,
} from '../lib/supabase'

const props =
  defineProps({
    rewards: {
      type: Array,
      required: true,
    },

    spinning: {
      type: Boolean,
      default: false,
    },
  })

const emit =
  defineEmits([
    'spin-complete',
  ])

/* -----------------------------
   STATE
----------------------------- */

const wheelRotation =
  ref(0)

/* -----------------------------
   COLORS
----------------------------- */

const colors = [
  '#FD9501',
  '#F3F400',
  '#FF2AA3',
  '#03B5EC',
  '#7C3AED',
  '#22C55E',
]

/* -----------------------------
   SEGMENT ANGLE
----------------------------- */

const segmentAngle =
  computed(() => {
    return (
      360 /
      props.rewards.length
    )
  })

/* -----------------------------
   FETCH WINNER DATA
----------------------------- */

const getWinnerStats =
  async () => {
    const { data, error } =
      await supabase
        .from(
          'examinity_winners',
        )
        .select('reward')

    if (error) {
      return {
        totalWinners: 0,
        rewardCounts: {},
      }
    }

    const rewardCounts = {}

    let totalWinners = 0

    data.forEach((item) => {
      const rewardName =
        item.reward
          ?.trim()

      if (
        rewardName !==
        'TRY AGAIN'
      ) {
        totalWinners++
      }

      rewardCounts[
        rewardName
      ] =
        (rewardCounts[
          rewardName
        ] || 0) + 1
    })

    return {
      totalWinners,
      rewardCounts,
    }
  }

/* -----------------------------
   EDGE FUNCTION
----------------------------- */

const fetchReward =
  async () => {
    const {
      totalWinners,
      rewardCounts,
    } =
      await getWinnerStats()

    const response =
      await fetch(
        'https://faembstffgyzizuexxyu.supabase.co/functions/v1/spin-wheel',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            totalWinners,
            rewardCounts,
          }),
        },
      )

    const data =
      await response.json()

    return {
      name:
        data.reward,
    }
  }

/* -----------------------------
   SPIN
----------------------------- */

const spin =
  async () => {
    if (props.spinning)
      return

    /* -----------------------------
       FETCH REWARD
    ----------------------------- */

    const reward =
      await fetchReward()

    /* -----------------------------
       FIND REWARD INDEX
    ----------------------------- */

    const rewardIndex =
      props.rewards.findIndex(
        (r) =>
          r.name.trim() ===
          reward.name.trim(),
      )

    /* -----------------------------
       SAFETY
    ----------------------------- */

    const safeIndex =
      rewardIndex === -1
        ? 0
        : rewardIndex

    /* -----------------------------
       ROTATION
    ----------------------------- */

    const stopAngle =
      safeIndex *
        segmentAngle.value +
      segmentAngle.value / 2

    const finalRotation =
      3600 +
      (360 - stopAngle)

    wheelRotation.value =
      finalRotation

    /* -----------------------------
       COMPLETE
    ----------------------------- */

    setTimeout(() => {
      emit(
        'spin-complete',
        reward,
      )
    }, 4000)
  }

/* -----------------------------
   EXPOSE
----------------------------- */

defineExpose({
  spin,
})
</script>

<template>
  <div
    class="relative w-[320px] h-[320px]"
  >
    <!-- POINTER -->
    <div
      class="absolute left-1/2 -translate-x-1/2 top-[-12px] z-50 w-0 h-0 border-l-[22px] border-r-[22px] border-t-[42px] border-l-transparent border-r-transparent border-t-white"
    />

    <!-- OUTER RING -->
    <div
      class="absolute inset-0 rounded-full bg-white border-[8px] border-black"
    />

    <!-- WHEEL -->
    <div
      class="absolute inset-[10px] rounded-full overflow-hidden border-[4px] border-black transition-transform duration-[4000ms] ease-out"
      :style="{
        transform: `rotate(${wheelRotation}deg)`,
      }"
    >
      <!-- SEGMENTS -->
      <div
        v-for="(
          reward,
          index
        ) in rewards"
        :key="reward.name"
        class="absolute w-1/2 h-1/2 left-1/2 top-0 origin-bottom-left flex items-start justify-center"
        :style="{
          transform: `
            rotate(${
              index *
              segmentAngle
            }deg)
          `,
          clipPath:
            'polygon(0 0, 100% 0, 0 100%)',
          background:
            colors[
              index %
                colors.length
            ],
          border:
            '3px solid #222',
        }"
      >
        <!-- TEXT -->
        <div
          class="absolute top-[30px] left-[22px]"
          :style="{
            transform: `
              rotate(${
                segmentAngle / 2
              }deg)
            `,
          }"
        >
          <span
            class="text-black text-sm font-black"
            style="
              writing-mode: vertical-rl;
              text-orientation: mixed;
            "
          >
            {{
              reward.name
            }}
          </span>
        </div>
      </div>
    </div>

    <!-- CENTER -->
    <div
      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[72px] h-[72px] rounded-full bg-white border-[5px] border-black flex items-center justify-center z-40"
    >
      <span
        class="text-black text-lg font-black"
      >
        SPIN
      </span>
    </div>
  </div>
</template>