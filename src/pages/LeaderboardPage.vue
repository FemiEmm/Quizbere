<script setup>
import {
  onMounted,
  onUnmounted,
  ref,
} from 'vue'

import { Vue3Lottie } from 'vue3-lottie'

import { supabase } from '../lib/supabase'

import BottomNavbar from '../components/BottomNavbar.vue'

import winnerBadge from '../assets/lottie/winner_badge.json'

import { playSound } from '../utils/playSound'

import AppLoader from '../components/AppLoader.vue'

import TimeWatch from '../components/TimeWatch.vue'

import PointLeader from '../components/PointLeader.vue'

import LeagueCalculator from '../components/LeagueCalculator.vue'

const leaderboard =
  ref([])

const loading =
  ref(true)

const currentLeague =
  ref('')

const showWinnerModal =
  ref(false)

const weeklyWinner =
  ref(null)

const winnerWindowInterval =
  ref(null)

const winnerWindowChecked =
  ref(false)

/* -----------------------------
   LEAGUES
----------------------------- */

const leagues =
  [
    'QuizBere Premier League',

    '2nd Division QuizBere Championship',

    '3rd Division QuizBere League One',

    '4th Division QuizBere League Two',

    '5th Division QuizBere Amateur Division',
  ]

const currentLeagueIndex =
  ref(0)

/* -----------------------------
   CURRENT USER
----------------------------- */

const username =
  (
    localStorage.getItem(
      'examinity_username',
    ) || ''
  )
    .trim()
    .toUpperCase()

/* -----------------------------
   ADMIN CHECK
----------------------------- */

const isAdmin =
  username ===
  'ADMINDEVELOPER'

/* -----------------------------
   AVATAR
----------------------------- */

const defaultAvatar =
  'avatar-default.webp'

const defaultAvatarBgColor =
  '#F3F400'

const cleanUsername =
  (name) => {
    return String(
      name || '',
    )
      .trim()
      .toUpperCase()
  }

const cleanAvatar =
  (avatar) => {
    const safeAvatar =
      String(
        avatar ||
          defaultAvatar,
      ).trim()

    return safeAvatar ||
      defaultAvatar
  }

const cleanAvatarBgColor =
  (color) => {
    const safeColor =
      String(
        color ||
          defaultAvatarBgColor,
      ).trim()

    return safeColor ||
      defaultAvatarBgColor
  }

const getAvatarPath =
  (avatar) => {
    return `${import.meta.env.BASE_URL}profile-icons/${cleanAvatar(
      avatar,
    )}`
  }

const getAvatarBgColor =
  (color) => {
    return cleanAvatarBgColor(
      color,
    )
  }

const handleAvatarError =
  (event) => {
    event.target.src =
      `${import.meta.env.BASE_URL}profile-icons/${defaultAvatar}`
  }

/* -----------------------------
   WINNER WINDOW
   WAT = UTC + 1
   Saturday 8pm WAT to Sunday 8am WAT
----------------------------- */

const getWatDate =
  () => {
    const now =
      new Date()

    return new Date(
      now.getTime() +
        60 *
          60 *
          1000,
    )
  }

const isWinnerAnnouncementWindow =
  () => {
    const watDate =
      getWatDate()

    const watDay =
      watDate.getUTCDay()

    const watHour =
      watDate.getUTCHours()

    const isSaturdayNight =
      watDay === 6 &&
      watHour >= 20

    const isSundayMorning =
      watDay === 0 &&
      watHour < 8

    return (
      isSaturdayNight ||
      isSundayMorning
    )
  }

const checkWinnerAnnouncementWindow =
  async () => {
    if (
      winnerWindowChecked.value ||
      showWinnerModal.value
    ) {
      return
    }

    if (
      !currentLeague.value
    ) {
      return
    }

    if (
      !isWinnerAnnouncementWindow()
    ) {
      return
    }

    winnerWindowChecked.value =
      true

    await announceWinner()
  }

const startWinnerWindowWatcher =
  () => {
    checkWinnerAnnouncementWindow()

    winnerWindowInterval.value =
      setInterval(
        () => {
          checkWinnerAnnouncementWindow()
        },
        60000,
      )
  }

const stopWinnerWindowWatcher =
  () => {
    if (
      winnerWindowInterval.value
    ) {
      clearInterval(
        winnerWindowInterval.value,
      )

      winnerWindowInterval.value =
        null
    }
  }

/* -----------------------------
   SET LEAGUE INDEX
----------------------------- */

