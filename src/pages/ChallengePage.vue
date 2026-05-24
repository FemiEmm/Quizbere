<script setup>
import { useRouter } from 'vue-router'

import BottomNavbar from '../components/BottomNavbar.vue'

import { playSound } from '../utils/playSound'

import {
  trackGame,
} from '../utils/trackGame'

const router = useRouter()

/* -----------------------------
   VERSUS
----------------------------- */

const goToVersus =
  () => {
    playSound('button')

    router.push('/versus')
  }

/* -----------------------------
   TOPIC CHALLENGE
----------------------------- */

const goToTopicChallenge =
  async () => {
    playSound('button')

    await trackGame(
      'challenge_topic',
    )

    router.push(
      '/topic-challenge',
    )
  }

/* -----------------------------
   CHALLENGES
----------------------------- */

const challenges = [
  {
    id: 1,

    title: 'NO MISS ALLOWED',

    mode: 'sudden_death',

    questionCount: 20,

    passMark: 10,

    useTimer: false,

    points: 50,

    pointsPerCorrect: 1,

    questionFolders: ['easy'],

    description:
      'One wrong answer instantly ends your run.',

    color: 'bg-[#FF2AA3]',

    active: true,
  },

  {
    id: 2,

    title: 'SOCCERMANIA',

    mode: 'survival_timer',

    questionCount: 20,

    startingTime: 15,

    timeReward: 3,

    passMark: 10,

    useTimer: true,

    points: 30,

    pointsPerCorrect: 1,

    questionFolders: ['football'],

    description:
      'Football-only questions. No mercy.',

    color: 'bg-[#03B5EC]',

    active: true,
  },

  {
    id: 3,

    title: 'TIMEBOMB',

    mode: 'fixed_timer',

    questionCount: 30,

    startingTime: 60,

    passMark: 15,

    useTimer: true,

    points: 100,

    pointsPerCorrect: 1,

    questionFolders: ['easy', 'mid'],

    description:
      'Answer as many questions as possible before time explodes.',

    color: 'bg-[#FD9501]',

    active: true,
  },

  {
    id: 4,

    title: 'BRAIN MELTDOWN',

    mode: 'speed',

    questionCount: 20,

    startingTime: 3,

    passMark: 10,

    useTimer: true,

    points: 200,

    pointsPerCorrect: 1,

    questionFolders: ['hard', 'extreme'],

    description:
      '3 seconds per question. Think fast.',

    color: 'bg-black',

    active: false,
  },
]

/* -----------------------------
   PLAY CHALLENGE
----------------------------- */

const playChallenge =
  async (
    challenge,
  ) => {
    if (!challenge.active)
      return

    playSound('button')

    await trackGame(
      'challenges',
    )

    localStorage.setItem(
      'selected_challenge',
      JSON.stringify(challenge),
    )

    router.push('/challenge/play')
  }
</script>

