<script setup>
import { ref } from 'vue'

import { useRouter } from 'vue-router'

import { supabase } from '../lib/supabase'

import { playSound } from '../utils/playSound'

const router = useRouter()

const username = ref('')

const loading = ref(false)

const errorMessage = ref('')

/* -----------------------------
   MODAL
----------------------------- */

const showModal = ref(false)

const modalMode = ref('')

const confirmedUsername =
  ref('')

/* -----------------------------
   OPEN MODAL
----------------------------- */

const openModal = (
  type,
) => {
  playSound('button')

  modalMode.value = type

  username.value = ''

  errorMessage.value =
    ''

  showModal.value = true
}

/* -----------------------------
   CLOSE MODAL
----------------------------- */

const closeModal = () => {
  playSound('button')

  showModal.value = false
}

/* -----------------------------
   FORCE UPPERCASE
----------------------------- */

const forceUppercase =
  () => {
    username.value =
      username.value.toUpperCase()
  }

/* -----------------------------
   NEW USER
----------------------------- */

const createNewUser =
  async () => {
    playSound('button')

    const cleanUsername =
      username.value.trim()

    /* VALIDATION */

    if (!cleanUsername) {
      errorMessage.value =
        'Username is required.'

      return
    }

    if (
      cleanUsername.length < 5
    ) {
      errorMessage.value =
        'Username must be at least 5 characters.'

      return
    }

    loading.value = true

    errorMessage.value = ''

    /* CHECK EXISTING */

    const {
      data,
      error,
    } = await supabase
      .from(
        'examinity_users',
      )
      .select('*')
      .eq(
        'username',
        cleanUsername,
      )
      .maybeSingle()

    if (error) {
      loading.value =
        false

      errorMessage.value =
        'Something went wrong.'

      return
    }

    /* USER EXISTS */

    if (data) {
      loading.value =
        false

      playSound('fail')

      errorMessage.value =
        'Username already exists.'

      return
    }

    /* CREATE USER */

    const {
      error: insertError,
    } = await supabase
      .from(
        'examinity_users',
      )
      .insert([
        {
          username:
            cleanUsername,
        },
      ])

    loading.value =
      false

    if (insertError) {
      errorMessage.value =
        'Failed to create account.'

      return
    }

    localStorage.setItem(
      'examinity_username',
      cleanUsername,
    )

    playSound('pass')

    router.push('/home')
  }

/* -----------------------------
   LOGIN
----------------------------- */

const loginUser =
  async () => {
    playSound('button')

    const cleanUsername =
      username.value.trim()

    /* VALIDATION */

    if (!cleanUsername) {
      errorMessage.value =
        'Username is required.'

      return
    }

    loading.value = true

    errorMessage.value = ''

    /* CHECK USER */

    const {
      data,
      error,
    } = await supabase
      .from(
        'examinity_users',
      )
      .select('*')
      .eq(
        'username',
        cleanUsername,
      )
      .maybeSingle()

    loading.value =
      false

    if (error) {
      errorMessage.value =
        'Something went wrong.'

      return
    }

    /* USER NOT FOUND */

    if (!data) {
      playSound('fail')

      confirmedUsername.value =
        cleanUsername

      modalMode.value =
        'missing'

      return
    }

    /* LOGIN */

    localStorage.setItem(
      'examinity_username',
      cleanUsername,
    )

    playSound('examinity')

    router.push('/home')
  }

/* -----------------------------
   CREATE FROM MISSING
----------------------------- */

const createFromMissing =
  async () => {
    playSound('button')

    loading.value = true

    const {
      error,
    } = await supabase
      .from(
        'examinity_users',
      )
      .insert([
        {
          username:
            confirmedUsername.value,
        },
      ])

    loading.value =
      false

    if (error) {
      errorMessage.value =
        'Failed to create account.'

      return
    }

    localStorage.setItem(
      'examinity_username',
      confirmedUsername.value,
    )

    playSound('pass')

    router.push('/home')
  }
</script>