const setLeagueIndex =
  (
    league,
  ) => {

    const index =
      leagues.indexOf(
        league,
      )

    currentLeagueIndex.value =
      index >= 0
        ? index
        : 0
  }

/* -----------------------------
   FETCH AVATAR DATA
----------------------------- */

const fetchUserAvatarData =
  async (
    usernames,
  ) => {
    const cleanUsernames =
      [
        ...new Set(
          usernames
            .map(
              (name) =>
                cleanUsername(
                  name,
                ),
            )
            .filter(
              Boolean,
            ),
        ),
      ]

    if (
      cleanUsernames.length ===
      0
    ) {
      return {}
    }

    const {
      data,
      error,
    } = await supabase
      .from(
        'examinity_users',
      )
      .select(
        'username, active_avatar, avatar_bg_color',
      )
      .in(
        'username',
        cleanUsernames,
      )

    if (
      error ||
      !data
    ) {
      return {}
    }

    return data.reduce(
      (
        map,
        user,
      ) => {
        const key =
          cleanUsername(
            user.username,
          )

        map[key] = {
          active_avatar:
            cleanAvatar(
              user.active_avatar,
            ),

          avatar_bg_color:
            cleanAvatarBgColor(
              user.avatar_bg_color,
            ),
        }

        return map
      },
      {},
    )
  }

/* -----------------------------
   FETCH LEADERBOARD
----------------------------- */

const fetchLeaderboard =
  async (
    selectedLeague = null,
  ) => {

    loading.value =
      true

    let leagueToFetch =
      selectedLeague

    if (
      !leagueToFetch
    ) {

      const {
        data: currentUser,
      } = await supabase
        .from(
          'examinity_leaderboard',
        )
        .select(
          'league',
        )
        .eq(
          'username',
          username,
        )
        .maybeSingle()

      if (
        currentUser?.league
      ) {
        leagueToFetch =
          currentUser.league
      }

      else {
        leagueToFetch =
          leagues[0]
      }
    }

    currentLeague.value =
      leagueToFetch

    setLeagueIndex(
      leagueToFetch,
    )

    const {
      data,
      error,
    } = await supabase
      .from(
        'examinity_leaderboard',
      )
      .select('*')
      .eq(
        'league',
        currentLeague.value,
      )
      .neq(
        'username',
        'ADMINDEVELOPER',
      )

    if (
      !error &&
      data
    ) {
      const usernames =
        data.map(
          (player) =>
            player.username,
        )

      const avatarMap =
        await fetchUserAvatarData(
          usernames,
        )

      const updatedData =
        data.map(
          (player) => {
            const avatarInfo =
              avatarMap[
                cleanUsername(
                  player.username,
                )
              ] || {}

            return {
              ...player,

              active_avatar:
                avatarInfo.active_avatar ||
                defaultAvatar,

              avatar_bg_color:
                avatarInfo.avatar_bg_color ||
                defaultAvatarBgColor,

              total_score:
                (player.best_run_score ||
                  0) +
                (player.challenge_points ||
                  0),
            }
          },
        )

      updatedData.sort(
        (a, b) =>
          b.total_score -
          a.total_score,
      )

      leaderboard.value =
        updatedData
    }

    else {
      leaderboard.value =
        []
    }

    loading.value =
      false
  }

/* -----------------------------
   ADMIN LEAGUE NAVIGATION
----------------------------- */

const goPreviousLeague =
  () => {

    if (
      !isAdmin
    ) {
      return
    }

    playSound(
      'button',
    )

    const previousIndex =
      currentLeagueIndex.value <= 0
        ? leagues.length - 1
        : currentLeagueIndex.value - 1

    currentLeagueIndex.value =
      previousIndex

    winnerWindowChecked.value =
      false

    fetchLeaderboard(
      leagues[
        previousIndex
      ],
    ).then(() => {
      checkWinnerAnnouncementWindow()
    })
  }

const goNextLeague =
  () => {

    if (
      !isAdmin
    ) {
      return
    }

    playSound(
      'button',
    )

    const nextIndex =
      currentLeagueIndex.value >=
      leagues.length - 1
        ? 0
        : currentLeagueIndex.value + 1

    currentLeagueIndex.value =
      nextIndex

    winnerWindowChecked.value =
      false

    fetchLeaderboard(
      leagues[
        nextIndex
      ],
    ).then(() => {
      checkWinnerAnnouncementWindow()
    })
  }

/* -----------------------------
   ANNOUNCE WINNER
----------------------------- */

