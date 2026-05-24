```vue id="k8r2qx"
<script setup>
import { ref } from 'vue'

import { useRouter } from 'vue-router'

import { supabase } from '../lib/supabase'

import BottomNavbar from '../components/BottomNavbar.vue'

import AppLoader from '../components/AppLoader.vue'

import { playSound } from '../utils/playSound'

const router = useRouter()

const loading =
  ref(false)

const showDeleteModal =
  ref(false)

const deleteMessage =
  ref('')

/* -----------------------------
   FETCH USERNAME
----------------------------- */

const username =
  localStorage.getItem(
    'examinity_username',
  ) || ''

const isAdmin =
  username ===
  'ADMINDEVELOPER'

/* -----------------------------
   RESET APP
----------------------------- */

const resetApp =
  () => {
    playSound('button')

    localStorage.clear()

    router.push('/')

    window.location.reload()
  }

/* -----------------------------
   LOGOUT
----------------------------- */

const logout =
  () => {
    playSound('button')

    localStorage.clear()

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
      /* USERS */

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

      /* LEADERBOARD */

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

      /* WINNERS */

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

      /* VERSUS */

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

      /* SUCCESS */

      localStorage.clear()

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

        <!-- BUTTONS -->
        <div
          class="mt-6 flex flex-col gap-4"
        >
          <!-- DELETE -->
          <button
            @click="
              deleteAccount
            "
            class="w-full bg-[#FF2AA3] border-4 border-black rounded-2xl py-5 text-white text-xl font-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000] transition-all duration-100"
          >
            YES DELETE
          </button>

          <!-- CANCEL -->
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
            class="w-full bg-[#F3F400] border-4 border-black rounded-2xl py-5 text-black text-xl font-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000] transition-all duration-100"
          >
            CANCEL
          </button>
        </div>

        <!-- ERROR -->
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

        <!-- ACTIVE USER -->
        <div
          class="mt-6 flex justify-center"
        >
          <button
            class="bg-[#F3F400] border-4 border-black rounded-2xl px-6 py-4 text-black text-xl font-black shadow-[0_6px_0_#000]"
          >
            @{{ username }}
          </button>
        </div>
      </div>

      <!-- GAME INFO -->
      <div
        class="mt-8 bg-white border-4 border-black rounded-[2rem] p-6"
      >
        <h2
          class="text-2xl font-black text-center text-[#03B5EC]"
        >
          GAME MODES
        </h2>

        <!-- QUIZBERE -->
        <div
          class="mt-6"
        >
          <h3
            class="text-xl font-black text-[#FF2AA3]"
          >
            Quizbere
          </h3>

          <p
            class="mt-2 text-sm font-bold text-black/70 leading-6"
          >
            A Christian quiz game where you
            answer questions correctly for a
            chance to win amazing prizes.
          </p>
        </div>

        <!-- BRAINDRILL -->
        <div
          class="mt-5"
        >
          <h3
            class="text-xl font-black text-[#03B5EC]"
          >
            Braindrill
          </h3>

          <p
            class="mt-2 text-sm font-bold text-black/70 leading-6"
          >
            Speed focused survival quiz mode.
            Answer fast before time runs out.
          </p>
        </div>

        <!-- CHALLENGE -->
        <div
          class="mt-5"
        >
          <h3
            class="text-xl font-black text-[#FD9501]"
          >
            Challenge
          </h3>

          <p
            class="mt-2 text-sm font-bold text-black/70 leading-6"
          >
            Special challenge modes where
            players earn challenge points and
            compete against others.
          </p>
        </div>
      </div>

      <!-- RESET CARD -->
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
            RESET APP
          </h2>

          <p
            class="mt-3 text-sm font-bold text-black/60 leading-6"
          >
            Clears all quiz progress, unlocked
            levels, scores and saved data.
          </p>

          <button
            @click="
              resetApp
            "
            class="mt-6 w-full bg-[#FD9501] border-4 border-black rounded-2xl py-5 text-black text-xl font-black shadow-[0_6px_0_#000]"
          >
            RESET EVERYTHING
          </button>
        </div>
      </div>

      <!-- LOGOUT -->
      <button
        @click="logout"
        class="mt-6 w-full bg-black border-4 border-black rounded-2xl py-5 text-white text-xl font-black shadow-[0_6px_0_#000]"
      >
        LOGOUT
      </button>

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
        class="mt-4 w-full bg-white border-4 border-black rounded-2xl py-5 text-[#FF2AA3] text-xl font-black shadow-[0_6px_0_#000]"
      >
        DELETE ACCOUNT
      </button>
    </section>

    <BottomNavbar />
  </main>
</template>
```
