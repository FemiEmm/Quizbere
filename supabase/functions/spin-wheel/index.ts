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
   CORS
----------------------------- */

const corsHeaders = {
  'Access-Control-Allow-Origin':
    '*',

  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

/* -----------------------------
   REWARDS
----------------------------- */

const rewards = [
  {
    name: 'TRY AGAIN',
    probability: 30,
  },

  {
    name: '1GB DATA',
    probability: 10,
  },

  {
    name: '2GB DATA',
    probability: 0,
  },

  {
    name: '₦500',
    probability: 0,
  },

  {
    name: '100 POINTS',
    probability: 30,
  },

  {
    name: '500 POINTS',
    probability: 20,
  },

  {
    name: '1000 POINTS',
    probability: 10,
  },

  {
    name: '₦100,000',
    probability: 0,
  },
]

serve(async (req) => {
  /* -----------------------------
     OPTIONS
  ----------------------------- */

  if (
    req.method ===
    'OPTIONS'
  ) {
    return new Response(
      'ok',
      {
        headers:
          corsHeaders,
      },
    )
  }

  /* -----------------------------
     CHECK TOTAL WINNERS
  ----------------------------- */

  const {
    count,
  } = await supabase
    .from(
      'examinity_winners',
    )
    .select('*', {
      count: 'exact',
      head: true,
    })

  /* -----------------------------
     FORCE TRY AGAIN
  ----------------------------- */

  if (
    (count || 0) >=
    10
  ) {
    return new Response(
      JSON.stringify({
        reward:
          'TRY AGAIN',
      }),
      {
        headers: {
          ...corsHeaders,

          'Content-Type':
            'application/json',
        },
      },
    )
  }

  /* -----------------------------
     FILTER ACTIVE REWARDS
  ----------------------------- */

  const activeRewards =
    rewards.filter(
      (reward) =>
        reward.probability >
        0,
    )

  /* -----------------------------
     TOTAL
  ----------------------------- */

  const total =
    activeRewards.reduce(
      (
        sum,
        reward,
      ) =>
        sum +
        reward.probability,
      0,
    )

  /* -----------------------------
     RANDOM
  ----------------------------- */

  let random =
    Math.random() *
    total

  /* -----------------------------
     PICK
  ----------------------------- */

  for (const reward of activeRewards) {
    random -=
      reward.probability

    if (random <= 0) {
      return new Response(
        JSON.stringify({
          reward:
            reward.name,
        }),
        {
          headers: {
            ...corsHeaders,

            'Content-Type':
              'application/json',
          },
        },
      )
    }
  }

  /* -----------------------------
     FALLBACK
  ----------------------------- */

  return new Response(
    JSON.stringify({
      reward:
        'TRY AGAIN',
    }),
    {
      headers: {
        ...corsHeaders,

        'Content-Type':
          'application/json',
      },
    },
  )
})