<template>
  <main
    class="min-h-screen bg-[#F3F400] px-5 flex items-center justify-center relative overflow-hidden"
  >
    <!-- MODAL -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-5"
    >
      <div
        class="w-full max-w-md bg-white border-4 border-black rounded-[2rem] p-6 text-center shadow-[0_10px_0_#000]"
      >
        <!-- NEW USER -->
        <template
          v-if="
            modalMode ===
            'new'
          "
        >
          <h2
            class="text-4xl font-black text-[#FF2AA3]"
          >
            NEW USER
          </h2>

          <p
            class="mt-5 text-black text-lg font-bold leading-8"
          >
            Create a brand new Examinity
            account.
          </p>

          <!-- INPUT -->
          <input
            v-model="username"
            @input="
              forceUppercase
            "
            type="text"
            placeholder="USERNAME..."
            class="mt-8 w-full bg-[#F5F5F5] border-4 border-black rounded-2xl px-5 py-5 text-xl font-black uppercase outline-none"
          />

          <!-- ERROR -->
          <p
            v-if="
              errorMessage
            "
            class="mt-3 text-sm font-black text-red-500"
          >
            {{
              errorMessage
            }}
          </p>

          <!-- BUTTONS -->
          <div
            class="mt-8 flex gap-4"
          >
            <!-- CANCEL -->
            <button
              @click="
                closeModal
              "
              class="flex-1 bg-[#FF2AA3] text-black text-xl font-black py-4 rounded-2xl border-4 border-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000]"
            >
              CANCEL
            </button>

            <!-- CREATE -->
            <button
              @click="
                createNewUser
              "
              :disabled="
                loading
              "
              class="flex-1 bg-[#FD9501] text-black text-xl font-black py-4 rounded-2xl border-4 border-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000]"
            >
              {{
                loading
                  ? '...'
                  : 'CREATE'
              }}
            </button>
          </div>
        </template>

        <!-- LOGIN -->
        <template
          v-if="
            modalMode ===
            'login'
          "
        >
          <h2
            class="text-4xl font-black text-[#03B5EC]"
          >
            LOG IN
          </h2>

          <p
            class="mt-5 text-black text-lg font-bold leading-8"
          >
            Log into your Examinity
            account.
          </p>

          <!-- INPUT -->
          <input
            v-model="username"
            @input="
              forceUppercase
            "
            type="text"
            placeholder="USERNAME..."
            class="mt-8 w-full bg-[#F5F5F5] border-4 border-black rounded-2xl px-5 py-5 text-xl font-black uppercase outline-none"
          />

          <!-- ERROR -->
          <p
            v-if="
              errorMessage
            "
            class="mt-3 text-sm font-black text-red-500"
          >
            {{
              errorMessage
            }}
          </p>

          <!-- BUTTONS -->
          <div
            class="mt-8 flex gap-4"
          >
            <!-- CANCEL -->
            <button
              @click="
                closeModal
              "
              class="flex-1 bg-[#FF2AA3] text-black text-xl font-black py-4 rounded-2xl border-4 border-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000]"
            >
              CANCEL
            </button>

            <!-- LOGIN -->
            <button
              @click="
                loginUser
              "
              :disabled="
                loading
              "
              class="flex-1 bg-[#03B5EC] text-black text-xl font-black py-4 rounded-2xl border-4 border-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000]"
            >
              {{
                loading
                  ? '...'
                  : 'LOG IN'
              }}
            </button>
          </div>
        </template>

        <!-- USER NOT FOUND -->
        <template
          v-if="
            modalMode ===
            'missing'
          "
        >
          <h2
            class="text-4xl font-black text-[#FF2AA3]"
          >
            USER NOT FOUND
          </h2>

          <p
            class="mt-5 text-black text-lg font-bold leading-8"
          >
            Username

            <span
              class="text-[#03B5EC]"
            >
              {{
                confirmedUsername
              }}
            </span>

            does not exist.

            <br /><br />

            Try again or create a new account.
          </p>

          <!-- BUTTONS -->
          <div
            class="mt-8 flex gap-4"
          >
            <!-- TRY AGAIN -->
            <button
              @click="
                () => {
                  modalMode =
                    'login'

                  username =
                    confirmedUsername
                }
              "
              class="flex-1 bg-[#FF2AA3] text-black text-xl font-black py-4 rounded-2xl border-4 border-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000]"
            >
              TRY AGAIN
            </button>

            <!-- CREATE -->
            <button
              @click="
                createFromMissing
              "
              :disabled="
                loading
              "
              class="flex-1 bg-[#FD9501] text-black text-xl font-black py-4 rounded-2xl border-4 border-black shadow-[0_6px_0_#000] active:translate-y-[3px] active:shadow-[0_3px_0_#000]"
            >
              CREATE
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- MAIN -->
    <section
      class="w-full max-w-md"
    >
      <!-- CARD -->
      <div
        class="bg-white border-4 border-black rounded-[2rem] p-6 text-center"
      >
        <!-- TITLE -->
        <h1
          class="text-5xl font-black text-[#FF2AA3]"
        >
          EXAMINITY
        </h1>

        <!-- TEXT -->
        <p
          class="mt-4 text-black text-base font-bold leading-6"
        >
          Choose how you want to continue.
        </p>

        <!-- NEW USER -->
        <button
          @click="
            openModal(
              'new',
            )
          "
          class="mt-8 w-full bg-[#FD9501] text-black text-2xl font-black py-5 rounded-2xl border-4 border-black shadow-[0_8px_0_#000] active:translate-y-[4px] active:shadow-[0_4px_0_#000]"
        >
          NEW USER
        </button>

        <!-- LOGIN -->
        <button
          @click="
            openModal(
              'login',
            )
          "
          class="mt-5 w-full bg-[#03B5EC] text-black text-2xl font-black py-5 rounded-2xl border-4 border-black shadow-[0_8px_0_#000] active:translate-y-[4px] active:shadow-[0_4px_0_#000]"
        >
          LOG IN
        </button>
      </div>
    </section>
  </main>
</template>