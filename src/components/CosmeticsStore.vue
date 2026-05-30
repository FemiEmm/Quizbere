<!-- src/components/CosmeticsStore.vue -->

<script setup>
import {
  computed,
  onMounted,
  ref,
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

const router =
  useRouter()

/* -----------------------------
   STATE
----------------------------- */

const loading =
  ref(true)

const buying =
  ref(false)

const errorMessage =
  ref('')

const successMessage =
  ref('')

const userCp =
  ref(0)

const activeAvatar =
  ref('avatar-default.webp')

const visibleAvatars =
  ref([])

/* -----------------------------
   USER
----------------------------- */

const username =
  localStorage.getItem(
    'examinity_username',
  ) || ''

/* -----------------------------
   AVATAR STORE ITEMS
----------------------------- */

const avatarItems =
  [
    {
      id: 'avatar-default',
      name: 'Default',
      file: 'avatar-default.webp',
      price: 0,
    },

    {
      id: 'avatar-1',
      name: 'Avatar 1',
      file: 'avatar-1.webp',
      price: 500,
    },

    {
      id: 'avatar-2',
      name: 'Avatar 2',
      file: 'avatar-2.webp',
      price: 500,
    },

    {
      id: 'avatar-3',
      name: 'Avatar 3',
      file: 'avatar-3.webp',
      price: 500,
    },

    {
      id: 'avatar-4',
      name: 'Avatar 4',
      file: 'avatar-4.webp',
      price: 500,
    },

    {
      id: 'avatar-5',
      name: 'Avatar 5',
      file: 'avatar-5.webp',
      price: 500,
    },

    {
      id: 'avatar-6',
      name: 'Avatar 6',
      file: 'avatar-6.webp',
      price: 700,
    },

    {
      id: 'avatar-7',
      name: 'Avatar 7',
      file: 'avatar-7.webp',
      price: 700,
    },

    {
      id: 'avatar-8',
      name: 'Avatar 8',
      file: 'avatar-8.webp',
      price: 500,
    },

    {
      id: 'avatar-9',
      name: 'Avatar 9',
      file: 'avatar-9.webp',
      price: 700,
    },

    {
      id: 'avatar-10',
      name: 'Avatar 10',
      file: 'avatar-10.webp',
      price: 500,
    },

    {
      id: 'avatar-11',
      name: 'Avatar 11',
      file: 'avatar-11.webp',
      price: 1000,
    },

    {
      id: 'avatar-12',
      name: 'Avatar 12',
      file: 'avatar-12.webp',
      price: 1000,
    },

    {
      id: 'avatar-13',
      name: 'Avatar 13',
      file: 'avatar-13.webp',
      price: 1000,
    },

    {
      id: 'avatar-14',
      name: 'Avatar 14',
      file: 'avatar-14.webp',
      price: 850,
    },

    {
      id: 'avatar-15',
      name: 'Avatar 15',
      file: 'avatar-15.webp',
      price: 900,
    },

    {
      id: 'avatar-16',
      name: 'Avatar 16',
      file: 'avatar-16.webp',
      price: 1000,
    },
  ]

/* -----------------------------
   HELPERS
----------------------------- */

const avatarPath =
  (file) => {
    return `${import.meta.env.BASE_URL}profile-icons/${file}`
  }

const defaultAvatarPath =
  computed(() => {
    return `${import.meta.env.BASE_URL}profile-icons/avatar-default.webp`
  })

const handleAvatarError =
  (event) => {
    event.target.src =
      defaultAvatarPath.value
  }

const playBuySound =
  () => {
    const audio =
      new Audio(
        `${import.meta.env.BASE_URL}sounds/buy.mp3`,
      )

    audio
      .play()
      .catch(() => {})
  }

const canAfford =
  (avatar) => {
    return (
      userCp.value >=
      avatar.price
    )
  }

const isActive =
  (avatar) => {
    return (
      activeAvatar.value ===
      avatar.file
    )
  }

const getPriceLabel =
  (avatar) => {
    if (
      avatar.price ===
      0
    ) {
      return 'FREE'
    }

    return `${avatar.price} CP`
  }

const getButtonLabel =
  (avatar) => {
    if (
      isActive(
        avatar,
      )
    ) {
      return 'ACTIVE'
    }

    if (
      avatar.price ===
      0
    ) {
      return 'USE'
    }

    if (
      canAfford(
        avatar,
      )
    ) {
      return 'BUY'
    }

    return 'NO CP'
  }

/* -----------------------------
   SHUFFLE AVATARS
----------------------------- */

const refreshAvatars =
  () => {
    playSound(
      'button',
    )

    successMessage.value =
      ''

    errorMessage.value =
      ''

    visibleAvatars.value =
      [...avatarItems]
        .sort(
          () =>
            Math.random() -
            0.5,
        )
        .slice(
          0,
          9,
        )
  }

/* -----------------------------
   LOAD USER DATA
----------------------------- */

const loadStore =
  async () => {
    if (
      !username
    ) {
      errorMessage.value =
        'No user found.'

      loading.value =
        false

      return
    }

    loading.value =
      true

    errorMessage.value =
      ''

    successMessage.value =
      ''

    const {
      data: userData,
      error: userError,
    } =
      await supabase
        .from(
          'examinity_users',
        )
        .select(
          'username, active_avatar',
        )
        .eq(
          'username',
          username,
        )
        .maybeSingle()

    if (
      userError
    ) {
      errorMessage.value =
        'Could not load avatar data.'

      loading.value =
        false

      return
    }

    activeAvatar.value =
      userData?.active_avatar ||
      'avatar-default.webp'

    const {
      data: leaderboardData,
      error: leaderboardError,
    } =
      await supabase
        .from(
          'examinity_leaderboard',
        )
        .select(
          'username, challenge_points',
        )
        .eq(
          'username',
          username,
        )
        .maybeSingle()

    if (
      leaderboardError
    ) {
      errorMessage.value =
        'Could not load challenge points.'

      loading.value =
        false

      return
    }

    userCp.value =
      leaderboardData?.challenge_points ||
      0

    refreshAvatars()

    loading.value =
      false
  }

/* -----------------------------
   BUY AVATAR
----------------------------- */

const buyAvatar =
  async (avatar) => {
    if (
      buying.value ||
      isActive(
        avatar,
      )
    ) {
      return
    }

    buying.value =
      true

    errorMessage.value =
      ''

    successMessage.value =
      ''

    const {
      data: latestPoints,
      error: latestError,
    } =
      await supabase
        .from(
          'examinity_leaderboard',
        )
        .select(
          'challenge_points',
        )
        .eq(
          'username',
          username,
        )
        .maybeSingle()

    if (
      latestError
    ) {
      errorMessage.value =
        'Could not confirm your CP.'

      buying.value =
        false

      playSound(
        'fail',
      )

      return
    }

    const currentCp =
      latestPoints?.challenge_points ||
      0

    if (
      currentCp <
      avatar.price
    ) {
      userCp.value =
        currentCp

      errorMessage.value =
        'Not enough CP.'

      buying.value =
        false

      playSound(
        'fail',
      )

      return
    }

    const newCp =
      currentCp -
      avatar.price

    if (
      avatar.price >
      0
    ) {
      const {
        error: pointsError,
      } =
        await supabase
          .from(
            'examinity_leaderboard',
          )
          .update({
            challenge_points:
              newCp,
          })
          .eq(
            'username',
            username,
          )

      if (
        pointsError
      ) {
        errorMessage.value =
          'Could not update CP.'

        buying.value =
          false

        playSound(
          'fail',
        )

        return
      }
    }

    const {
      error: avatarError,
    } =
      await supabase
        .from(
          'examinity_users',
        )
        .update({
          active_avatar:
            avatar.file,
        })
        .eq(
          'username',
          username,
        )

    if (
      avatarError
    ) {
      errorMessage.value =
        avatar.price > 0
          ? 'CP was removed, but avatar failed to save.'
          : 'Avatar failed to save.'

      buying.value =
        false

      playSound(
        'fail',
      )

      return
    }

    userCp.value =
      newCp

    activeAvatar.value =
      avatar.file

    successMessage.value =
      avatar.price === 0
        ? 'Default avatar equipped.'
        : 'Avatar bought and equipped.'

    buying.value =
      false

    playBuySound()
  }

/* -----------------------------
   BACK
----------------------------- */

const goBack =
  () => {
    playSound(
      'button',
    )

    router.back()
  }

/* -----------------------------
   MOUNT
----------------------------- */

onMounted(() => {
  loadStore()
})
</script>

<template>
  <main
    class="min-h-screen bg-[#F3F400] px-4 pt-5 pb-28"
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
            goBack
          "
          class="bg-black text-white border-4 border-black rounded-xl px-4 py-3 text-xs font-black shadow-[0_4px_0_#222] active:translate-y-[2px] active:shadow-[0_2px_0_#222]"
        >
          BACK
        </button>

        <h1
          class="text-2xl font-black text-[#FF2AA3]"
        >
          COSMETICS
        </h1>

        <button
          @click="
            refreshAvatars
          "
          class="bg-[#03B5EC] border-4 border-black rounded-xl px-3 py-3 text-xs font-black shadow-[0_4px_0_#000] active:translate-y-[2px] active:shadow-[0_2px_0_#000]"
        >
          REFRESH
        </button>
      </div>

      <!-- LOADING -->
      <div
        v-if="
          loading
        "
        class="mt-8 bg-white border-4 border-black rounded-[2rem] p-8"
      >
        <AppLoader />
      </div>

      <!-- STORE -->
      <div
        v-else
      >
        <!-- CP CARD -->
        <div
          class="mt-5 bg-white border-4 border-black rounded-[2rem] p-4 shadow-[0_6px_0_#000]"
        >
          <p
            class="text-[10px] font-black text-black/50"
          >
            YOUR CHALLENGE POINTS
          </p>

          <div
            class="mt-1 flex items-end justify-between gap-3"
          >
            <h2
              class="text-4xl font-black text-black leading-none"
            >
              {{
                userCp
              }}
            </h2>

            <p
              class="bg-[#FF2AA3] border-4 border-black rounded-xl px-3 py-2 text-xs font-black text-white"
            >
              CP
            </p>
          </div>
        </div>

        <!-- MESSAGES -->
        <p
          v-if="
            errorMessage
          "
          class="mt-4 bg-white border-4 border-black rounded-xl px-4 py-3 text-sm font-black text-red-500"
        >
          {{
            errorMessage
          }}
        </p>

        <p
          v-if="
            successMessage
          "
          class="mt-4 bg-[#22C55E] border-4 border-black rounded-xl px-4 py-3 text-sm font-black text-white"
        >
          {{
            successMessage
          }}
        </p>

        <!-- AVATAR GRID -->
        <div
          class="mt-5 grid grid-cols-3 gap-3"
        >
          <div
            v-for="
              avatar in visibleAvatars
            "
            :key="
              avatar.id
            "
            class="bg-white border-4 border-black rounded-[1.5rem] p-3 shadow-[0_5px_0_#000]"
          >
            <!-- IMAGE -->
            <div
              class="w-full aspect-square bg-[#03B5EC] border-4 border-black rounded-[1.2rem] overflow-hidden flex items-center justify-center"
            >
              <img
                :src="
                  avatarPath(
                    avatar.file,
                  )
                "
                :alt="
                  avatar.name
                "
                class="w-full h-full object-contain"
                @error="
                  handleAvatarError
                "
              />
            </div>

            <!-- PRICE ONLY -->
            <div
              class="mt-3 text-center"
            >
              <p
                class="text-sm font-black text-[#FF2AA3]"
              >
                {{
                  getPriceLabel(
                    avatar,
                  )
                }}
              </p>
            </div>

            <!-- BUTTON -->
            <button
              @click="
                buyAvatar(
                  avatar,
                )
              "
              :disabled="
                buying ||
                isActive(
                  avatar,
                ) ||
                !canAfford(
                  avatar,
                )
              "
              :class="[
                isActive(
                  avatar,
                )
                  ? 'bg-[#22C55E] text-white'
                  : canAfford(
                    avatar,
                  )
                    ? 'bg-[#F3F400] text-black'
                    : 'bg-black/20 text-black/40',

                'mt-3 w-full border-4 border-black rounded-xl py-3 text-[10px] font-black disabled:opacity-80 active:translate-y-[2px]',
              ]"
            >
              {{
                getButtonLabel(
                  avatar,
                )
              }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>