const announceWinner =
  async () => {
    if (
      !currentLeague.value
    ) {
      return
    }

    const {
      data,
      error,
    } = await supabase
      .from(
        'examinity_leaderboard',
      )
      .select('*')
      .eq(
        'league',
        currentLeague.value,
      )
      .neq(
        'username',
        'ADMINDEVELOPER',
      )

    if (
      error ||
      !data ||
      data.length === 0
    ) {
      return
    }

    const usernames =
      data.map(
        (player) =>
          player.username,
      )

    const avatarMap =
      await fetchUserAvatarData(
        usernames,
      )

    const rankedPlayers =
      data.map(
        (player) => {
          const avatarInfo =
            avatarMap[
              cleanUsername(
                player.username,
              )
            ] || {}

          return {
            ...player,

            active_avatar:
              avatarInfo.active_avatar ||
              defaultAvatar,

            avatar_bg_color:
              avatarInfo.avatar_bg_color ||
              defaultAvatarBgColor,

            total_score:
              (player.best_run_score ||
                0) +
              (player.challenge_points ||
                0),
          }
        },
      )

    rankedPlayers.sort(
      (a, b) =>
        b.total_score -
        a.total_score,
    )

    weeklyWinner.value =
      rankedPlayers[0]

    playSound(
      'pass',
    )

    showWinnerModal.value =
      true
  }

/* -----------------------------
   MOUNT
----------------------------- */

onMounted(async () => {
  await fetchLeaderboard()

  startWinnerWindowWatcher()
})

onUnmounted(() => {
  stopWinnerWindowWatcher()
})
</script>

