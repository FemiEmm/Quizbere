<script setup>
import {
  ref,
  onMounted,
} from 'vue'

import { supabase } from '../lib/supabase'

import TimeWatch from '../components/TimeWatch.vue'

import BottomNavbar from '../components/BottomNavbar.vue'

/* -----------------------------
   STATE
----------------------------- */

const authenticated =
  ref(false)

const loading =
  ref(false)

const users =
  ref([])

const winners =
  ref([])

const adminPassword =
  ref('')

const wrongPassword =
  ref(false)

const refreshCountdown =
  ref(3600)

/* -----------------------------
   LOGIN
----------------------------- */

const login =
  async () => {
    if (
      !adminPassword.value
    ) {
      return
    }

    loading.value =
      true

    wrongPassword.value =
      false

    const {
      data,
    } = await supabase
      .from(
        'examinity_users',
      )
      .select('*')
      .eq(
        'password',
        adminPassword.value,
      )
      .single()

    if (data) {
      authenticated.value =
        true

      fetchData()
    }

    else {
      wrongPassword.value =
        true
    }

    loading.value =
      false
  }

/* -----------------------------
   FETCH USERS
----------------------------- */

const fetchUsers =
  async () => {
    const {
      data,
    } = await supabase
      .from(
        'examinity_leaderboard',
      )
      .select('*')

    if (!data) {
      return
    }

    const ranked =
      data.map(
        (user) => ({
          ...user,

          total_score:
            (user.best_run_score ||
              0) +
            (user.challenge_points ||
              0),
        }),
      )

    ranked.sort(
      (a, b) =>
        b.total_score -
        a.total_score,
    )

    users.value =
      ranked
  }

/* -----------------------------
   FETCH WINNERS
----------------------------- */

const fetchWinners =
  async () => {
    const {
      data,
    } = await supabase
      .from(
        'examinity_winners',
      )
      .select('*')
      .order(
        'created_at',
        {
          ascending: false,
        },
      )

    if (data) {
      winners.value =
        data
    }
  }

/* -----------------------------
   FETCH ALL
----------------------------- */

const fetchData =
  async () => {
    await Promise.all([
      fetchUsers(),

      fetchWinners(),
    ])
  }

/* -----------------------------
   AUTO REFRESH
----------------------------- */

setInterval(() => {
  if (
    authenticated.value
  ) {
    fetchData()

    refreshCountdown.value =
      3600
  }
}, 3600000)

/* -----------------------------
   COUNTDOWN
----------------------------- */

setInterval(() => {
  if (
    refreshCountdown.value >
    0
  ) {
    refreshCountdown.value--
  }
}, 1000)

/* -----------------------------
   FORMAT
----------------------------- */

const formatRefresh =
  () => {
    const hours =
      Math.floor(
        refreshCountdown.value /
          3600,
      )

    const minutes =
      Math.floor(
        (refreshCountdown.value %
          3600) /
          60,
      )

    const seconds =
      refreshCountdown.value %
      60

    return `${hours}H ${minutes}M ${seconds}S`
  }

/* -----------------------------
   MOUNT
----------------------------- */

onMounted(() => {
  document.body.style.overflow =
    'hidden'
})
</script>

