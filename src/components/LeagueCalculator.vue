<script setup>
import {
  onMounted,
} from 'vue'

import { supabase } from '../lib/supabase'

/* -----------------------------
   GET LEAGUE
----------------------------- */

const getLeague =
  (rank) => {
    if (rank <= 10) {
      return 'QuizBere Premier League'
    }

    if (rank <= 20) {
      return '2nd Division QuizBere Championship'
    }

    if (rank <= 30) {
      return '3rd Division QuizBere League One'
    }

    if (rank <= 40) {
      return '4th Division QuizBere League Two'
    }

    return '5th Division QuizBere Amateur Division'
  }

/* -----------------------------
   ASSIGN LEAGUES
----------------------------- */

const assignLeagues =
  async () => {
    /* FETCH USERS */

   const {
  data,
  error,
} = await supabase
  .from(
    'examinity_leaderboard',
  )
  .select('*')
  .neq(
    'username',
    'ADMINDEVELOPER',
  )

    if (
      error ||
      !data
    ) {
      return
    }

    /* COMBINE SCORES */

    const players =
      data.map(
        (player) => ({
          ...player,

          total_score:
            (player.best_run_score ||
              0) +
            (player.challenge_points ||
              0),
        }),
      )

    /* SORT */

    players.sort(
      (a, b) =>
        b.total_score -
        a.total_score,
    )

    /* UPDATE USERS */

    for (
      let i = 0;
      i <
      players.length;
      i++
    ) {
      const player =
        players[i]

      const rank =
        i + 1

      const league =
        getLeague(rank)

      await supabase
        .from(
          'examinity_leaderboard',
        )
        .update({
          league,

          rank,

          total_score:
            player.total_score,
        })
        .eq(
          'username',
          player.username,
        )
    }
  }

/* -----------------------------
   MOUNT
----------------------------- */

onMounted(() => {
  assignLeagues()
})
</script>

<template>
  <div class="hidden" />
</template>