import {
  serve,
} from 'https://deno.land/std@0.168.0/http/server.ts'

import {
  createClient,
} from 'https://esm.sh/@supabase/supabase-js@2'

/* -----------------------------
   ENV
----------------------------- */

const supabaseUrl =
  Deno.env.get(
    'SUPABASE_URL',
  ) || ''

const supabaseServiceKey =
  Deno.env.get(
    'SUPABASE_SERVICE_ROLE_KEY',
  ) || ''

const supabase =
  createClient(
    supabaseUrl,
    supabaseServiceKey,
  )

/* -----------------------------
   LEAGUES
----------------------------- */

const leagues = [
  'QuizBere Premier League',

  'QuizBere Championship',

  'QuizBere League One',

  'QuizBere League Two',

  'QuizBere Amateur Division',
]

/* -----------------------------
   RESET
----------------------------- */

serve(async () => {
  /* -----------------------------
     PROCESS EACH LEAGUE
  ----------------------------- */

  for (const league of leagues) {
    /* -----------------------------
       GET TOP PLAYER
    ----------------------------- */

    const {
      data: winner,
    } = await supabase
      .from(
        'examinity_leaderboard',
      )
      .select('*')
      .eq(
        'league',
        league,
      )
      .order(
        'best_run_score',
        {
          ascending: false,
        },
      )
      .limit(1)
      .single()

    /* -----------------------------
       ADD LEAGUE WIN
    ----------------------------- */

    if (winner) {
      await supabase
        .from(
          'examinity_leaderboard',
        )
        .update({
          league_wins:
            (winner.league_wins ||
              0) + 1,
        })
        .eq(
          'id',
          winner.id,
        )
    }
  }

  /* -----------------------------
     RESET SCORES
  ----------------------------- */

  await supabase
    .from(
      'examinity_leaderboard',
    )
    .update({
      best_run_score: 0,
    })
    .neq(
      'id',
      0,
    )

  return new Response(
    JSON.stringify({
      success: true,
    }),
  )
})