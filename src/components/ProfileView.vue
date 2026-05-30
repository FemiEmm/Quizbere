<!-- src/components/ProfileView.vue -->

<script setup>
import {
  computed,
  onMounted,
  ref,
  watch,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import {
  supabase,
} from '../lib/supabase'

import AppLoader from '../components/AppLoader.vue'

import {
  playSound,
} from '../utils/playSound'

const props =
  defineProps({
    show: {
      type: Boolean,
      default: false,
    },
  })

const emit =
  defineEmits([
    'close',
  ])

const router =
  useRouter()

/* -----------------------------
   STATE
----------------------------- */

const loading =
  ref(false)

const savingColor =
  ref(false)

const colorSaved =
  ref(false)

const errorMessage =
  ref('')

const userData =
  ref(null)

const leaderboardData =
  ref(null)

const selectedAvatarBgColor =
  ref('#F3F400')

/* -----------------------------
   USERNAME
----------------------------- */

const username =
  localStorage.getItem(
    'examinity_username',
  ) || ''

/* -----------------------------
   AVATAR
----------------------------- */

const defaultAvatar =
  'avatar-default.webp'

const avatarColors =
  [
    {
      name: 'Yellow',
      value: '#F3F400',
    },

    {
      name: 'Blue',
      value: '#03B5EC',
    },

    {
      name: 'Pink',
      value: '#FF2AA3',
    },

    {
      name: 'Orange',
      value: '#FD9501',
    },

    {
      name: 'Purple',
      value: '#7C3AED',
    },

    {
      name: 'Green',
      value: '#22C55E',
    },

    {
      name: 'Black',
      value: '#000000',
    },

    {
      name: 'White',
      value: '#FFFFFF',
    },
  ]

const activeAvatar =
  computed(() => {
    const avatar =
      userData.value?.active_avatar ||
      defaultAvatar

    return String(
      avatar,
    ).trim()
  })

const avatarPath =
  computed(() => {
    return `${import.meta.env.BASE_URL}profile-icons/${activeAvatar.value}`
  })

const avatarBgColor =
  computed(() => {
    return (
      selectedAvatarBgColor.value ||
      '#F3F400'
    )
  })

const handleAvatarError =
  (event) => {
    event.target.src =
      `${import.meta.env.BASE_URL}profile-icons/${defaultAvatar}`
  }

/* -----------------------------
   PROFILE VALUES
----------------------------- */

const challengePoints =
  computed(() => {
    return (
      leaderboardData.value?.challenge_points ||
      0
    )
  })

const brainDrillPoints =
  computed(() => {
    return (
      leaderboardData.value?.best_run_score ||
      0
    )
  })

const totalScore =
  computed(() => {
    return (
      leaderboardData.value?.total_score ||
      0
    )
  })

const league =
  computed(() => {
    return (
      leaderboardData.value?.league ||
      'Unranked'
    )
  })

const level =
  computed(() => {
    return (
      leaderboardData.value?.highest_level ||
      userData.value?.braindrill_level ||
      1
    )
  })

const rank =
  computed(() => {
    return (
      leaderboardData.value?.rank ||
      '-'
    )
  })

const leagueWins =
  computed(() => {
    return (
      leaderboardData.value?.league_wins ||
      0
    )
  })

const spinToken =
  computed(() => {
    return (
      userData.value?.spin_token ||
      0
    )
  })

/* -----------------------------
   LOAD PROFILE
----------------------------- */

const loadProfile =
  async () => {
    if (
      !username
    ) {
      errorMessage.value =
        'No user found.'

      return
    }

    loading.value =
      true

    errorMessage.value =
      ''

    colorSaved.value =
      false

    userData.value =
      null

    leaderboardData.value =
      null

    const userResult =
      await supabase
        .from(
          'examinity_users',
        )
        .select(
          'username, braindrill_level, spin_token, active_avatar, avatar_bg_color',
        )
        .eq(
          'username',
          username,
        )
        .maybeSingle()

    if (
      userResult.error
    ) {
      errorMessage.value =
        'Could not load user profile.'

      loading.value =
        false

      return
    }

    userData.value =
      userResult.data

    selectedAvatarBgColor.value =
      userResult.data?.avatar_bg_color ||
      '#F3F400'

    const leaderboardResult =
      await supabase
        .from(
          'examinity_leaderboard',
        )
        .select(
          'username, best_run_score, highest_level, challenge_points, rank, total_score, league, league_wins',
        )
        .eq(
          'username',
          username,
        )
        .maybeSingle()

    if (
      leaderboardResult.error
    ) {
      errorMessage.value =
        'Could not load leaderboard data.'

      loading.value =
        false

      return
    }

    leaderboardData.value =
      leaderboardResult.data

    loading.value =
      false
  }

/* -----------------------------
   PICK COLOR
----------------------------- */

const pickAvatarColor =
  (color) => {
    playSound(
      'button',
    )

    selectedAvatarBgColor.value =
      color

    colorSaved.value =
      userData.value?.avatar_bg_color ===
      color
  }

/* -----------------------------
   SAVE COLOR
----------------------------- */

const saveAvatarColor =
  async () => {
    if (
      savingColor.value ||
      !username
    ) {
      return
    }

    savingColor.value =
      true

    errorMessage.value =
      ''

    colorSaved.value =
      false

    const {
      error,
    } =
      await supabase
        .from(
          'examinity_users',
        )
        .update({
          avatar_bg_color:
            selectedAvatarBgColor.value,
        })
        .eq(
          'username',
          username,
        )

    if (
      error
    ) {
      errorMessage.value =
        'Could not save avatar color.'

      savingColor.value =
        false

      playSound(
        'fail',
      )

      return
    }

    userData.value = {
      ...userData.value,

      avatar_bg_color:
        selectedAvatarBgColor.value,
    }

    savingColor.value =
      false

    colorSaved.value =
      true

    playSound(
      'pass',
    )
  }

/* -----------------------------
   REWARD PAGE
----------------------------- */

const goToReward =
  () => {
    playSound(
      'button',
    )

    emit(
      'close',
    )

    router.push(
      '/reward',
    )
  }

/* -----------------------------
   CLOSE
----------------------------- */

const closeProfile =
  () => {
    playSound(
      'button',
    )

    emit(
      'close',
    )
  }

/* -----------------------------
   WATCH
----------------------------- */

watch(
  () =>
    props.show,
  (visible) => {
    if (
      visible
    ) {
      loadProfile()
    }
  },
)

onMounted(() => {
  if (
    props.show
  ) {
    loadProfile()
  }
})
</script>

<template>
  <div
    v-if="
      show
    "
    class="fixed inset-0 z-50 bg-[#FF2AA3] overflow-y-auto"
  >
    <main
      class="min-h-screen px-4 pt-4 pb-24"
    >
      <section
        class="w-full max-w-md mx-auto"
      >
        <!-- TOP BAR -->
        <div
          class="flex items-center justify-between"
        >
          <button
            @click="
              closeProfile
            "
            class="bg-black text-white border-4 border-black rounded-xl px-4 py-2 text-xs font-black shadow-[0_4px_0_#222] active:translate-y-[2px] active:shadow-[0_2px_0_#222]"
          >
            BACK
          </button>

          <h1
            class="text-2xl font-black text-white"
          >
            PROFILE
          </h1>

          <div
            class="w-[62px]"
          ></div>
        </div>

        <!-- LOADING -->
        <div
          v-if="
            loading
          "
          class="mt-6 bg-white border-4 border-black rounded-[2rem] p-6"
        >
          <AppLoader />
        </div>

        <!-- ERROR -->
        <div
          v-else-if="
            errorMessage
          "
          class="mt-6 bg-white border-4 border-black rounded-[2rem] p-5 text-center"
        >
          <h2
            class="text-xl font-black text-[#FF2AA3]"
          >
            PROFILE ERROR
          </h2>

          <p
            class="mt-2 text-sm font-bold text-black/70"
          >
            {{
              errorMessage
            }}
          </p>
        </div>

        <!-- PROFILE CONTENT -->
        <div
          v-else
        >
          <!-- HERO CARD -->
          <div
            class="mt-4 bg-white border-4 border-black rounded-[2rem] p-4 shadow-[0_6px_0_#000]"
          >
            <!-- USER HEADER -->
            <div
              class="flex items-center gap-4"
            >
              <!-- AVATAR -->
              <div
                class="w-28 h-28 border-4 border-black rounded-[1.5rem] overflow-hidden shrink-0"
                :style="{
                  backgroundColor:
                    avatarBgColor,
                }"
              >
                <img
                  :src="
                    avatarPath
                  "
                  alt="Profile avatar"
                  class="w-full h-full object-contain"
                  @error="
                    handleAvatarError
                  "
                />
              </div>

              <!-- NAME + MINI STATS -->
              <div
                class="min-w-0 flex-1"
              >
                <p
                  class="text-[10px] font-black text-black/50"
                >
                  QUIZBERE USER
                </p>

                <h2
                  class="mt-1 text-[1.4rem] font-black text-[#FF2AA3] leading-tight truncate"
                >
                  @{{ username }}
                </h2>

                <div
                  class="mt-3 grid grid-cols-2 gap-2"
                >
                  <div
                    class="bg-[#F3F400] border-4 border-black rounded-xl px-2 py-2 text-center"
                  >
                    <p
                      class="text-[8px] font-black text-black/50"
                    >
                      RANK
                    </p>

                    <h3
                      class="text-base font-black text-black leading-none"
                    >
                      #{{
                        rank
                      }}
                    </h3>
                  </div>

                  <div
                    class="bg-[#03B5EC] border-4 border-black rounded-xl px-2 py-2 text-center"
                  >
                    <p
                      class="text-[8px] font-black text-black/50"
                    >
                      LEVEL
                    </p>

                    <h3
                      class="text-base font-black text-black leading-none"
                    >
                      {{
                        level
                      }}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            <!-- COLOR PICKER -->
            <div
              class="mt-4 bg-[#F8F8F8] border-4 border-black rounded-2xl p-3"
            >
              <div
                class="flex items-center justify-between gap-3"
              >
                <div>
                  <p
                    class="text-[10px] font-black text-black/50"
                  >
                    AVATAR BACKGROUND
                  </p>

                  <h3
                    class="text-sm font-black text-black"
                  >
                    Pick a background
                  </h3>
                </div>

                <button
                  @click="
                    saveAvatarColor
                  "
                  :disabled="
                    savingColor
                  "
                  :class="[
                    colorSaved
                      ? 'bg-[#22C55E] text-white'
                      : 'bg-black text-white',

                    'border-4 border-black rounded-xl px-4 py-2 text-xs font-black disabled:opacity-60 active:translate-y-[2px]',
                  ]"
                >
                  {{
                    savingColor
                      ? 'SAVING'
                      : colorSaved
                        ? 'SAVED'
                        : 'SAVE'
                  }}
                </button>
              </div>

              <div
                class="mt-3 grid grid-cols-4 gap-2"
              >
                <button
                  v-for="
                    color in avatarColors
                  "
                  :key="
                    color.value
                  "
                  @click="
                    pickAvatarColor(
                      color.value,
                    )
                  "
                  class="h-12 rounded-xl border-4 transition-all duration-100 active:scale-95 relative overflow-hidden"
                  :class="
                    selectedAvatarBgColor === color.value
                      ? 'border-black shadow-[0_4px_0_#000] translate-y-[-2px]'
                      : 'border-black/25'
                  "
                  :style="{
                    backgroundColor:
                      color.value,
                  }"
                >
                  <span
                    v-if="
                      selectedAvatarBgColor === color.value
                    "
                    :class="[
                      color.value === '#000000'
                        ? 'text-white'
                        : 'text-black',

                      'absolute inset-0 flex items-center justify-center text-lg font-black',
                    ]"
                  >
                    ✓
                  </span>
                </button>
              </div>
            </div>

            <!-- CURRENT LEAGUE -->
            <div
              class="mt-4 bg-black border-4 border-black rounded-2xl p-3 text-center"
            >
              <p
                class="text-[9px] font-black text-white/60"
              >
                CURRENT LEAGUE
              </p>

              <h3
                class="mt-1 text-sm font-black text-[#F3F400] leading-tight"
              >
                {{
                  league
                }}
              </h3>
            </div>
          </div>

          <!-- COMPACT STATS -->
          <div
            class="mt-4 grid grid-cols-2 gap-3"
          >
            <!-- TOTAL SCORE -->
            <div
              class="bg-[#03B5EC] border-4 border-black rounded-[1.4rem] px-3 py-3 text-center shadow-[0_5px_0_#000]"
            >
              <p
                class="text-[8px] font-black text-black/50"
              >
                TOTAL
              </p>

              <h2
                class="mt-1 text-2xl font-black text-black leading-none"
              >
                {{
                  totalScore
                }}
              </h2>

              <p
                class="mt-1 text-[8px] font-black text-black/50"
              >
                SCORE
              </p>
            </div>

            <!-- LEAGUE WINS -->
            <div
              class="bg-white border-4 border-black rounded-[1.4rem] px-3 py-3 text-center shadow-[0_5px_0_#000]"
            >
              <p
                class="text-[8px] font-black text-[#FF2AA3]"
              >
                LEAGUE
              </p>

              <h3
                class="mt-1 text-2xl font-black text-black leading-none"
              >
                {{
                  leagueWins
                }}
              </h3>

              <p
                class="mt-1 text-[8px] font-black text-black/50"
              >
                WINS
              </p>
            </div>

            <!-- CP -->
            <div
              class="bg-[#F3F400] border-4 border-black rounded-[1.4rem] p-3 text-center shadow-[0_5px_0_#000]"
            >
              <p
                class="text-[8px] font-black text-black/60"
              >
                CP
              </p>

              <h3
                class="mt-1 text-2xl font-black text-black leading-none"
              >
                {{
                  challengePoints
                }}
              </h3>

              <p
                class="mt-1 text-[8px] font-black text-black/50"
              >
                CHALLENGE
              </p>
            </div>

            <!-- BP -->
            <div
              class="bg-[#FF2AA3] border-4 border-black rounded-[1.4rem] p-3 text-center shadow-[0_5px_0_#000]"
            >
              <p
                class="text-[8px] font-black text-white/75"
              >
                BP
              </p>

              <h3
                class="mt-1 text-2xl font-black text-white leading-none"
              >
                {{
                  brainDrillPoints
                }}
              </h3>

              <p
                class="mt-1 text-[8px] font-black text-white/70"
              >
                BRAINDRILL
              </p>
            </div>

            <!-- SPINS BUTTON -->
            <button
              @click="
                goToReward
              "
              class="bg-white border-4 border-black rounded-[1.4rem] p-3 text-center shadow-[0_5px_0_#000] active:translate-y-[3px] active:shadow-[0_2px_0_#000] transition-all duration-100"
            >
              <p
                class="text-[8px] font-black text-black/50"
              >
                SPINS
              </p>

              <h3
                class="mt-1 text-2xl font-black text-black leading-none"
              >
                {{
                  spinToken
                }}
              </h3>

              <p
                class="mt-1 text-[8px] font-black text-[#FF2AA3]"
              >
                CLICK TO SPIN
              </p>
            </button>

            <!-- HIGHEST LEVEL -->
            <div
              class="bg-white border-4 border-black rounded-[1.4rem] p-3 text-center shadow-[0_5px_0_#000]"
            >
              <p
                class="text-[8px] font-black text-black/50"
              >
                HIGHEST
              </p>

              <h3
                class="mt-1 text-2xl font-black text-black leading-none"
              >
                {{
                  level
                }}
              </h3>

              <p
                class="mt-1 text-[8px] font-black text-black/50"
              >
                LEVEL
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>