<template>
  <main
    class="min-h-screen bg-[#03B5EC] flex justify-center"
  >
    <!-- MOBILE WRAPPER -->
    <div
      class="w-full max-w-md min-h-screen bg-[#03B5EC] pb-28"
    >
      <!-- SILENT LEAGUE CALCULATOR -->
      <LeagueCalculator />

      <!-- HEADER -->
      <div
        class="px-4 pt-6 pb-5 text-center w-full"
      >
        <!-- TITLE -->
        <h1
          class="text-2xl font-black text-white leading-none"
        >
          LEADERBOARD
        </h1>

        <!-- LEAGUE -->
        <div
          class="mt-4"
        >
          <p
            class="text-[10px] font-black text-black/50 uppercase"
          >
            Current League
          </p>

          <div
            v-if="
              isAdmin
            "
            class="mt-2 grid grid-cols-[44px_1fr_44px] gap-2 items-center"
          >
            <!-- PREVIOUS -->
            <button
              @click="
                goPreviousLeague
              "
              class="h-11 bg-white border-4 border-black rounded-xl text-xl font-black text-black shadow-[0_4px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000]"
            >
              ‹
            </button>

            <!-- CURRENT LEAGUE -->
            <h2
              class="min-h-[44px] bg-[#F3F400] border-4 border-black rounded-xl px-2 py-2 text-[0.8rem] font-black text-black leading-tight flex items-center justify-center"
            >
              {{
                currentLeague
              }}
            </h2>

            <!-- NEXT -->
            <button
              @click="
                goNextLeague
              "
              class="h-11 bg-white border-4 border-black rounded-xl text-xl font-black text-black shadow-[0_4px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000]"
            >
              ›
            </button>
          </div>

          <h2
            v-else
            class="mt-1 text-[1rem] font-black text-black leading-tight"
          >
            {{
              currentLeague
            }}
          </h2>
        </div>

        <!-- TIMER -->
        <div
          class="mt-4"
        >
          <TimeWatch
            @time-up="
              announceWinner
            "
          />
        </div>
      </div>

      <section
        class="px-4 pt-5"
      >
        <!-- LOADING -->
        <AppLoader
          v-if="loading"
        />

        <!-- EMPTY -->
        <div
          v-else-if="
            leaderboard.length === 0
          "
          class="mt-2 bg-white border-4 border-black rounded-[2rem] p-6 text-center"
        >
          <h2
            class="text-2xl font-black text-black"
          >
            NO SCORES YET
          </h2>

          <p
            class="mt-2 text-xs font-bold text-black/60"
          >
            Be the first to dominate
            QuizBere.
          </p>
        </div>

        <!-- LEADERBOARD -->
        <div
          v-else
          class="flex flex-col gap-3"
        >
          <!-- #1 PLAYER -->
          <div
            v-if="
              leaderboard[0]
            "
            class="bg-[#F3F400] border-4 border-black rounded-[2rem] px-4 py-4 shadow-[0_6px_0_#000]"
          >
            <div
              class="flex items-center gap-3"
            >
              <!-- WINNER BADGE -->
              <div
                class="w-[80px] flex justify-center shrink-0"
              >
                <Vue3Lottie
                  :animationData="
                    winnerBadge
                  "
                  :height="
                    70
                  "
                  :width="
                    70
                  "
                />
              </div>

              <!-- RIGHT -->
              <div
                class="flex-1 min-w-0 pr-1"
              >
                <!-- TOP -->
                <div
                  class="flex items-center justify-between gap-2"
                >
                  <p
                    class="text-xs font-black text-black/60"
                  >
                    #1 PLAYER
                  </p>

                  <p
                    class="text-xs font-black text-black/60 shrink-0"
                  >
                    LVL
                    {{
                      leaderboard[0]
                        .highest_level
                    }}
                  </p>
                </div>

                <!-- NAME -->
                <h2
                  class="mt-1 text-2xl font-black text-black truncate"
                >
                  {{
                    leaderboard[0]
                      .username
                  }}
                </h2>

                <!-- AVATAR + SCORE -->
                <div
                  class="mt-3 flex items-center gap-3"
                >
                  <!-- AVATAR -->
                  <div
                    class="w-14 h-14 border-4 border-black rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                    :style="{
                      backgroundColor:
                        getAvatarBgColor(
                          leaderboard[0]
                            .avatar_bg_color,
                        ),
                    }"
                  >
                    <img
                      :src="
                        getAvatarPath(
                          leaderboard[0]
                            .active_avatar,
                        )
                      "
                      alt="Leader avatar"
                      class="w-full h-full object-contain"
                      @error="
                        handleAvatarError
                      "
                    />
                  </div>

                  <!-- SCORE -->
                  <div
                    class="bg-white border-4 border-black rounded-2xl px-4 py-2 text-center min-w-[115px]"
                  >
                    <p
                      class="text-[8px] font-black text-[#FF2AA3] leading-none"
                    >
                      TOTAL SCORE
                    </p>

                    <h3
                      class="mt-1 text-2xl font-black text-black leading-none"
                    >
                      {{
                        leaderboard[0]
                          .total_score
                      }}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- OTHER PLAYERS -->
          <div
            v-for="(
              player,
              index
            ) in leaderboard.slice(1)"
            :key="
              player.id
            "
            :class="[
              index >= 6
                ? 'bg-[#FF2AA3] text-white'
                : 'bg-white',

              'border-4 border-black rounded-2xl pl-3 pr-5 py-3 grid grid-cols-[62px_1fr] gap-3 items-center',
            ]"
          >
            <!-- AVATAR CIRCLE -->
            <div
              class="w-14 h-14 border-4 border-black rounded-full overflow-hidden flex items-center justify-center"
              :style="{
                backgroundColor:
                  getAvatarBgColor(
                    player.avatar_bg_color,
                  ),
              }"
            >
              <img
                :src="
                  getAvatarPath(
                    player.active_avatar,
                  )
                "
                alt="Player avatar"
                class="w-full h-full object-contain"
                @error="
                  handleAvatarError
                "
              />
            </div>

            <!-- RIGHT -->
            <div
              class="min-w-0 pr-2"
            >
              <!-- NAME + POSITION -->
              <div
                class="flex items-center gap-2 min-w-0"
              >
                <span
                  :class="[
                    index >= 6
                      ? 'bg-[#F3F400] text-black'
                      : 'bg-black text-white',

                    'shrink-0 px-2 py-1 rounded-lg text-[11px] font-black',
                  ]"
                >
                  #{{
                    index + 2
                  }}
                </span>

                <h2
                  :class="[
                    index >= 6
                      ? 'text-white'
                      : 'text-black',

                    'text-base font-black truncate',
                  ]"
                >
                  {{
                    player.username
                  }}
                </h2>
              </div>

              <!-- LEVEL + SCORE -->
              <div
                class="mt-1 flex items-center justify-between gap-4"
              >
                <p
                  :class="[
                    index >= 6
                      ? 'text-white/80'
                      : 'text-black/60',

                    'text-[12px] font-black',
                  ]"
                >
                  LEVEL
                  {{
                    player.highest_level
                  }}
                </p>

                <p
                  :class="[
                    index >= 6
                      ? 'text-white'
                      : 'text-[#FF2AA3]',

                    'text-[12px] font-black shrink-0',
                  ]"
                >
                  SCORE
                  {{
                    player.total_score
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- WINNER MODAL -->
      <PointLeader
        :show="
          showWinnerModal
        "
        :winner="
          weeklyWinner
        "
        @close="
          showWinnerModal = false
        "
      />

      <!-- NAVBAR -->
      <BottomNavbar />
    </div>
  </main>
</template>