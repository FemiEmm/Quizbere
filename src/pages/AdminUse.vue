<script setup>
import {
  ref,
  onMounted,
  onBeforeUnmount,
  computed,
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

const refreshing =
  ref(false)

const refreshStatus =
  ref('idle')

/* -----------------------------
   CP MANAGER STATE
----------------------------- */

const userSearch =
  ref('')

const selectedUser =
  ref(null)

const cpAmount =
  ref('')

const cpLoading =
  ref(false)

const cpStatus =
  ref('idle')

const cpMessage =
  ref('')

let autoRefreshInterval =
  null

let countdownInterval =
  null

let refreshStatusTimeout =
  null

let cpStatusTimeout =
  null

/* -----------------------------
   SEARCHED USERS
----------------------------- */

const searchedUsers =
  computed(() => {
    const search =
      userSearch.value
        .trim()
        .toUpperCase()

    if (
      !search
    ) {
      return []
    }

    return users.value
      .filter(
        (user) =>
          user.username
            ?.toUpperCase()
            .includes(
              search,
            ),
      )
      .slice(
        0,
        6,
      )
  })

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

      await fetchData()
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
      error,
    } = await supabase
      .from(
        'examinity_leaderboard',
      )
      .select('*')

    if (
      error ||
      !data
    ) {
      throw error || new Error(
        'Unable to fetch users',
      )
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
      error,
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

    if (
      error ||
      !data
    ) {
      throw error || new Error(
        'Unable to fetch winners',
      )
    }

    winners.value =
      data
  }

/* -----------------------------
   REFRESH STATUS
----------------------------- */

const setRefreshStatus =
  (
    status,
  ) => {
    refreshStatus.value =
      status

    clearTimeout(
      refreshStatusTimeout,
    )

    if (
      status === 'success' ||
      status === 'error'
    ) {
      refreshStatusTimeout =
        setTimeout(() => {
          refreshStatus.value =
            'idle'
        }, 1200)
    }
  }

/* -----------------------------
   CP STATUS
----------------------------- */

const setCpStatus =
  (
    status,
    message = '',
  ) => {
    cpStatus.value =
      status

    cpMessage.value =
      message

    clearTimeout(
      cpStatusTimeout,
    )

    if (
      status === 'success' ||
      status === 'error'
    ) {
      cpStatusTimeout =
        setTimeout(() => {
          cpStatus.value =
            'idle'

          cpMessage.value =
            ''
        }, 2500)
    }
  }

/* -----------------------------
   FETCH ALL
----------------------------- */

const fetchData =
  async () => {
    if (
      refreshing.value
    ) {
      return
    }

    refreshing.value =
      true

    setRefreshStatus(
      'loading',
    )

    try {
      await Promise.all([
        fetchUsers(),

        fetchWinners(),
      ])

      refreshCountdown.value =
        3600

      setRefreshStatus(
        'success',
      )
    }

    catch (error) {
      console.error(
        error,
      )

      setRefreshStatus(
        'error',
      )
    }

    finally {
      refreshing.value =
        false
    }
  }

/* -----------------------------
   MANUAL REFRESH
----------------------------- */

const refreshColumns =
  async () => {
    await fetchData()
  }

/* -----------------------------
   SELECT USER
----------------------------- */

const selectUser =
  (
    user,
  ) => {
    selectedUser.value =
      user

    userSearch.value =
      user.username

    setCpStatus(
      'idle',
      '',
    )
  }

/* -----------------------------
   CLEAR CP FORM
----------------------------- */

const clearCpForm =
  () => {
    selectedUser.value =
      null

    userSearch.value =
      ''

    cpAmount.value =
      ''

    setCpStatus(
      'idle',
      '',
    )
  }

/* -----------------------------
   ADD CP
----------------------------- */