<template>
  <main
    class="h-screen overflow-hidden bg-black text-white pb-28"
  >
    <!-- PASSWORD MODAL -->
    <div
      v-if="
        !authenticated
      "
      class="fixed inset-0 z-[999] bg-black flex items-center justify-center px-5"
    >
      <div
        class="w-full max-w-sm border border-[#333] bg-[#111] rounded-3xl p-6"
      >
        <h1
          class="text-3xl font-black text-[#F3F400] text-center"
        >
          ADMIN LOGIN
        </h1>

        <p
          class="mt-3 text-center text-sm text-white/50 font-bold"
        >
          Enter admin password
        </p>

        <!-- INPUT -->
        <input
          v-model="
            adminPassword
          "
          type="password"
          placeholder="Password"
          class="mt-6 w-full bg-black border border-[#333] rounded-2xl px-4 py-4 text-white font-black outline-none"
          @keyup.enter="
            login
          "
        />

        <!-- ERROR -->
        <p
          v-if="
            wrongPassword
          "
          class="mt-3 text-red-500 text-sm font-black text-center"
        >
          WRONG PASSWORD
        </p>

        <!-- BUTTON -->
        <button
          @click="
            login
          "
          class="mt-5 w-full bg-[#F3F400] rounded-2xl py-4 text-black text-lg font-black"
        >
          ENTER
        </button>
      </div>
    </div>

    <!-- ADMIN PAGE -->
    <div
      v-if="
        authenticated
      "
      class="h-full overflow-hidden px-4 py-5"
    >
      <div
        class="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full overflow-hidden"
      >
        <!-- USERS -->
        <section
          class="border border-[#03B5EC] rounded-2xl p-4 bg-[#111] overflow-hidden flex flex-col"
        >
          <h1
            class="text-2xl font-black text-[#03B5EC] shrink-0"
          >
            USERS
          </h1>

          <div
            class="mt-4 flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-hide"
          >
            <div
              v-for="(
                user,
                index
              ) in users"
              :key="user.id"
              class="border border-[#333] rounded-xl p-3 shrink-0"
            >
              <div
                class="flex items-center justify-between"
              >
                <h2
                  class="font-black text-white"
                >
                  #{{
                    index + 1
                  }}
                  {{
                    user.username
                  }}
                </h2>

                <p
                  class="text-[#F3F400] font-black"
                >
                  {{
                    user.total_score
                  }}
                </p>
              </div>

              <div
                class="mt-2 flex items-center justify-between text-xs"
              >
                <p
                  class="text-[#03B5EC]"
                >
                  {{
                    user.league
                  }}
                </p>

                <p
                  class="text-[#FF2AA3]"
                >
                  LVL
                  {{
                    user.highest_level
                  }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- WINNERS -->
        <section
          class="border border-[#FF2AA3] rounded-2xl p-4 bg-[#111] overflow-hidden flex flex-col"
        >
          <h1
            class="text-2xl font-black text-[#FF2AA3] shrink-0"
          >
            WINNERS
          </h1>

          <div
            class="mt-4 flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-hide"
          >
            <div
              v-for="winner in winners"
              :key="winner.id"
              class="border border-[#333] rounded-xl p-3 shrink-0"
            >
              <h2
                class="font-black text-white"
              >
                {{
                  winner.username
                }}
              </h2>

              <div
                class="mt-2 flex items-center justify-between text-xs"
              >
                <p
                  class="text-[#03B5EC]"
                >
                  {{
                    winner.reward
                  }}
                </p>

                <p
                  class="text-[#F3F400]"
                >
                  {{
                    winner.claim_code
                  }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- TIMERS -->
        <section
          class="border border-[#F3F400] rounded-2xl p-4 bg-[#111] overflow-hidden flex flex-col"
        >
          <h1
            class="text-2xl font-black text-[#F3F400]"
          >
            TIMERS
          </h1>

          <!-- LEAGUE TIMER -->
          <div
            class="mt-5"
          >
            <p
              class="text-xs text-white/50 font-black"
            >
              WEEKLY RESET
            </p>

            <div
              class="mt-2"
            >
              <TimeWatch />
            </div>
          </div>

          <!-- REFRESH TIMER -->
          <div
            class="mt-8 border border-[#333] rounded-2xl p-4 text-center"
          >
            <p
              class="text-xs text-white/50 font-black"
            >
              AUTO REFRESH
            </p>

            <h2
              class="mt-2 text-2xl font-black text-[#03B5EC]"
            >
              {{
                formatRefresh()
              }}
            </h2>

            <p
              class="mt-2 text-xs text-white/40"
            >
              REFRESHES USERS + WINNERS
            </p>
          </div>
        </section>
      </div>
    </div>

    <!-- NAV -->
    <BottomNavbar />
  </main>
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