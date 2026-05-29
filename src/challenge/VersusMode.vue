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
  (
    localStorage.getItem(
      'examinity_username',
    ) || 'anonymous'
  )
    .trim()
    .toUpperCase()

const loading =
  ref(true)

const activeMatch =
  ref(null)

/* -----------------------------
   SHOULD SHOW MATCH
----------------------------- */

const shouldShowMatch =
  (
    match,
  ) => {
    const playerOne =
      String(
        match.player_one || '',
      )
        .trim()
        .toUpperCase()

    const playerTwo =
      String(
        match.player_two || '',
      )
        .trim()
        .toUpperCase()

    /* CURRENT USER IS PLAYER ONE AND HAS CLOSED RESULT */

    if (
      playerOne ===
        username &&
      match.player_one_closed
    ) {
      return false
    }

    /* CURRENT USER IS PLAYER TWO AND HAS CLOSED RESULT */

    if (
      playerTwo ===
        username &&
      match.player_two_closed
    ) {
      return false
    }

    /* DO NOT SHOW FULLY CLOSED MATCHES */

    if (
      match.status ===
      'closed'
    ) {
      return false
    }

    return true
  }

/* -----------------------------
   FETCH MATCH
----------------------------- */

const fetchMatch =
  async () => {
    loading.value =
      true

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
      .limit(10)

    if (
      error
    ) {
      console.error(
        error,
      )

      activeMatch.value =
        null

      loading.value =
        false

      return
    }

    const visibleMatch =
      data?.find(
        (match) =>
          shouldShowMatch(
            match,
          ),
      )

    activeMatch.value =
      visibleMatch || null

    loading.value =
      false
  }

/* -----------------------------
   MOUNT
----------------------------- */

onMounted(() => {
  fetchMatch()
})
</script>

<template>
  <main
    class="min-h-screen bg-[#03B5EC] pb-28"
  >
    <!-- LOADING -->
    <div
      v-if="
        loading
      "
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
      @refresh="
        fetchMatch
      "
    />

    <!-- ACTIVE MATCH -->
    <VersusActive
      v-else-if="
        activeMatch.status ===
        'active'
      "
      :match="
        activeMatch
      "
      @refresh="
        fetchMatch
      "
    />

    <!-- RESULT MATCH -->
    <VersusResult
      v-else-if="
        activeMatch.status ===
        'completed'
      "
      :match="
        activeMatch
      "
      @refresh="
        fetchMatch
      "
    />

    <!-- FALLBACK -->
    <VersusLobby
      v-else
      @refresh="
        fetchMatch
      "
    />

    <BottomNavbar />
  </main>
</template>