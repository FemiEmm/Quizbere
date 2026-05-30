<script setup>
import {
  ref,
  computed,
} from 'vue'

import { useRouter } from 'vue-router'

import { supabase } from '../lib/supabase'

import BottomNavbar from '../components/BottomNavbar.vue'

import AppLoader from '../components/AppLoader.vue'

import MorePage from '../components/MorePage.vue'

import BereStore from '../components/BereStore.vue'

import ProfileView from '../components/ProfileView.vue'

import {
  playSound,
} from '../utils/playSound'

import {
  isSoundMuted,
  setSoundMuted,
  stopAllSounds,
} from '../utils/sounds'

import {
  stopTopicMusic,
} from '../utils/topicMusic'

const router = useRouter()

const loading =
  ref(false)

const showDeleteModal =
  ref(false)

const deleteMessage =
  ref('')

const muted =
  ref(
    isSoundMuted(),
  )

const showBereStore =
  ref(false)

const showProfileView =
  ref(false)

/* -----------------------------
   FETCH USERNAME
----------------------------- */

const username =
  localStorage.getItem(
    'examinity_username',
  ) || ''

const displayUsername =
  computed(() => {
    if (
      username.length > 11
    ) {
      return `${username.slice(0, 11)}...`
    }

    return username
  })

const isAdmin =
  username ===
  'ADMINDEVELOPER'

/* -----------------------------
   PROFILE VIEW
----------------------------- */

const openProfileView =
  () => {
    playSound('button')

    showProfileView.value =
      true
  }

const closeProfileView =
  () => {
    showProfileView.value =
      false
  }

/* -----------------------------
   OPEN STORE
----------------------------- */

const openBereStore =
  () => {
    playSound('button')

    showBereStore.value =
      true
  }

/* -----------------------------
   REPORT FORM
----------------------------- */

const openReportForm =
  () => {
    playSound('button')

    window.open(
      'https://forms.gle/tDSwWE4fEwjJiCALA',
      '_blank',
    )
  }

/* -----------------------------
   CLEAR APP STORAGE
----------------------------- */

const clearAppStorage =
  () => {
    localStorage.removeItem(
      'examinity_username',
    )

    localStorage.removeItem(
      'braindrill_run_score',
    )

    localStorage.removeItem(
      'braindrill_unlocked_level',
    )

    localStorage.removeItem(
      'braindrill_selected_level',
    )

    localStorage.removeItem(
      'selected_challenge',
    )

    localStorage.removeItem(
      'selected_topic',
    )

    localStorage.removeItem(
      'sound_muted',
    )
  }

/* -----------------------------
   TOGGLE SOUND
----------------------------- */

const toggleSound =
  () => {
    const nextState =
      !muted.value

    muted.value =
      nextState

    setSoundMuted(
      nextState,
    )

    if (nextState) {
      stopAllSounds()

      stopTopicMusic()
    }
  }

/* -----------------------------
   EXPLAIN APP
----------------------------- */

const explainApp =
  () => {
    playSound('button')

    router.push(
      '/onboarding',
    )
  }

/* -----------------------------
   RESET APP
----------------------------- */

const resetApp =
  () => {
    playSound('button')

    clearAppStorage()

    router.push('/')

    window.location.reload()
  }

/* -----------------------------
   OPEN ADMIN PAGE
----------------------------- */

const openAdminPage =
  () => {
    playSound('button')

    router.push(
      '/admin-use',
    )
  }

/* -----------------------------
   LOGOUT
----------------------------- */

const logout =
  () => {
    playSound('button')

    clearAppStorage()

    window.location.href =
      '/'
  }

/* -----------------------------
   DELETE ACCOUNT
----------------------------- */

const deleteAccount =
  async () => {
    if (loading.value)
      return

    playSound('fail')

    loading.value =
      true

    deleteMessage.value =
      ''

    try {
      const usersDelete =
        await supabase
          .from(
            'examinity_users',
          )
          .delete()
          .eq(
            'username',
            username,
          )

      if (
        usersDelete.error
      ) {
        throw usersDelete.error
      }

      const leaderboardDelete =
        await supabase
          .from(
            'examinity_leaderboard',
          )
          .delete()
          .eq(
            'username',
            username,
          )

      if (
        leaderboardDelete.error
      ) {
        throw leaderboardDelete.error
      }

      const winnersDelete =
        await supabase
          .from(
            'examinity_winners',
          )
          .delete()
          .eq(
            'username',
            username,
          )

      if (
        winnersDelete.error
      ) {
        throw winnersDelete.error
      }

      const versusDelete =
        await supabase
          .from(
            'versus_matches',
          )
          .delete()
          .or(
            `player_one.eq.${username},player_two.eq.${username}`,
          )

      if (
        versusDelete.error
      ) {
        throw versusDelete.error
      }

      clearAppStorage()

      playSound('pass')

      setTimeout(() => {
        window.location.href =
          '/'
      }, 5000)
    } catch (error) {
      deleteMessage.value =
        'Failed to delete account.'

      loading.value =
        false

      playSound('fail')
    }
  }
</script>

