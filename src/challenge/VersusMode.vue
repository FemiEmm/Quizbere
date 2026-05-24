<script setup>
import {
  onMounted,
  ref,
} from 'vue'

import { supabase } from '../lib/supabase'

import BottomNavbar from '../components/BottomNavbar.vue'

import VersusLobby from './VersusLobby.vue'

import VersusActive from './VersusActive.vue'

import VersusResult from './VersusResult.vue'

const username =
  localStorage.getItem(
    'examinity_username',
  ) || 'anonymous'

const loading = ref(true)

const activeMatch =
  ref(null)

/* -----------------------------
   FETCH MATCH
----------------------------- */

const fetchMatch =
  async () => {
    loading.value = true

    const {
      data,
      error,
    } = await supabase
      .from(
        'versus_matches',
      )
      .select('*')
      .or(
        `player_one.eq.${username},player_two.eq.${username}`,
      )
     
      .order(
        'created_at',
        {
          ascending: false,
        },
      )
      .limit(1)

    if (error) {
      console.error(error)
    }

    activeMatch.value =
      data?.[0] || null

    loading.value = false
  }

onMounted(() => {
  fetchMatch()
})
</script>

<template>
  <main
    class="min-h-screen bg-[#03B5EC] pb-28"
  >
    <div
      v-if="loading"
      class="min-h-screen flex items-center justify-center"
    >
      <h1
        class="text-3xl font-black text-white"
      >
        LOADING...
      </h1>
    </div>

    <!-- NO MATCH -->
    <VersusLobby
      v-else-if="
        !activeMatch
      "
      @refresh="fetchMatch"
    />

    <!-- ACTIVE -->
    <VersusActive
      v-else-if="
        activeMatch.status ===
        'active'
      "
      :match="activeMatch"
      @refresh="fetchMatch"
    />

    <!-- RESULT -->
    <VersusResult
      v-else
      :match="activeMatch"
      @refresh="fetchMatch"
    />

    <BottomNavbar />
  </main>
</template>