const addCpToUser =
  async () => {
    if (
      cpLoading.value
    ) {
      return
    }

    if (
      !selectedUser.value
    ) {
      setCpStatus(
        'error',
        'Select a user first.',
      )

      return
    }

    const amount =
      Number(
        cpAmount.value,
      )

    if (
      !amount ||
      amount <= 0
    ) {
      setCpStatus(
        'error',
        'Enter a valid CP amount.',
      )

      return
    }

    cpLoading.value =
      true

    setCpStatus(
      'loading',
      'Adding CP...',
    )

    try {
      const {
        data: user,
        error: fetchError,
      } = await supabase
        .from(
          'examinity_leaderboard',
        )
        .select(
          'id, username, challenge_points',
        )
        .eq(
          'id',
          selectedUser.value.id,
        )
        .single()

      if (
        fetchError ||
        !user
      ) {
        throw fetchError || new Error(
          'User not found',
        )
      }

      const currentCp =
        Number(
          user.challenge_points,
        ) || 0

      const newCp =
        currentCp +
        amount

      const {
        error: updateError,
      } = await supabase
        .from(
          'examinity_leaderboard',
        )
        .update({
          challenge_points:
            newCp,
        })
        .eq(
          'id',
          selectedUser.value.id,
        )

      if (
        updateError
      ) {
        throw updateError
      }

      await fetchData()

      const refreshedUser =
        users.value.find(
          (item) =>
            item.id ===
            selectedUser.value.id,
        )

      selectedUser.value =
        refreshedUser || {
          ...selectedUser.value,

          challenge_points:
            newCp,
        }

      cpAmount.value =
        ''

      setCpStatus(
        'success',
        `${amount} CP added to ${user.username}.`,
      )
    }

    catch (error) {
      console.error(
        error,
      )

      setCpStatus(
        'error',
        'Could not add CP. Try again.',
      )
    }

    finally {
      cpLoading.value =
        false
    }
  }

/* -----------------------------
   AUTO REFRESH
----------------------------- */

const startAutoRefresh =
  () => {
    autoRefreshInterval =
      setInterval(() => {
        if (
          authenticated.value
        ) {
          fetchData()
        }
      }, 3600000)
  }

/* -----------------------------
   COUNTDOWN
----------------------------- */

const startCountdown =
  () => {
    countdownInterval =
      setInterval(() => {
        if (
          refreshCountdown.value >
          0
        ) {
          refreshCountdown.value--
        }
      }, 1000)
  }

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

  startAutoRefresh()

  startCountdown()
})

/* -----------------------------
   UNMOUNT
----------------------------- */