<template>
  <main
    class="min-h-screen bg-[#FF2AA3] pb-28 px-4 pt-8"
  >
    <section
      class="max-w-md mx-auto"
    >
      <!-- HEADER -->
      <div class="text-center">
        <h1
          class="text-[2.5rem] font-black text-white leading-none"
        >
          WEEKLY CHALLENGE
        </h1>

        <p
          class="mt-4 text-black text-base font-bold leading-6"
        >
          Special game modes. Bigger pressure.
          Bigger rewards.
        </p>
      </div>

      <!-- VERSUS CARD -->
      <div
        class="mt-8 bg-[#F3F400] border-4 border-black rounded-[2rem] p-5"
      >
        <!-- TOP -->
        <div
          class="flex items-start justify-between gap-4"
        >
          <!-- LEFT -->
          <div>
            <h2
              class="text-3xl font-black text-black leading-none"
            >
              VERSUS MODE
            </h2>

            <p
              class="mt-3 text-sm font-bold text-black/80 leading-6"
            >
              Go head to head against another
              player for days. Highest challenge
              points wins.
            </p>
          </div>

          <!-- ICON -->
          <div
            class="bg-white border-4 border-black rounded-2xl px-4 py-3 min-w-[85px] text-center"
          >
            <p
              class="text-[10px] font-black text-black/60"
            >
              ONLINE
            </p>

            <h3
              class="mt-2 text-2xl font-black text-[#FF2AA3]"
            >
              VS
            </h3>
          </div>
        </div>

        <!-- BUTTON -->
        <button
          @click="goToVersus"
          class="mt-5 w-full bg-[#FF2AA3] text-white border-4 border-black rounded-2xl py-4 text-lg font-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000] transition-all duration-100"
        >
          ENTER VERSUS
        </button>
      </div>

      <!-- TOPIC CHALLENGE -->
      <div
        class="mt-4 bg-[#03B5EC] border-4 border-black rounded-[2rem] p-5"
      >
        <!-- TOP -->
        <div
          class="flex items-start justify-between gap-4"
        >
          <!-- LEFT -->
          <div>
            <h2
              class="text-3xl font-black text-white leading-none"
            >
              PICK A TOPIC
            </h2>

            <p
              class="mt-3 text-sm font-bold text-white/90 leading-6"
            >
              Choose a topic and take a classroom
              style challenge marked by the
              Headmaster himself.
            </p>
          </div>

          <!-- ICON -->
          <div
            class="bg-white border-4 border-black rounded-2xl px-4 py-3 min-w-[85px] text-center"
          >
            <p
              class="text-[10px] font-black text-black/60"
            >
              TEST
            </p>

            <h3
              class="mt-2 text-2xl font-black text-[#03B5EC]"
            >
              10
            </h3>

            <p
              class="text-[10px] font-black text-black/60"
            >
              QUES
            </p>
          </div>
        </div>

        <!-- BUTTON -->
        <button
          @click="
            goToTopicChallenge
          "
          class="mt-5 w-full bg-white text-black border-4 border-black rounded-2xl py-4 text-lg font-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000] transition-all duration-100"
        >
          PICK TOPIC
        </button>
      </div>

      <!-- CHALLENGES -->
      <div
        class="mt-4 flex flex-col gap-4"
      >
        <div
          v-for="challenge in challenges"
          :key="challenge.id"
          class="border-4 border-black rounded-[2rem] p-5"
          :class="[
            challenge.color,
            !challenge.active
              ? 'opacity-60'
              : '',
          ]"
        >
          <!-- TOP -->
          <div
            class="flex items-start justify-between gap-4"
          >
            <!-- LEFT -->
            <div>
              <h2
                class="text-2xl font-black text-white leading-none"
              >
                {{ challenge.title }}
              </h2>

              <p
                class="mt-3 text-sm font-bold text-white/80 leading-6"
              >
                {{ challenge.description }}
              </p>
            </div>

            <!-- REWARD -->
            <div
              class="bg-white border-4 border-black rounded-2xl px-4 py-3 min-w-[85px] text-center"
            >
              <p
                class="text-[10px] font-black text-black/60 leading-none"
              >
                REWARD
              </p>

              <h3
                class="mt-2 text-2xl font-black text-black leading-none"
              >
                {{ challenge.points }}
              </h3>

              <p
                class="mt-1 text-[10px] font-black text-black/60"
              >
                PTS
              </p>
            </div>
          </div>

          <!-- BUTTON -->
          <button
            @click="
              playChallenge(
                challenge,
              )
            "
            class="mt-5 w-full border-4 border-black rounded-2xl py-4 text-lg font-black transition-all duration-100"
            :class="[
              challenge.active
                ? 'bg-[#F3F400] text-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000]'
                : 'bg-gray-300 text-black cursor-not-allowed',
            ]"
          >
            {{
              challenge.active
                ? 'PLAY CHALLENGE'
                : 'COMING SOON'
            }}
          </button>
        </div>
      </div>
    </section>

    <BottomNavbar />
  </main>
</template>