<template>
  <main
    class="min-h-screen bg-[#FF2AA3] pb-28 px-5 pt-8"
  >
    <!-- LOADING -->
    <div
      v-if="loading"
      class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
    >
      <AppLoader />
    </div>

    <!-- STORE -->
    <BereStore
      v-if="
        showBereStore
      "
      @close="
        showBereStore =
          false
      "
    />

    <!-- PROFILE VIEW -->
    <ProfileView
      :show="
        showProfileView
      "
      @close="
        closeProfileView
      "
    />

    <!-- DELETE MODAL -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 z-40 bg-black/60 flex items-center justify-center px-5"
    >
      <div
        class="w-full max-w-sm bg-white border-4 border-black rounded-[2rem] p-6 text-center"
      >
        <h2
          class="text-3xl font-black text-[#FF2AA3]"
        >
          DELETE ACCOUNT?
        </h2>

        <p
          class="mt-4 text-sm font-bold text-black/70 leading-6"
        >
          This permanently removes your
          account, scores, leaderboard
          data and versus matches.
        </p>

        <div
          class="mt-6 flex flex-col gap-4"
        >
          <button
            @click="
              deleteAccount
            "
            class="w-full bg-[#FF2AA3] border-4 border-black rounded-2xl py-5 text-white text-xl font-black shadow-[0_6px_0_#000]"
          >
            YES DELETE
          </button>

          <button
            @click="
              () => {
                if (loading)
                  return

                playSound(
                  'button',
                )

                showDeleteModal =
                  false
              }
            "
            class="w-full bg-[#F3F400] border-4 border-black rounded-2xl py-5 text-black text-xl font-black shadow-[0_6px_0_#000]"
          >
            CANCEL
          </button>
        </div>

        <p
          v-if="
            deleteMessage
          "
          class="mt-5 text-red-500 text-sm font-black"
        >
          {{
            deleteMessage
          }}
        </p>
      </div>
    </div>

    <section
      class="max-w-md mx-auto"
    >
      <!-- HEADER -->
      <div class="text-center">
        <h1
          class="text-5xl font-black text-white"
        >
          SUPPORT
        </h1>

        <!-- USER + MUTE -->
        <div
          class="mt-6 flex gap-3"
        >
          <!-- USER -->
          <button
            @click="
              openProfileView
            "
            class="flex-1 bg-[#F3F400] border-4 border-black rounded-2xl px-4 py-4 text-black text-lg font-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000] transition-all duration-100 truncate"
          >
            @{{ displayUsername }}
          </button>

          <!-- MUTE -->
          <button
            @click="
              toggleSound
            "
            class="w-[110px] bg-[#03B5EC] border-4 border-black rounded-2xl py-4 text-black text-sm font-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000] transition-all duration-100"
          >
            {{
              muted
                ? 'UNMUTE'
                : 'MUTE'
            }}
          </button>
        </div>
      </div>

      <!-- STORE BUTTON -->
      <button
        @click="
          openBereStore
        "
        class="mt-8 w-full bg-[#F3F400] border-4 border-black rounded-[2rem] py-7 px-6 shadow-[0_8px_0_#000] active:translate-y-[4px] active:shadow-[0_4px_0_#000] transition-all duration-100"
      >
        <div
          class="flex items-center justify-between"
        >
          <div
            class="text-left"
          >
            <h2
              class="text-3xl font-black text-[#FF2AA3] leading-none"
            >
              MAMA NO
            </h2>

            <h2
              class="mt-1 text-3xl font-black text-black leading-none"
            >
              CREDIT STORE
            </h2>

            <p
              class="mt-3 text-sm font-bold text-black/70"
            >
              Spend challenge points
              on rewards and bonuses.
            </p>
          </div>

          <img
            src="/mascot/mamanocredit.png"
            alt="Mama No Credit"
            class="w-28 h-28 object-contain shrink-0"
          />
        </div>
      </button>

      <!-- EXPLAIN APP -->
      <button
        @click="
          explainApp
        "
        class="mt-6 w-full bg-white border-4 border-black rounded-2xl py-5 text-black text-xl font-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000] transition-all duration-100"
      >
        EXPLAIN APP
      </button>

      <!-- REPORT + LOGOUT -->
      <div
        class="mt-4 grid grid-cols-2 gap-4"
      >
        <button
          @click="
            openReportForm
          "
          class="bg-[#03B5EC] border-4 border-black rounded-2xl py-5 px-3 text-black text-sm font-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000] transition-all duration-100"
        >
          REPORT
        </button>

        <button
          @click="logout"
          class="bg-black border-4 border-black rounded-2xl py-5 px-3 text-white text-sm font-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000] transition-all duration-100"
        >
          LOGOUT
        </button>
      </div>

      <!-- ADMIN TOOLS -->
      <div
        v-if="isAdmin"
        class="mt-6 bg-white border-4 border-black rounded-[2rem] p-6"
      >
        <div
          class="text-center"
        >
          <h2
            class="text-2xl font-black text-black"
          >
            ADMIN TOOLS
          </h2>

          <p
            class="mt-3 text-sm font-bold text-black/60 leading-6"
          >
            Reset app storage or open the
            admin backend page.
          </p>

          <!-- RESET -->
          <button
            @click="
              resetApp
            "
            class="mt-6 w-full bg-[#FD9501] border-4 border-black rounded-2xl py-5 text-black text-xl font-black shadow-[0_6px_0_#000]"
          >
            RESET EVERYTHING
          </button>

          <!-- ADMIN PAGE -->
          <button
            @click="
              openAdminPage
            "
            class="mt-4 w-full bg-black border-4 border-black rounded-2xl py-5 text-white text-xl font-black shadow-[0_6px_0_#000]"
          >
            ADMIN PAGE
          </button>
        </div>
      </div>

      <MorePage />

      <!-- DELETE ACCOUNT -->
      <button
        @click="
          () => {
            playSound(
              'button',
            )

            showDeleteModal =
              true
          }
        "
        class="mt-16 w-full bg-white border-4 border-black rounded-2xl py-5 text-[#FF2AA3] text-xl font-black shadow-[0_6px_0_#000]"
      >
        DELETE ACCOUNT
      </button>
    </section>

    <BottomNavbar />
  </main>
</template>