<script setup>
import {
  computed,
  onMounted,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import BottomNavbar from '../components/BottomNavbar.vue'

import { braindrillLevels } from '../data/braindrillLevels'

import { supabase } from '../lib/supabase'

import { syncUserData } from '../utils/syncUserData'

const router = useRouter()

const level =
  Number(
    localStorage.getItem(
      'braindrill_current_level',
    ),
  ) || 1

const correctAnswers =
  Number(
    localStorage.getItem(
      'braindrill_correct_answers',
    ),
  ) || 0

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
   LEVEL DATA
----------------------------- */

const currentLevel =
  braindrillLevels.find(
    (lvl) => lvl.level === level,
  )

const unlocked =
  correctAnswers >=
  currentLevel.requiredCorrect

/* -----------------------------
   MESSAGES
----------------------------- */

const passMessages = [
  'Not bad. Promotion granted.',

  'You survived the drill.',

  'Sharp work. Move forward.',

  'Acceptable performance.',

  'You earned the next rank.',
]

const failMessages = [
  'Low score. Try again.',

  'You need more practice.',

  'That performance was weak.',

  'Back to training.',

  'Not enough. Repeat the level.',
]

const mascotMessage =
  computed(() => {
    const messages =
      unlocked
        ? passMessages
        : failMessages

    return messages[
      Math.floor(
        Math.random() *
          messages.length,
      )
    ]
  })

/* -----------------------------
   STATUS
----------------------------- */

const resultStatus =
  computed(() => {
    if (unlocked) {
      return 'PASSED: PROMOTION'
    }

    return 'LOW SCORE: TRY AGAIN'
  })

/* -----------------------------
   SAVE SCORE
----------------------------- */

const saveBraindrillScore =
  async () => {
    if (!unlocked) {
      return
    }

    /* DUPLICATE PROTECTION */

    const rewardClaimed =
      localStorage.getItem(
        'reward_claimed',
      ) === 'true'

    if (rewardClaimed) {
      return
    }

    /* CURRENT UNLOCKED LEVEL */

    const currentUnlockedLevel =
      Number(
        localStorage.getItem(
          'braindrill_highest_level',
        ),
      ) || 1

    /* PROTECTED LEVEL */

    const updatedLevel =
      Math.max(
        currentUnlockedLevel,
        level + 1,
      )

    /* FETCH EXISTING USER */

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

    /* UPDATED SCORE */

    const updatedScore =
      (
        existingUser?.best_run_score ||
        0
      ) +
      currentLevel.points

    /* UPDATE LEADERBOARD */

    await supabase
      .from(
        'examinity_leaderboard',
      )
      .update({
        highest_level:
          updatedLevel,

        best_run_score:
          updatedScore,
      })
      .eq(
        'username',
        username,
      )

    /* UPDATE USERS */

    await supabase
      .from(
        'examinity_users',
      )
      .update({
        braindrill_level:
          updatedLevel,
      })
      .eq(
        'username',
        username,
      )

    /* SAVE LOCAL */

    localStorage.setItem(
      'braindrill_unlocked_level',
      String(
        updatedLevel,
      ),
    )

    localStorage.setItem(
      'braindrill_highest_level',
      String(
        updatedLevel,
      ),
    )

    /* REWARD CLAIMED */

    localStorage.setItem(
      'reward_claimed',
      'true',
    )

    /* SYNC USER */

    await syncUserData()
  }

/* -----------------------------
   NEXT LEVEL
----------------------------- */

const nextLevel =
  () => {
    localStorage.setItem(
      'braindrill_selected_level',
      JSON.stringify({
        level:
          level + 1,
      }),
    )

    localStorage.setItem(
      'braindrill_current_level',
      String(
        level + 1,
      ),
    )

    router.push(
      '/braindrill/play',
    )
  }

/* -----------------------------
   BACK
----------------------------- */

const backToDrill =
  () => {
    router.push(
      '/braindrill',
    )
  }

/* -----------------------------
   MOUNT
----------------------------- */

onMounted(
  async () => {
    await saveBraindrillScore()
  },
)
</script>

<template>
  <main
    class="min-h-screen bg-[#F3F400] pb-20 px-3 flex items-center justify-center"
  >
    <section
      class="w-full max-w-[320px] mx-auto"
    >
      <div
        class="relative overflow-hidden bg-white border-4 border-black rounded-[1.6rem] px-4 py-4 text-center"
      >
        <!-- PAPER LINES -->
        <div
          class="absolute inset-0 pointer-events-none opacity-10"
        >
          <div
            v-for="n in 18"
            :key="n"
            class="w-full border-t border-black"
            :style="{
              top: `${n * 24}px`,
              position: 'absolute',
            }"
          />
        </div>

        <!-- TITLE -->
        <h1
          class="relative z-10 text-[1.6rem] font-black text-[#FF2AA3] leading-none"
        >
          LEVEL COMPLETE
        </h1>

        <!-- MASCOT -->
        <div
          class="relative z-10 mt-4 flex items-center justify-center gap-2"
        >
          <img
            src="/mascot/mascot_marking.png"
            alt="Mascot"
            class="w-16 h-24 object-contain shrink-0"
          />

          <div
            class="w-full max-w-[180px] min-h-[66px] bg-white border-4 border-black rounded-[1.3rem] px-3 py-2 flex items-center justify-center relative"
          >
            <div
              class="absolute inset-0 overflow-hidden rounded-[1.3rem] opacity-10 pointer-events-none"
            >
              <div
                v-for="n in 5"
                :key="n"
                class="w-full border-t border-black absolute"
                :style="{
                  top: `${n * 14}px`,
                }"
              />
            </div>

            <p
              class="relative z-10 text-center text-[10px] font-black text-black leading-4"
            >
              {{
                mascotMessage
              }}
            </p>
          </div>
        </div>

        <!-- STATS -->
        <div
          class="relative z-10 mt-4 flex gap-2 items-stretch"
        >
          <!-- LEVEL -->
          <div
            class="flex-1 bg-[#FD9501] border-4 border-black rounded-xl py-2 flex flex-col items-center justify-center"
          >
            <p
              class="text-[8px] font-black text-black/70"
            >
              LEVEL
            </p>

            <h2
              class="mt-1 text-3xl font-black text-black leading-none"
            >
              {{ level }}
            </h2>
          </div>

          <!-- SCORE -->
          <div
            class="flex-1 py-1 flex flex-col items-center justify-center"
          >
            <p
              class="text-[8px] font-black text-black/70"
            >
              FINAL SCORE
            </p>

            <div
              class="mt-1 w-[78px] h-[78px] border-4 border-[#FF2D2D] rounded-full flex flex-col items-center justify-center rotate-[6deg] bg-white"
            >
              <h2
                class="text-[1.4rem] font-black text-[#FF2D2D] leading-none"
              >
                {{ correctAnswers }}
              </h2>

              <p
                class="mt-[2px] text-[10px] font-black text-[#FF2D2D] leading-none"
              >
                /{{ currentLevel.questions }}
              </p>
            </div>
          </div>
        </div>

        <!-- RESULT -->
        <div
          class="relative z-10 mt-3 bg-[#FF2AA3]/15 border-2 border-[#FF2AA3] rounded-xl py-2"
        >
          <p
            class="text-[11px] font-black text-black"
          >
            {{
              resultStatus
            }}
          </p>
        </div>

        <!-- BUTTONS -->
        <div
          class="relative z-10 mt-4 flex gap-2"
        >
          <button
            v-if="
              unlocked &&
              level < 10
            "
            @click="
              nextLevel
            "
            class="flex-1 bg-[#03B5EC] text-black text-sm font-black py-2.5 rounded-xl border-4 border-black shadow-[0_5px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000]"
          >
            NEXT LEVEL
          </button>

          <button
            @click="
              backToDrill
            "
            class="flex-1 bg-[#FD9501] text-black text-sm font-black py-2.5 rounded-xl border-4 border-black shadow-[0_5px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000]"
          >
            BACK
          </button>
        </div>
      </div>
    </section>

    <BottomNavbar />
  </main>
</template>