onBeforeUnmount(() => {
  document.body.style.overflow =
    ''

  clearInterval(
    autoRefreshInterval,
  )

  clearInterval(
    countdownInterval,
  )

  clearTimeout(
    refreshStatusTimeout,
  )

  clearTimeout(
    cpStatusTimeout,
  )
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
          {{
            loading
              ? 'CHECKING...'
              : 'ENTER'
          }}
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
                class="flex items-center justify-between gap-3"
              >
                <h2
                  class="font-black text-white truncate"
                >
                  #{{
                    index + 1
                  }}
                  {{
                    user.username
                  }}
                </h2>

                <p
                  class="text-[#F3F400] font-black shrink-0"
                >
                  {{
                    user.total_score
                  }}
                </p>
              </div>

              <div
                class="mt-2 flex items-center justify-between text-xs gap-3"
              >
                <p
                  class="text-[#03B5EC] truncate"
                >
                  {{
                    user.league
                  }}
                </p>

                <p
                  class="text-[#FF2AA3] shrink-0"
                >
                  LVL
                  {{
                    user.highest_level
                  }}
                </p>
              </div>

              <div
                class="mt-2 flex items-center justify-between text-xs"
              >
                <p
                  class="text-white/40"
                >
                  CP
                </p>

                <p
                  class="text-green-400 font-black"
                >
                  {{
                    user.challenge_points || 0
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
                class="mt-2 flex items-center justify-between text-xs gap-3"
              >
                <p
                  class="text-[#03B5EC] truncate"
                >
                  {{
                    winner.reward
                  }}
                </p>

                <p
                  class="text-[#F3F400] shrink-0"
                >
                  {{
                    winner.claim_code
                  }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- TIMERS / LIVE CONTROLS -->
        <section
          class="border border-[#F3F400] rounded-2xl p-4 bg-[#111] overflow-hidden flex flex-col"
        >
          <div
            class="flex items-center justify-between gap-3 shrink-0"
          >
            <h1
              class="text-2xl font-black text-[#F3F400]"
            >
              TIMERS
            </h1>

            <!-- LIVE STATUS -->
            <div
              class="flex items-center gap-2"
            >
              <span
                class="w-3 h-3 rounded-full bg-green-500 animate-pulse"
              />

              <span
                class="text-xs font-black text-green-400"
              >
                LIVE
              </span>
            </div>
          </div>

          <div
            class="mt-4 flex-1 overflow-y-auto scrollbar-hide pr-1"
          >
            <!-- REFRESH BUTTON -->
            <button
              @click="
                refreshColumns
              "
              :disabled="
                refreshing
              "
              :class="[
                refreshStatus === 'success'
                  ? 'bg-[#F3F400] text-black animate-pulse'
                  : refreshStatus === 'error'
                    ? 'bg-red-600 text-white animate-pulse'
                    : refreshStatus === 'loading'
                      ? 'bg-[#03B5EC] text-black animate-pulse'
                      : 'bg-white text-black',
              ]"
              class="w-full border-4 border-black rounded-2xl py-4 text-sm font-black shadow-[0_5px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000] disabled:opacity-80"
            >
              {{
                refreshStatus === 'error'
                  ? 'REFRESH ERROR'
                  : refreshing
                    ? 'REFRESHING...'
                    : 'REFRESH USERS + WINNERS'
              }}
            </button>

            <!-- CP MANAGER -->
            <div
              class="mt-5 border border-[#333] rounded-2xl p-4"
            >
              <h2
                class="text-lg font-black text-green-400"
              >
                ADD CP TO USER
              </h2>

              <p
                class="mt-1 text-xs text-white/40 font-bold"
              >
                Search username and credit challenge points.
              </p>

              <!-- SEARCH -->
              <input
                v-model="
                  userSearch
                "
                type="text"
                placeholder="Search username"
                class="mt-4 w-full bg-black border border-[#333] rounded-xl px-3 py-3 text-white text-sm font-black outline-none"
              />

              <!-- RESULTS -->
              <div
                v-if="
                  searchedUsers.length > 0 &&
                  !selectedUser
                "
                class="mt-3 flex flex-col gap-2"
              >
                <button
                  v-for="user in searchedUsers"
                  :key="
                    user.id
                  "
                  @click="
                    selectUser(
                      user,
                    )
                  "
                  class="w-full border border-[#333] rounded-xl px-3 py-2 text-left"
                >
                  <div
                    class="flex items-center justify-between gap-3"
                  >
                    <p
                      class="text-sm font-black text-white truncate"
                    >
                      {{
                        user.username
                      }}
                    </p>

                    <p
                      class="text-xs font-black text-green-400 shrink-0"
                    >
                      CP
                      {{
                        user.challenge_points || 0
                      }}
                    </p>
                  </div>
                </button>
              </div>

              <!-- SELECTED USER -->
              <div
                v-if="
                  selectedUser
                "
                class="mt-3 border border-green-500 rounded-xl p-3"
              >
                <div
                  class="flex items-center justify-between gap-3"
                >
                  <div
                    class="min-w-0"
                  >
                    <p
                      class="text-xs text-white/40 font-black"
                    >
                      SELECTED
                    </p>

                    <h3
                      class="text-base font-black text-white truncate"
                    >
                      {{
                        selectedUser.username
                      }}
                    </h3>
                  </div>

                  <button
                    @click="
                      clearCpForm
                    "
                    class="w-8 h-8 rounded-lg bg-red-600 text-white font-black"
                  >
                    ×
                  </button>
                </div>

                <div
                  class="mt-3 grid grid-cols-2 gap-2 text-xs"
                >
                  <div
                    class="border border-[#333] rounded-xl p-2"
                  >
                    <p
                      class="text-white/40 font-black"
                    >
                      CURRENT CP
                    </p>

                    <p
                      class="mt-1 text-green-400 font-black"
                    >
                      {{
                        selectedUser.challenge_points || 0
                      }}
                    </p>
                  </div>

                  <div
                    class="border border-[#333] rounded-xl p-2"
                  >
                    <p
                      class="text-white/40 font-black"
                    >
                      TOTAL SCORE
                    </p>

                    <p
                      class="mt-1 text-[#F3F400] font-black"
                    >
                      {{
                        selectedUser.total_score || 0
                      }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- CP AMOUNT -->
              <input
                v-model="
                  cpAmount
                "
                type="number"
                min="1"
                placeholder="CP amount"
                class="mt-3 w-full bg-black border border-[#333] rounded-xl px-3 py-3 text-white text-sm font-black outline-none"
              />

              <!-- ADD BUTTON -->
              <button
                @click="
                  addCpToUser
                "
                :disabled="
                  cpLoading ||
                  !selectedUser
                "
                :class="[
                  cpStatus === 'success'
                    ? 'bg-green-500 text-black animate-pulse'
                    : cpStatus === 'error'
                      ? 'bg-red-600 text-white animate-pulse'
                      : cpStatus === 'loading'
                        ? 'bg-[#03B5EC] text-black animate-pulse'
                        : 'bg-green-400 text-black',
                ]"
                class="mt-3 w-full border-4 border-black rounded-2xl py-3 text-sm font-black shadow-[0_5px_0_#000] disabled:opacity-50"
              >
                {{
                  cpLoading
                    ? 'ADDING CP...'
                    : 'ADD CP'
                }}
              </button>

              <!-- STATUS MESSAGE -->
              <p
                v-if="
                  cpMessage
                "
                :class="[
                  cpStatus === 'error'
                    ? 'text-red-400'
                    : 'text-green-400',
                ]"
                class="mt-3 text-xs font-black text-center"
              >
                {{
                  cpMessage
                }}
              </p>
            </div>

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